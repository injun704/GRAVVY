import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Edit2,
  Check,
  ShieldCheck,
  PackageCheck,
  Heart,
  Award,
  Camera,
  Upload,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { DedicatedPageHeader } from '../common/DedicatedPageHeader';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
  const { user, updateProfile, isAdmin } = useAuth();
  const { orders, wishlist } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync component state whenever user object updates from AuthContext
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Profile picture file handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          // Compress image using canvas for fast storage in Firestore
          const img = new Image();
          img.src = dataUrl;
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const maxDim = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setAvatar(compressedDataUrl);
              await updateProfile({ avatar: compressedDataUrl });
              showToast('Profile picture updated!');
            }
            setIsUploading(false);
          };
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Failed to process image');
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar,
    });
    setIsEditing(false);
    showToast('Profile updated successfully');
  };

  const handleRemovePhoto = async () => {
    setAvatar('');
    await updateProfile({ avatar: '' });
    showToast('Profile picture removed');
  };

  return (
    <div className="w-full space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Hidden File Input for Device Profile Photo Selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Dedicated Header */}
      <DedicatedPageHeader
        title="My Profile"
        onBack={onBack}
        rightAction={
          !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-500/20 hover:border-amber-400 text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit</span>
            </button>
          ) : null
        }
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 border border-amber-400/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all backdrop-blur-xl ${
          theme === 'LIGHT'
            ? 'bg-white/80 border-stone-200 shadow-xs'
            : theme === 'DARK'
            ? 'bg-stone-900/40 border-white/10'
            : 'bg-stone-950/30 border-white/15'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with Upload Trigger */}
          <div className="relative group">
            {avatar ? (
              <img
                src={avatar}
                alt={user?.name || 'User Profile'}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-amber-400/15 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
                <User className="w-9 h-9" />
              </div>
            )}

            {/* Camera Overlay Icon */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-400 text-stone-950 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title="Upload profile picture"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>

            {isAdmin && (
              <span className="absolute -top-2 -left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                ADMIN
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className={`text-base sm:text-lg font-bold font-display ${textColorPrimary}`}>
                {user?.name || user?.phone || user?.email || 'GRAVVY Member'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            {user?.email && <p className="text-xs text-stone-400">{user.email}</p>}
            {user?.phone && <p className="text-xs text-stone-400">{user.phone}</p>}

            {/* Picture Management Links */}
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer"
              >
                {avatar ? 'Change Picture' : 'Upload Picture'}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-stone-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Member Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-stone-500/15 text-center">
          <div className="p-2.5 rounded-xl bg-stone-500/5">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
              <PackageCheck className="w-3.5 h-3.5" />
              <span className="font-mono font-bold text-xs">{orders.length}</span>
            </div>
            <span className="text-[10px] text-stone-400">Total Orders</span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-500/5">
            <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
              <Heart className="w-3.5 h-3.5" />
              <span className="font-mono font-bold text-xs">{wishlist.length}</span>
            </div>
            <span className="text-[10px] text-stone-400">Wishlist Items</span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-500/5">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-0.5">
              <Award className="w-3.5 h-3.5" />
              <span className="font-bold text-xs">Member</span>
            </div>
            <span className="text-[10px] text-stone-400">GRAVVY Club</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form or Details Section */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all backdrop-blur-xl ${
          theme === 'LIGHT'
            ? 'bg-white/80 border-stone-200 shadow-xs'
            : theme === 'DARK'
            ? 'bg-stone-900/40 border-white/10'
            : 'bg-stone-950/30 border-white/15'
        }`}
      >
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${textColorMuted}`}>
          {isEditing ? 'Edit Personal Information' : 'Account Details'}
        </h3>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                    theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-400'
                      : 'bg-stone-900 border-white/15 text-white focus:border-amber-400/60'
                  }`}
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                    theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-400'
                      : 'bg-stone-900 border-white/15 text-white focus:border-amber-400/60'
                  }`}
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                    theme === 'LIGHT'
                      ? 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-400'
                      : 'bg-stone-900 border-white/15 text-white focus:border-amber-400/60'
                  }`}
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Profile Picture Option in Form */}
            <div className="pt-1">
              <label className={`block text-[11px] font-bold uppercase mb-1 ${textColorMuted}`}>
                Profile Picture
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-400/15 border border-amber-400/30 text-amber-500 hover:bg-amber-400/25 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo from Device</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setName(user?.name || '');
                  setEmail(user?.email || '');
                  setPhone(user?.phone || '');
                  setAvatar(user?.avatar || '');
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-500/20 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${categoryAccent.bgClass}`}
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-stone-500/5 flex items-center justify-between">
              <span className="text-stone-400">Full Name</span>
              <span className={`font-semibold ${textColorPrimary}`}>
                {user?.name || <span className="text-stone-500 italic">Not provided</span>}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-500/5 flex items-center justify-between">
              <span className="text-stone-400">Email Address</span>
              <span className={`font-semibold ${textColorPrimary}`}>
                {user?.email || <span className="text-stone-500 italic">Not provided</span>}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-500/5 flex items-center justify-between">
              <span className="text-stone-400">Mobile Phone</span>
              <span className={`font-semibold ${textColorPrimary}`}>
                {user?.phone || <span className="text-stone-500 italic">Not provided</span>}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-500/5 flex items-center justify-between">
              <span className="text-stone-400">Account Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified Account
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
