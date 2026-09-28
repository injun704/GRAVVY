import jsPDF from 'jspdf';
import { Order } from '../types';

/**
 * Centralized verification helper: Reorder & Invoice actions are ONLY valid for Delivered orders.
 */
export const isOrderDelivered = (order: Order): boolean => {
  return order.status === 'delivered';
};

/**
 * Generates and downloads a clean, professional, white-paper A4 PDF invoice for a Delivered Order.
 */
export const generateOrderInvoicePDF = async (order: Order): Promise<void> => {
  // Strict backend/logic verification
  if (!isOrderDelivered(order)) {
    throw new Error('Invoice generation is only available for completed/delivered orders.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = margin;

  // Background: Pure White Paper
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top Elegant Accent Bar
  doc.setFillColor(245, 158, 11); // Amber-500
  doc.rect(margin, y, pageWidth - margin * 2, 2, 'F');
  y += 7;

  // ==========================================
  // 1. GRAVVY COMPANY BRANDING & INVOICE HEADER
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39); // Gray-900
  doc.text('GRAVVY', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(245, 158, 11);
  doc.text('TAX INVOICE / RETAIL INVOICE', pageWidth - margin, y - 1.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Original for Recipient', pageWidth - margin, y + 2.5, { align: 'right' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Your delivery, simplified.', margin, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('GRAVVY Hyperlocal Technologies Private Limited', margin, y);
  y += 3.5;
  doc.text('100ft Road, Indiranagar, Bengaluru, Karnataka - 560038', margin, y);
  y += 3.5;
  doc.text('CIN: U74999KA2024PTC184920 | Email: support@gravvy.app | Web: www.gravvy.app', margin, y);

  y += 4.5;
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5.5;

  // ==========================================
  // 2. TWO-COLUMN: INVOICE TO vs INVOICE DETAILS
  // ==========================================
  const colWidth = (pageWidth - margin * 2) / 2;

  // Left Column: Invoice To (Customer Details)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('INVOICE TO', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(`${order.address.name}`, margin, y);
  y += 3.8;
  doc.text(`Phone: ${order.address.phone}`, margin, y);
  y += 3.8;
  doc.text(`${order.address.street}, ${order.address.area}`, margin, y);
  y += 3.8;
  doc.text(`${order.address.city}, Karnataka - ${order.address.pinCode} (${order.address.tag})`, margin, y);

  // Right Column: Invoice Details
  let rightY = y - 15.4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('INVOICE DETAILS', margin + colWidth, rightY);
  rightY += 4;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : orderDate;
  const deliveredTime = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : orderTime;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(`Invoice Number: INV-${order.orderNumber}`, margin + colWidth, rightY);
  rightY += 3.8;
  doc.text(`Order ID: #${order.orderNumber}`, margin + colWidth, rightY);
  rightY += 3.8;
  doc.text(`Order Date: ${orderDate} · ${orderTime}`, margin + colWidth, rightY);
  rightY += 3.8;
  doc.text(`Delivered Date: ${deliveredDate} · ${deliveredTime}`, margin + colWidth, rightY);
  rightY += 3.8;
  doc.text(`Delivery Status: DELIVERED`, margin + colWidth, rightY);

  y = Math.max(y, rightY) + 6;

  // ==========================================
  // 3. PRODUCT ITEMS TABLE
  // ==========================================
  // Table Header
  doc.setFillColor(243, 244, 246); // Gray-100
  doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
  doc.setDrawColor(209, 213, 219); // Gray-300
  doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  const colItem = margin + 3;
  const colQty = margin + 92;
  const colUnitPrice = margin + 115;
  const colDiscount = margin + 140;
  const colTotal = pageWidth - margin - 3;

  doc.text('Item Description', colItem, y + 4.2);
  doc.text('Qty', colQty, y + 4.2, { align: 'center' });
  doc.text('Unit Price', colUnitPrice, y + 4.2, { align: 'right' });
  doc.text('Discount', colDiscount, y + 4.2, { align: 'right' });
  doc.text('Total', colTotal, y + 4.2, { align: 'right' });
  y += 6.5;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowHeight = 7;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(249, 250, 251);
    }
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'S');

    const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    const originalUnitPrice = item.selectedVariant
      ? item.selectedVariant.originalPrice || unitPrice
      : item.product.originalPrice || unitPrice;
    const discountPerUnit = Math.max(0, originalUnitPrice - unitPrice);
    const lineTotal = unitPrice * item.quantity;

    const itemName = `${item.product.name}${item.selectedVariant ? ` (${item.selectedVariant.label})` : ''}`;
    const truncatedName = itemName.length > 50 ? itemName.substring(0, 48) + '...' : itemName;

    doc.setTextColor(17, 24, 39);
    doc.text(truncatedName, colItem, y + 4.6);

    doc.setTextColor(55, 65, 81);
    doc.text(item.quantity.toString(), colQty, y + 4.6, { align: 'center' });
    doc.text(`INR ${unitPrice.toFixed(2)}`, colUnitPrice, y + 4.6, { align: 'right' });
    doc.text(discountPerUnit > 0 ? `INR ${(discountPerUnit * item.quantity).toFixed(2)}` : '-', colDiscount, y + 4.6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`INR ${lineTotal.toFixed(2)}`, colTotal, y + 4.6, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += rowHeight;
  });

  y += 4;

  // ==========================================
  // 4. PAYMENT & SUMMARY SECTION (2 Columns)
  // ==========================================
  const summaryBoxWidth = 84;
  const summaryX = pageWidth - margin - summaryBoxWidth;

  // Left Column: Payment & Delivery Partner Information
  let payY = y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('PAYMENT & DELIVERY RECORD', margin, payY);
  payY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, margin, payY);
  payY += 3.8;
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, margin, payY);
  payY += 3.8;
  doc.text(`Delivered To: ${order.address.name}`, margin, payY);
  payY += 3.8;
  doc.text(`Delivered Date: ${deliveredDate} at ${deliveredTime}`, margin, payY);
  payY += 3.8;
  if (order.deliveryAgent) {
    doc.text(`Delivery Hero: ${order.deliveryAgent.name} (${order.deliveryAgent.vehicle})`, margin, payY);
  }

  // Right Column: Price Summary Box
  doc.setFillColor(249, 250, 251);
  doc.rect(summaryX, y, summaryBoxWidth, 31, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(summaryX, y, summaryBoxWidth, 31, 'S');

  let sY = y + 4.5;
  const sLabelX = summaryX + 4;
  const sValX = summaryX + summaryBoxWidth - 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);

  doc.text('Item Subtotal:', sLabelX, sY);
  doc.text(`INR ${order.subtotal.toFixed(2)}`, sValX, sY, { align: 'right' });
  sY += 4.2;

  if (order.discountAmount > 0) {
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text(`Discount (${order.couponCode || 'PROMO'}):`, sLabelX, sY);
    doc.text(`- INR ${order.discountAmount.toFixed(2)}`, sValX, sY, { align: 'right' });
    doc.setTextColor(75, 85, 99);
    sY += 4.2;
  }

  doc.text('Delivery & Handling Fee:', sLabelX, sY);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `INR ${order.deliveryFee.toFixed(2)}`, sValX, sY, { align: 'right' });
  sY += 4.2;

  if (order.tipAmount > 0) {
    doc.text('Delivery Hero Tip:', sLabelX, sY);
    doc.text(`INR ${order.tipAmount.toFixed(2)}`, sValX, sY, { align: 'right' });
    sY += 4.2;
  }

  doc.setDrawColor(209, 213, 219);
  doc.line(summaryX + 2, sY, summaryX + summaryBoxWidth - 2, sY);
  sY += 4.8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text('TOTAL PAID:', sLabelX, sY);
  doc.text(`INR ${order.total.toFixed(2)}`, sValX, sY, { align: 'right' });

  y = Math.max(payY, y + 34) + 6;

  // ==========================================
  // 5. LEGAL & TAX DISCLAIMER NOTE
  // ==========================================
  doc.setFillColor(254, 243, 199, 0.35); // Amber-50
  doc.rect(margin, y, pageWidth - margin * 2, 11, 'F');
  doc.setDrawColor(245, 158, 11, 0.25);
  doc.rect(margin, y, pageWidth - margin * 2, 11, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text('Declaration & Quality Guarantee:', margin + 3, y + 3.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 53, 15);
  doc.text(
    'This is a computer-generated tax invoice issued by GRAVVY for goods supplied via hyperlocal fulfillment.',
    margin + 3,
    y + 6.8
  );
  doc.text(
    'All products delivered meet 100% genuine quality inspection with batch validation and tamper-evident sealing.',
    margin + 3,
    y + 9.5
  );

  y += 15;

  // ==========================================
  // 6. INVOICE FOOTER
  // ==========================================
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text('Thank you for choosing GRAVVY.', pageWidth / 2, y, { align: 'center' });
  y += 3.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text('Instant 15-Minute Delivery · Quality Assured · Need help? Contact support@gravvy.app', pageWidth / 2, y, { align: 'center' });

  // Save/download PDF file with exact name
  const fileName = `GRAVVY_Invoice_${order.orderNumber}.pdf`;
  doc.save(fileName);
};
