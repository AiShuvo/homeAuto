import React, { useState } from 'react';
import { X, Save, RefreshCw, Key, Database, Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { FirebaseConfig } from '../types';
import { DEFAULT_CONFIG } from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FirebaseConfig;
  onSave: (newConfig: FirebaseConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<FirebaseConfig>({ ...config });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm("আপনি কি ডিফল্ট কনফিগারেশনে ফিরে যেতে চান? (Are you sure you want to restore to the default credentials?)")) {
      setFormData({ ...DEFAULT_CONFIG });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div 
        id="settings-modal-content"
        className="w-full max-w-2xl bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>ডাটাবেস কনফিগারেশন (Configure Connection)</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              আপনার ফায়ারবেস রিয়েলটাইম ডাটাবেস ও লগইন তথ্য এখানে কাস্টমাইজ করুন।
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-450 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Info Box */}
          <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed font-mono">
              <span className="font-bold text-slate-100 block mb-1">নিরাপত্তা ও গিটহাব হোস্টিং:</span> এই পেজটি সম্পূর্ণ ব্রাউজারেই চলে। আপনার সেট করা ক্রেডেনশিয়াল আপনার ব্রাউজারের <code className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">localStorage</code> এ সংরক্ষিত থাকবে। গিটহাবে হোস্ট করার পর এই সেটিংস দিয়ে যেকোনো ডিভাইস থেকে রিলে কন্ট্রোল করতে পারবেন।
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Database URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>রিয়েলটাইম ডাটাবেস URL *</span>
              </label>
              <input
                type="text"
                name="databaseURL"
                value={formData.databaseURL}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://your-project-default-rtdb.firebaseio.com"
              />
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>API Key *</span>
              </label>
              <input
                type="text"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="AIzaSy..."
              />
            </div>

            {/* Project ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">প্রজেক্ট আইডি (Project ID) *</label>
              <input
                type="text"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Auth Domain */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">অথ ডোমেইন (Auth Domain)</label>
              <input
                type="text"
                name="authDomain"
                value={formData.authDomain}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* App ID */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">অ্যাপ আইডি (App ID)</label>
              <input
                type="text"
                name="appId"
                value={formData.appId}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#090d16] border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Authentication parameters */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-bold text-slate-350 tracking-wider mb-4 flex items-center gap-1.5 uppercase font-mono">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>ইউজার অ্যাথ প্রমাণীকরণ (Firebase Authentication)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Login Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">অ্যাথ ইমেইল (Login Email)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-[#090d16] border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="your-email@example.com"
                />
              </div>

              {/* Login Password */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">পাসওয়ার্ড (Login Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#090d16] border border-slate-700 pl-3.5 pr-10 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-5">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-red-400 hover:text-red-300 font-bold hover:bg-red-500/10 py-2 px-3 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ডিফল্টে রিমেক করুন (Reset to Default)</span>
            </button>

            <div className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-wider">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all border border-slate-700 cursor-pointer"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/15 transition-all border border-emerald-500/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>সংরক্ষণ করুন (SAVE CHANGES)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
