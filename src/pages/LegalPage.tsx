import React, { useEffect, useState } from 'react';
import { getStoreSettings, DEFAULT_SETTINGS } from '../services/settingsService';
import { StoreSettings } from '../types';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'shipping' | 'returns';
}

const TITLES = {
  privacy: 'Privacy Policy',
  terms: 'Terms and Conditions',
  shipping: 'Shipping & Delivery Policy',
  returns: 'Returns & Refunds Policy',
};

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function load() {
      const s = await getStoreSettings();
      setSettings(s);
    }
    load();
  }, []);

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return settings.legal?.privacyPolicy || DEFAULT_SETTINGS.legal.privacyPolicy;
      case 'terms':
        return settings.legal?.termsAndConditions || DEFAULT_SETTINGS.legal.termsAndConditions;
      case 'shipping':
        return settings.legal?.shippingPolicy || DEFAULT_SETTINGS.legal.shippingPolicy;
      case 'returns':
        return settings.legal?.returnsAndRefunds || DEFAULT_SETTINGS.legal.returnsAndRefunds;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
          DripNest Policies
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737]">
          {TITLES[type]}
        </h1>
        <p className="text-xs text-[#252A24]/60 mt-2 font-mono">
          Last updated: 2026 · GSTIN: 07AMVPU8369D1Z5
        </p>
      </div>

      <div className="bg-white border border-[#EFE6D7] rounded-xl p-8 sm:p-12 shadow-xs">
        <div className="prose max-w-none text-sm text-[#252A24]/85 leading-relaxed whitespace-pre-line font-normal space-y-4">
          {getContent()}
        </div>
      </div>
    </div>
  );
};
