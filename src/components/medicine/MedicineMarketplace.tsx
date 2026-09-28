import React, { useState, useMemo } from 'react';
import {
  Pill,
  Upload,
  ShieldCheck,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { Product, PromotionSlide } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ProductCard } from '../common/ProductCard';
import { MEDICINE_CATEGORIES } from '../../data/categories';
import { MEDICINE_PROMOTIONS } from '../../data/promotions';
import { HomeCarousel } from '../home/HomeCarousel';

interface MedicineMarketplaceProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
}

const MedicineMarketplaceComponent: React.FC<MedicineMarketplaceProps> = ({
  products,
  onOpenProductDetail,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [searchMedQuery, setSearchMedQuery] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'otc' | 'rx'>('all');

  // Prescription Upload Modal
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [uploadedRxName, setUploadedRxName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const medicineProducts = useMemo(() => {
    return products.filter((p) => p.category === 'medicine');
  }, [products]);

  const handleSlideAction = (slide: PromotionSlide) => {
    if (slide.subCategoryFilter) {
      setSelectedSubCategory(slide.subCategoryFilter);
    }
  };

  const filteredProducts = useMemo(() => {
    return medicineProducts.filter((p) => {
      if (selectedSubCategory !== 'All' && p.subCategory !== selectedSubCategory) {
        return false;
      }
      if (prescriptionFilter === 'otc' && p.prescriptionRequired) return false;
      if (prescriptionFilter === 'rx' && !p.prescriptionRequired) return false;
      if (searchMedQuery.trim()) {
        const q = searchMedQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.restaurantOrBrand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [medicineProducts, selectedSubCategory, prescriptionFilter, searchMedQuery]);

  const handleSimulateRxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedRxName(file.name);
      setUploadStatus('Prescription uploaded successfully. Our licensed pharmacist will verify within 5 mins.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 9-Slide High-Quality Medicine & Healthcare Promotional Carousel */}
      <section>
        <HomeCarousel
          slides={MEDICINE_PROMOTIONS}
          onSlideClick={handleSlideAction}
          carouselTitle="Medicine & Healthcare Promotional Carousel"
        />
      </section>

      {/* Medicine Verification Badges & Prescription Upload Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Banner */}
        <div className="md:col-span-2 relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
              <span>Certified Pharmacy Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-tight">
              100% Genuine Medicines & Healthcare Essentials
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-2 max-w-md">
              Order doctor-prescribed antibiotics, daily OTC pain relievers, baby care, and diagnostic devices delivered in 15-20 mins.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-sky-200">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> State Drug License Validated
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" /> Cold-Chain Maintained
            </span>
          </div>
        </div>

        {/* Prescription Upload Quick Action Card */}
        <div
          className={`p-5 rounded-3xl border flex flex-col justify-between ${
            theme === 'LIGHT'
              ? 'bg-white border-stone-200 shadow-sm'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-sky-500 mb-2">
              <FileText className="w-5 h-5" />
              <h3 className={`font-bold text-sm ${textColorPrimary}`}>Have a Prescription?</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Upload doctor prescription photo/PDF. We will dispense authentic medicines with pharmacist consultation.
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Prescription</span>
            </button>
            <p className="text-[10px] text-center text-stone-400 mt-2">
              Licensed Pharmacist verification required for Schedule H drugs.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorMuted}`}>
            Pharmacy Categories
          </h3>
          {selectedSubCategory !== 'All' && (
            <button
              onClick={() => setSelectedSubCategory('All')}
              className="text-xs font-semibold text-sky-500 hover:underline"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSubCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubCategory === 'All'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : theme === 'LIGHT'
                ? 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'
            }`}
          >
            All Medicines ({medicineProducts.length})
          </button>
          {MEDICINE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCategory(cat.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedSubCategory === cat.name
                  ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-600/30'
                  : theme === 'LIGHT'
                  ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
              }`}
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-5 h-5 rounded-md object-cover"
                referrerPolicy="no-referrer"
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/10 border border-stone-500/15">
        <div className="flex rounded-xl p-1 bg-black/20 border border-stone-500/20">
          <button
            onClick={() => setPrescriptionFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              prescriptionFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setPrescriptionFilter('otc')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              prescriptionFilter === 'otc' ? 'bg-sky-600 text-white shadow-xs' : 'text-stone-400'
            }`}
          >
            OTC Only (No Rx)
          </button>
          <button
            onClick={() => setPrescriptionFilter('rx')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              prescriptionFilter === 'rx' ? 'bg-sky-600 text-white shadow-xs' : 'text-stone-400'
            }`}
          >
            Prescription (Rx)
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Dolo, Dettol, Omron..."
            value={searchMedQuery}
            onChange={(e) => setSearchMedQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-black/20 border border-stone-500/20 text-white placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} onOpenDetail={onOpenProductDetail} />
        ))}
      </div>

      {/* Prescription Upload Modal */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
              theme === 'LIGHT'
                ? 'bg-white border-stone-200'
                : 'bg-stone-900 border-white/20'
            }`}
          >
            <h3 className={`text-xl font-bold font-display ${textColorPrimary}`}>
              Upload Doctor's Prescription
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              Upload prescription image or PDF to order Schedule H / Rx medicines
            </p>

            <div className="border-2 border-dashed border-sky-500/40 rounded-2xl p-6 text-center bg-sky-500/5">
              <Upload className="w-10 h-10 text-sky-400 mx-auto mb-2" />
              <p className={`text-xs font-semibold ${textColorPrimary}`}>
                {uploadedRxName || 'Click or drag prescription file here'}
              </p>
              <p className="text-[10px] text-stone-400 mt-1">Accepts JPG, PNG, PDF up to 10MB</p>
              <label className="mt-3 inline-block px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleSimulateRxUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadStatus && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-black/20 text-[11px] text-stone-400 space-y-1">
              <div className="font-semibold text-stone-300">Valid Prescription Guide:</div>
              <div>• Doctor's Name, Registration Number & Signature visible</div>
              <div>• Patient's Name & Consultation Date clearly stamped</div>
              <div>• Valid within 6 months from issue date</div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setIsPrescriptionModalOpen(false);
                  setUploadStatus(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-stone-500/20 text-xs font-semibold text-stone-400 hover:text-white"
              >
                Close
              </button>
              {uploadStatus && (
                <button
                  onClick={() => setIsPrescriptionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-sky-600 text-white"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MedicineMarketplace = React.memo(MedicineMarketplaceComponent);
