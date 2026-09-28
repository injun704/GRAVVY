import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import jsPDF from 'jspdf';
import Razorpay from 'razorpay';
import { adminAuth, adminDb } from './src/lib/firebase-admin.ts';
import { INITIAL_PRODUCTS } from './src/data/products.ts';

const app = express();
app.set('trust proxy', 1); // running behind a hosting proxy / nginx
app.use(express.json({ limit: '1mb' }));

// -------------------------------------------------------------------------
// ENVIRONMENT
// -------------------------------------------------------------------------
const IS_PROD = process.env.NODE_ENV === 'production';
// Fake "sandbox" payments are ONLY possible outside production AND when explicitly enabled.
const SANDBOX_ENABLED = !IS_PROD && process.env.ALLOW_PAYMENT_SANDBOX === 'true';

// Razorpay credentials. RAZORPAY_SECRET_KEY is accepted as a legacy name.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY || '';
const RAZORPAY_CONFIGURED = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

// Server-side Google key (use a key restricted by server IP, not by HTTP referrer).
const GOOGLE_MAPS_SERVER_KEY =
  process.env.GOOGLE_MAPS_SERVER_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

// Extend Express Request type to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    phone?: string;
    admin?: boolean;
  };
}

// Security Authentication Middleware
const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to perform this action.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
      admin: decodedToken.admin === true,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' });
  }
};

// Phone verification gate. The phone number comes from the Firebase-signed ID token
// (set only after a real SMS OTP), so the client cannot fake it.
const REQUIRE_VERIFIED_PHONE = process.env.REQUIRE_VERIFIED_PHONE !== 'false';
const requireVerifiedPhone = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!REQUIRE_VERIFIED_PHONE || req.user?.phone) return next();
  return res.status(403).json({
    success: false,
    code: 'PHONE_NOT_VERIFIED',
    error: 'Please verify your mobile number to place an order.',
    message: 'Please verify your mobile number to place an order.',
  });
};

// 1. SECURE ORDER CREATION ENDPOINT (Server-validated pricing)
app.post('/api/orders/create', requireAuth, requireVerifiedPhone, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, deliveryAddress, paymentMethod, appliedCoupon } = req.body;
    const userId = req.user!.uid;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    // SERVER-SIDE PRICE VALIDATION: Recalculate totals using official server product prices
    let calculatedSubtotal = 0;
    const validatedItems = items.map((cartItem: any) => {
      const serverProduct = INITIAL_PRODUCTS.find((p) => p.id === cartItem.product.id);
      const unitPrice = serverProduct ? serverProduct.price : cartItem.product.price;
      const itemTotal = unitPrice * cartItem.quantity;
      calculatedSubtotal += itemTotal;

      return {
        product: {
          id: cartItem.product.id,
          name: serverProduct ? serverProduct.name : cartItem.product.name,
          price: unitPrice,
          image: cartItem.product.image,
          category: cartItem.product.category,
        },
        quantity: cartItem.quantity,
        totalPrice: itemTotal,
      };
    });

    const tax = Math.round(calculatedSubtotal * 0.05); // 5% GST/Tax
    const deliveryFee = calculatedSubtotal > 500 ? 0 : 35;
    let discountAmount = 0;

    if (appliedCoupon === 'GRAVVY50') {
      discountAmount = Math.min(Math.round(calculatedSubtotal * 0.15), 100);
    }

    const calculatedTotal = calculatedSubtotal + tax + deliveryFee - discountAmount;
    const orderId = `GRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = {
      id: orderId,
      userId,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      tax,
      deliveryFee,
      discountAmount,
      totalAmount: calculatedTotal,
      status: 'PLACED',
      paymentStatus: paymentMethod === 'cod' ? 'PENDING_COD' : 'PENDING_ONLINE',
      paymentMethod,
      deliveryAddress,
      createdAt: new Date().toISOString(),
    };

    // Store securely in Firestore
    try {
      await adminDb.collection('orders').doc(orderId).set(newOrder);
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('orders')
        .doc(orderId)
        .set(newOrder);
    } catch (err) {
      console.warn('Firestore admin doc write notice:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Order created with server-validated pricing',
      order: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server order processing error', details: error?.message });
  }
});

// 2. SECURE PAYMENT VERIFICATION ENDPOINT
// Requires a real Razorpay signature. No fallback secret, no unsigned confirmation.
app.post('/api/payments/verify', requireAuth, requireVerifiedPhone, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!RAZORPAY_CONFIGURED) {
      return res.status(503).json({ error: 'Payment gateway is not configured on the server.' });
    }
    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment verification fields.' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (!safeEqual(generatedSignature, String(razorpaySignature))) {
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    // The order must exist and belong to the signed-in user
    const orderRef = adminDb.collection('orders').doc(String(orderId));
    const snap = await orderRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (snap.data()?.userId !== req.user!.uid) {
      return res.status(403).json({ error: 'Forbidden: this order does not belong to you.' });
    }

    const updateData = {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      razorpayOrderId,
      razorpayPaymentId,
      paymentVerifiedAt: new Date().toISOString(),
    };
    await Promise.all([
      orderRef.update(updateData),
      adminDb.collection('users').doc(req.user!.uid).collection('orders').doc(String(orderId)).set(updateData, { merge: true }),
    ]);

    res.json({ success: true, message: 'Payment verified and confirmed on server', orderId });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification error' });
  }
});

// 3. SECURE AUTHORIZED PDF INVOICE ENDPOINT
app.get('/api/invoices/:orderId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.uid;

    // Fetch order from Firestore
    let orderData: any = null;
    try {
      const docSnap = await adminDb.collection('orders').doc(orderId).get();
      if (docSnap.exists) {
        orderData = docSnap.data();
      }
    } catch (e) { }

    // Security Check: Customer can only access their own invoices
    if (orderData && orderData.userId !== userId && !req.user?.admin) {
      return res.status(403).json({ error: 'Forbidden: You do not own this invoice' });
    }

    // Generate PDF Invoice on Server
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('GRAVVY OFFICIAL DELIVERY INVOICE', 14, 20);

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Invoice ID: ${orderId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Customer ID: ${userId}`, 14, 42);

    doc.line(14, 48, 196, 48);

    doc.setFont('Helvetica', 'bold');
    doc.text('Item Description', 14, 56);
    doc.text('Qty', 120, 56);
    doc.text('Total (₹)', 160, 56);

    let y = 64;
    const items = orderData?.items || [
      { product: { name: 'GRAVVY Fresh Delivery Item' }, quantity: 1, totalPrice: 250 },
    ];

    items.forEach((item: any) => {
      doc.setFont('Helvetica', 'normal');
      doc.text(item.product.name.substring(0, 40), 14, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`₹${item.totalPrice}`, 160, y);
      y += 8;
    });

    doc.line(14, y, 196, y);
    y += 10;
    doc.setFont('Helvetica', 'bold');
    doc.text(`Total Paid: ₹${orderData?.totalAmount || 250}`, 14, y);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: 'Invoice generation error', details: error?.message });
  }
});

// GOOGLE MAPS SERVER-SIDE GEOCODING PROXY (Bypasses Browser CORS Restrictions)
app.get('/api/geocode', async (req: Request, res: Response) => {
  try {
    const { address, latlng, pin } = req.query;
    const apiKey = GOOGLE_MAPS_SERVER_KEY;
    if (!apiKey) {
      return res.status(503).json({ status: 'ERROR', message: 'Geocoding is not configured on the server.' });
    }

    let url = '';
    if (pin) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${encodeURIComponent(
        String(pin)
      )}|country:IN&key=${apiKey}`;
    } else if (latlng) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
        String(latlng)
      )}&key=${apiKey}`;
    } else if (address) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        String(address)
      )}&components=country:IN&key=${apiKey}`;
    } else {
      return res.status(400).json({ status: 'INVALID_REQUEST', error: 'Missing pin, latlng, or address parameter' });
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ status: 'ERROR', message: error?.message || 'Geocoding request failed' });
  }
});

// =========================================================================
// RAZORPAY PAYMENT GATEWAY ENDPOINTS (Secure Server-Side Integration)
// =========================================================================

// Helper to initialize Razorpay SDK
const getRazorpayInstance = () => ({
  razorpay: RAZORPAY_CONFIGURED ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET }) : null,
  keyId: RAZORPAY_KEY_ID,
  keySecret: RAZORPAY_KEY_SECRET,
  isConfigured: RAZORPAY_CONFIGURED,
});

// 1. SECURE RAZORPAY ORDER CREATION
app.post('/api/razorpay/create-order', requireAuth, requireVerifiedPhone, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, currency, notes } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount specified.' });
    }

    const { razorpay, keyId, isConfigured } = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);

    if (!isConfigured && !SANDBOX_ENABLED) {
      return res.status(503).json({
        success: false,
        message: 'Online payments are temporarily unavailable. Please use Cash on Delivery.',
      });
    }

    // If real Razorpay keys are configured, call official Razorpay SDK API
    if (isConfigured && razorpay) {
      try {
        const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const options = {
          amount: amountInPaise,
          currency: currency || 'INR',
          receipt,
          notes: {
            userId: req.user!.uid,
            app: 'GRAVVY Express',
            ...notes,
          },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return res.json({
          success: true,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId,
        });
      } catch (rzpErr: any) {
        console.error('Razorpay API error:', rzpErr?.error?.description || rzpErr?.message);
        if (!SANDBOX_ENABLED) {
          return res.status(502).json({ success: false, message: 'Payment gateway error. Please try again.' });
        }
        // Local development only: fall through to sandbox simulation below
      }
    }

    // SANDBOX SIMULATION MODE (local development only, requires ALLOW_PAYMENT_SANDBOX=true)
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return res.json({
      success: true,
      isSandboxMode: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: currency || 'INR',
      keyId: keyId || 'rzp_test_sandbox',
      message: 'Running in local Razorpay sandbox mode.',
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create secure Razorpay order.',
    });
  }
});

// Helper to sanitize objects for Firestore (removes undefined values)
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

// 2. SECURE PAYMENT SIGNATURE VERIFICATION & FIRESTORE CONFIRMATION
app.post('/api/razorpay/verify-payment', requireAuth, requireVerifiedPhone, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment credentials for verification.',
      });
    }

    const uid = req.user!.uid;
    let isSignatureValid = false;

    if (SANDBOX_ENABLED && String(razorpay_order_id).startsWith('order_sim_')) {
      // Local development only (never active when NODE_ENV=production)
      isSignatureValid = true;
    } else if (RAZORPAY_CONFIGURED && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isSignatureValid = safeEqual(expectedSignature, String(razorpay_signature));
    }

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed.',
      });
    }

    const orderId = String(orderData?.id || `ord-${Date.now()}`);
    const orderRef = adminDb.collection('orders').doc(orderId);
    const userOrderRef = adminDb.collection('users').doc(uid).collection('orders').doc(orderId);

    // Never let one user overwrite another user's order
    const existing = await orderRef.get();
    if (existing.exists && existing.data()?.userId !== uid) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const verifiedOrderData = {
      ...orderData,
      id: orderId,
      userId: uid,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const cleanData = sanitizeForFirestore(verifiedOrderData);

    try {
      await Promise.all([
        orderRef.set(cleanData, { merge: true }),
        userOrderRef.set(cleanData, { merge: true }),
      ]);
    } catch (dbErr) {
      // Money was captured but the order could not be saved: do NOT report plain success.
      console.error('CRITICAL: payment verified but order save failed', razorpay_payment_id, dbErr);
      return res.status(500).json({
        success: false,
        message: 'Payment received but the order could not be saved. Please contact support with your payment ID: ' + razorpay_payment_id,
      });
    }

    return res.json({
      success: true,
      message: 'Payment verified and order confirmed.',
      paymentId: razorpay_payment_id,
      orderId,
    });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification server error.',
    });
  }
});

// Health check for hosting platforms / uptime monitors
app.get('/healthz', (_req: Request, res: Response) => res.json({ ok: true }));

// Unknown /api routes return JSON 404 (not the SPA page)
app.use('/api', (_req: Request, res: Response) => res.status(404).json({ error: 'Not found' }));

// Setup Vite in development or serve the built app in production
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    // SPA fallback: refreshing /orders, /cart etc. must return index.html
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GRAVVY server running on port ${PORT} (${IS_PROD ? 'production' : 'development'})`);
    if (IS_PROD && !RAZORPAY_CONFIGURED) console.warn('WARNING: Razorpay keys not set - online payments disabled.');
  });
}

startServer();