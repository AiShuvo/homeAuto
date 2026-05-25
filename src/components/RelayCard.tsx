import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Power, Lock, Unlock, Edit2, Check, X, Tv, Lightbulb, Fan, Zap, Flame, Home, Shield, Sparkles } from 'lucide-react';
import { RelayItem } from '../types';

interface RelayCardProps {
  relay: RelayItem;
  onToggleState: (id: number, currentState: boolean) => void;
  onToggleLock: (id: number, currentLocked: boolean) => void;
  onRename: (id: number, newName: string) => Promise<void>;
  isLastHexTriggered: boolean;
}

// Icon mapper helper based on names or indices
function getDeviceIcon(name: string, index: number) {
  const normalized = name.toLowerCase();
  
  if (normalized.includes('ফ্যান') || normalized.includes('fan') || normalized.includes('বাতাস')) {
    return <Fan className="w-5 h-5 text-sky-500 animate-[spin_8s_linear_infinite]" />;
  }
  if (normalized.includes('লাইট') || normalized.includes('light') || normalized.includes('সিঁড়ি') || normalized.includes('বাল্ব')) {
    return <Lightbulb className="w-5 h-5 text-amber-500" />;
  }
  if (normalized.includes('টিভি') || normalized.includes('tv') || normalized.includes('টেলিভিশন')) {
    return <Tv className="w-5 h-5 text-slate-500" />;
  }
  if (normalized.includes('চার্জিং') || normalized.includes('charge') || normalized.includes('পাওয়ার') || normalized.includes('plug')) {
    return <Zap className="w-5 h-5 text-emerald-500" />;
  }
  if (normalized.includes('রান্না') || normalized.includes('heater') || normalized.includes('গিজার')) {
    return <Flame className="w-5 h-5 text-red-500" />;
  }
  
  // Index-based fallback defaults
  if (index === 5) return <Fan className="w-5 h-5 text-sky-500" />; // N5 is Fan in OCR
  if (index === 6 || index === 7 || index === 10) return <Lightbulb className="w-5 h-5 text-amber-500" />; // N6, N7, N10 are Dining/Stair Lights
  if (index === 9) return <Tv className="w-5 h-5 text-indigo-500" />; // N9 is TV
  if (index === 2) return <Zap className="w-5 h-5 text-emerald-500" />; // N2 is charging
  
  return <Home className="w-5 h-5 text-indigo-500" />;
}

export const RelayCard: React.FC<RelayCardProps> = ({
  relay,
  onToggleState,
  onToggleLock,
  onRename,
  isLastHexTriggered
}) => {
  const { id, key, name, state, locked, irCode } = relay;
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    setSavingName(true);
    try {
      await onRename(id, editedName.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEventHTML) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setEditedName(name);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      id={`relay-card-${id}`}
      layout
      className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 min-h-[220px] ${
        state 
          ? 'bg-slate-800/80 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.06)]' 
          : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/60'
      } ${locked ? 'opacity-90 ring-1 ring-red-500/20' : ''}`}
    >
      {/* Locked Overlay Warning Indicator */}
      {locked && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 border border-red-500/20 uppercase tracking-wide">
          <Lock className="w-3 h-3" />
          <span>লকড (Locked)</span>
        </div>
      )}

      {/* IR Remote Code Matches LastHex Toast Badge */}
      {isLastHexTriggered && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 leading-none rounded-full bg-amber-500 px-3.5 py-1 text-[10px] font-bold text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-400 animate-pulse z-10">
          <Sparkles className="w-3 h-3 text-slate-950 animate-spin" />
          <span>রিমোট ট্রিগার (IR MATCH)</span>
        </div>
      )}

      {/* Card Header (Icon, Pin ID, Names) */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3.5 flex-1 select-none">
          {/* LED Glow Wrapper container */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
            state 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-slate-900 border-slate-700'
          }`}>
            <div className="relative">
              {getDeviceIcon(name, id)}
              {/* LED dot glow effect */}
              <span className={`absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full ${
                state 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse' 
                  : 'bg-slate-500'
              }`} />
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">
              RELAY_ID: R{id < 10 ? `0${id}` : id} • {key}
            </span>
            
            {isEditing ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={savingName}
                  className="rounded-lg bg-slate-900 border border-slate-600 px-2 py-0.5 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[130px]"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setEditedName(name);
                    setIsEditing(false);
                  }}
                  disabled={savingName}
                  className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group mt-0.5">
                <h3 className="font-sans font-bold text-slate-200 text-sm md:text-base flex-1 line-clamp-1">
                  {name || `Switch ${id}`}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-emerald-400 transition-all rounded hover:bg-slate-800"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            <p className={`text-[11px] font-mono font-bold mt-1 uppercase ${
              state ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {state ? '🟢 ACTIVE / ON' : '⚫ INACTIVE / OFF'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Touch-Friendly Action Button Block & Lock Switch */}
      <div className="flex items-center justify-between gap-3 mt-4">
        <button
          id={`toggle-button-${id}`}
          onClick={() => !locked && onToggleState(id, state)}
          disabled={locked}
          className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
            locked
              ? 'bg-slate-800/20 border border-slate-850 text-slate-600 cursor-not-allowed'
              : state
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 active:translate-y-0.5 cursor-pointer'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 active:translate-y-0.5 cursor-pointer'
          }`}
          style={{ minHeight: '44px' }}
        >
          <Power className="w-3.5 h-3.5" />
          <span>
            {state ? 'SWITCH OFF' : 'SWITCH ON'}
          </span>
        </button>

        {/* Modular Lock Switch */}
        <button
          id={`lock-button-${id}`}
          onClick={() => onToggleLock(id, locked)}
          className={`flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
            locked
              ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
              : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-350'
          }`}
          style={{ width: '44px', height: '44px' }}
          title={locked ? "আনলক রাখুন" : "লক রাখুন"}
        >
          {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>

      {/* Metadata Bottom Tray */}
      <div className="flex items-center justify-between text-[10px] font-mono mt-3.5 border-t border-slate-700/40 pt-3 text-slate-500 leading-none">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-slate-600" />
          <span>LOCK: {locked ? 'ACTIVE' : 'DEACTIVE'}</span>
        </span>
        <span className="bg-slate-900 border border-slate-750 text-slate-400 font-semibold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
          IR: {irCode || '0xUNKNOWN'}
        </span>
      </div>
    </motion.div>
  );
};
