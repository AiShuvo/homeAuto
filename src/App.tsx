import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getSavedConfig, 
  saveConfig, 
  initFirebase 
} from './lib/firebase';
import { FirebaseConfig, RelayItem } from './types';
import { RelayCard } from './components/RelayCard';
import { SettingsModal } from './components/SettingsModal';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  update 
} from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Power, 
  ShieldAlert, 
  Settings, 
  RefreshCw, 
  Database, 
  Wifi, 
  WifiOff, 
  Clock, 
  Github, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Config state
  const [config, setConfig] = useState<FirebaseConfig>(getSavedConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Connection and Firebase references
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [authInstance, setAuthInstance] = useState<any>(null);

  // App sync states
  const [isConnected, setIsConnected] = useState(false);
  const [authStatus, setAuthStatus] = useState<'unauthenticated' | 'authenticating' | 'authenticated' | 'error'>('unauthenticated');
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Dynamic values from database
  const [relayStates, setRelayStates] = useState<Record<string, boolean>>({});
  const [lockStates, setLockStates] = useState<Record<string, boolean>>({});
  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  const [irRemoteCodes, setIrRemoteCodes] = useState<Record<string, string>>({});
  const [lastHex, setLastHex] = useState<string>('');
  const [offlineLock, setOfflineLock] = useState<boolean>(false);

  // Time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Help section expansion
  const [showHelp, setShowHelp] = useState(true);

  // Real-time dynamic UTC clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize and Login to Firebase
  useEffect(() => {
    let unsubscribeFunctions: (() => void)[] = [];
    setLoading(true);
    setAuthStatus('authenticating');
    setErrorText(null);

    try {
      const { auth, db } = initFirebase(config);
      setDbInstance(db);
      setAuthInstance(auth);

      // Attempt authentication if email and password are provided
      if (config.email && config.password) {
        signInWithEmailAndPassword(auth, config.email, config.password)
          .then(() => {
            setAuthStatus('authenticated');
            setLoading(false);
          })
          .catch((err) => {
            console.error("Authentication failed: ", err);
            setAuthStatus('error');
            setErrorText(`Authentication Error: ${err.message}. Please check your credentials in settings.`);
            setLoading(false);
          });
      } else {
        // Authenticating anonymously or skipping authentication depending on DB rules
        setAuthStatus('authenticated'); // Assume authenticated for simple setups if email is empty
        setLoading(false);
      }

      // Check Realtime Database server connection status using built-in path
      const connectedRef = ref(db, '.info/connected');
      const connUnsub = onValue(connectedRef, (snap) => {
        setIsConnected(!!snap.val());
      });
      unsubscribeFunctions.push(connUnsub);

      // Listen to /Relay node changes
      const relayRef = ref(db, 'Relay');
      const relayUnsub = onValue(relayRef, (snapshot) => {
        if (snapshot.exists()) {
          setRelayStates(snapshot.val());
        }
      });
      unsubscribeFunctions.push(relayUnsub);

      // Listen to /Lock node changes
      const lockRef = ref(db, 'Lock');
      const lockUnsub = onValue(lockRef, (snapshot) => {
        if (snapshot.exists()) {
          setLockStates(snapshot.val());
        }
      });
      unsubscribeFunctions.push(lockUnsub);

      // Listen to /Names node changes
      const namesRef = ref(db, 'Names');
      const namesUnsub = onValue(namesRef, (snapshot) => {
        if (snapshot.exists()) {
          setDeviceNames(snapshot.val());
        }
      });
      unsubscribeFunctions.push(namesUnsub);

      // Listen to /Remote node changes (including LastHex)
      const remoteRef = ref(db, 'Remote');
      const remoteUnsub = onValue(remoteRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          setLastHex(val.LastHex || '');
          // Filter out lastHex to get only trigger codes C1..C12
          const codes: Record<string, string> = { ...val };
          delete codes.LastHex;
          setIrRemoteCodes(codes);
        }
      });
      unsubscribeFunctions.push(remoteUnsub);

      // Listen to /System/OfflineLock
      const systemRef = ref(db, 'System/OfflineLock');
      const sysUnsub = onValue(systemRef, (snapshot) => {
        if (snapshot.exists()) {
          setOfflineLock(!!snapshot.val());
        }
      });
      unsubscribeFunctions.push(sysUnsub);

    } catch (err: any) {
      console.error("Firebase Initialization error: ", err);
      setAuthStatus('error');
      setErrorText(`Firebase Configuration Error: ${err.message}. Please look at settings.`);
      setLoading(false);
    }

    return () => {
      // Cleanup all Firebase subscribers on teardown/re-init
      unsubscribeFunctions.forEach((unsub) => unsub());
    };
  }, [config]);

  // Construct 12 relay items
  const relays: RelayItem[] = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    return {
      id: num,
      key: `R${num}`,
      name: deviceNames[`N${num}`] || `Switch ${num}`,
      state: !!relayStates[`R${num}`],
      locked: !!lockStates[`L${num}`],
      irCode: irRemoteCodes[`C${num}`] || ''
    };
  });

  // Action: Toggle a relay's state
  const handleToggleState = async (id: number, currentState: boolean) => {
    if (!dbInstance) return;
    try {
      await set(ref(dbInstance, `Relay/R${id}`), !currentState);
    } catch (err: any) {
      alert(`Error updating relay state: ${err.message}`);
    }
  };

  // Action: Toggle a lock's state
  const handleToggleLock = async (id: number, currentLocked: boolean) => {
    if (!dbInstance) return;
    try {
      await set(ref(dbInstance, `Lock/L${id}`), !currentLocked);
    } catch (err: any) {
      alert(`Error updating lock state: ${err.message}`);
    }
  };

  // Action: Rename a switch
  const handleRename = async (id: number, newName: string) => {
    if (!dbInstance) return;
    try {
      await set(ref(dbInstance, `Names/N${id}`), newName);
    } catch (err: any) {
      alert(`Error renaming switch: ${err.message}`);
      throw err;
    }
  };

  // Action: All Off (turn off all unlocked relays)
  const handleAllOff = async () => {
    if (!dbInstance) return;
    const updates: Record<string, boolean> = {};
    let triggeredCount = 0;

    relays.forEach((relay) => {
      if (!relay.locked && relay.state) {
        updates[`Relay/R${relay.id}`] = false;
        triggeredCount++;
      }
    });

    if (triggeredCount === 0) {
      alert("ইতিমধ্যে সমস্ত সক্রিয় রিলে বন্ধ রয়েছে বা লকড অবস্থায় আছে। (All active relays are already off or locked.)");
      return;
    }

    try {
      await update(ref(dbInstance), updates);
    } catch (err: any) {
      alert(`Error executing All Off command: ${err.message}`);
    }
  };

  // Action: Unlock all relays
  const handleUnlockAll = async () => {
    if (!dbInstance) return;
    if (!window.confirm("আপনি কি সমস্ত চ্যানেল আনলক করতে চান? (Do you want to unlock all relay channels?)")) {
      return;
    }

    const updates: Record<string, boolean> = {};
    relays.forEach((relay) => {
      if (relay.locked) {
        updates[`Lock/L${relay.id}`] = false;
      }
    });

    try {
      await update(ref(dbInstance), updates);
    } catch (err: any) {
      alert(`Error executing Unlock All command: ${err.message}`);
    }
  };

  // Auth/Save settings handler
  const handleSaveSettings = (newConfig: FirebaseConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-emerald-500/20 selection:text-emerald-100 pb-12">
      {/* Top Banner Status Bar */}
      <div className="bg-[#0B0F19] text-slate-400 py-2.5 px-6 text-xs font-mono flex flex-wrap justify-between items-center border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2 select-none">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="font-mono font-bold tracking-wider text-[10px] text-slate-300">
            SYSTEM_STATUS: {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
        
        <div className="flex items-center gap-5 text-[10px] tracking-wider uppercase font-semibold">
          <span className="hidden sm:inline">DB_NODE: <strong className="text-emerald-400 font-mono">{config.projectId}</strong></span>
          <span className="h-3 w-[1.5px] bg-slate-800"></span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 animate-[pulse_2s_infinite]" />
            <span className="font-bold text-slate-200 font-mono">
              {currentTime.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} UTC
            </span>
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Header Block Dashboard */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800/80 pb-6 mb-8 mt-4 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-widest font-mono">
                CONTROL MATRIX
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider">• ACTIVE / DB v2.2.9</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1.5 flex items-center">
              RelayControl<span className="text-emerald-400 ml-1 text-lg font-bold">.v4</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              ১২-চ্যানেল রিয়েল-টাইম রিলে মডিউল পরিচালনা ইন্টারফেস (Realtime Database Control Center)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Configure button */}
            <button
              id="open-settings-button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-bold tracking-wider text-[10px] uppercase transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>কনফিগারেশন (CONFIGURE DB)</span>
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {errorText && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-xs text-red-200 shadow-sm font-mono animate-pulse uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-500">SYSTEM_ALERT_NOTICE:</span> {errorText}
            </div>
          </div>
        )}

        {/* Quick Insights & Primary Global Controller Buttons */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Quick Metrics */}
          <div className="bg-slate-800/20 border border-slate-700/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:bg-slate-800/30 transition-all">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">মোট রিসোর্সেস (Total Matrices)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-100">১২-চ্যানেল বোর্ড</span>
              <span className="text-xs text-slate-500 font-mono font-bold">(R01_R12)</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-4 border-t border-slate-800/80 pt-3 font-mono text-[10px] uppercase tracking-wider">
              <span>চালু (ON): <strong className="text-emerald-400">{relays.filter(r => r.state).length}</strong></span>
              <span>বন্ধ (OFF): <strong className="text-slate-400">{relays.filter(r => !r.state).length}</strong></span>
              <span>লকড (LOCK): <strong className="text-red-400">{relays.filter(r => r.locked).length}</strong></span>
            </div>
          </div>

          {/* Last IR Trigger Input Tracking */}
          <div className="bg-slate-800/20 border border-slate-700/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:bg-slate-800/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">রিমোট ট্র্যাকার (IR HEX MONITOR)</span>
              {lastHex && (
                <span className="flex items-center gap-1 text-[8px] bg-amber-500 text-slate-950 font-black py-0.5 px-1.5 rounded uppercase tracking-widest shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 animate-spin" />
                  <span>NEW_CODE</span>
                </span>
              )}
            </div>
            <div className="mt-2.5">
              <span className="font-mono text-2xl font-black text-emerald-400 tracking-widest bg-slate-900/60 pl-3 pr-2.5 py-1 rounded-xl border border-slate-800/80 inline-block uppercase shadow-inner">
                {lastHex || '0x000000'}
              </span>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                রিসিভ করা সর্বশেষ ইনফ্রারেড সিগন্যাল হেক্স কোড।
              </p>
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-500 border-t border-slate-800/80 pt-2 flex items-center justify-between uppercase tracking-wider">
              <span>অফলাইন লক: <strong className={offlineLock ? "text-red-400" : "text-slate-600"}>{offlineLock ? "LOCKED" : "DEACTIVE"}</strong></span>
              {lastHex && (
                <button 
                  onClick={() => setLastHex('')}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  ক্লিয়ার (Clear)
                </button>
              )}
            </div>
          </div>

          {/* Quick Global Action Control Buttons */}
          <div className="bg-slate-800/20 border border-slate-700/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:bg-slate-800/30 transition-all">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">গ্লোবাল অ্যাকশন (Direct Tasks)</span>
            <div className="flex flex-col gap-2 mt-3.5">
              <button
                id="global-all-off-button"
                onClick={handleAllOff}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-650 text-white font-bold tracking-widest uppercase text-[10px] py-2 px-3 rounded-xl active:translate-y-0.5 transition-all shadow-md cursor-pointer border border-slate-600/80"
              >
                <Power className="w-3.5 h-3.5 text-emerald-400" />
                <span>সব সুইচ বন্ধ করুন (ALL SWITCHES OFF)</span>
              </button>
              
              <button
                id="global-unlock-all-button"
                onClick={handleUnlockAll}
                className="w-full flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold tracking-widest uppercase text-[10px] py-2 px-3 rounded-xl active:translate-y-0.5 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>সব রিলে আনলক করুন (UNLOCK BOARD MATRIX)</span>
              </button>
            </div>
          </div>

        </section>

        {/* Dynamic State Banner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 bg-slate-800/10 border border-slate-850/85 rounded-3xl mb-8">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest font-mono">ফায়ারবেস ডেটা সিঙ্ক হচ্ছে (SYNC_IN_PROGRESS)...</p>
          </div>
        )}

        {/* 12 Switch Toggles Panels */}
        {!loading && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-3">
              <h2 className="text-sm font-bold text-slate-350 flex items-center gap-2 uppercase tracking-widest leading-none">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>রিলে বোর্ড নিয়ন্ত্রণ করুন (Relay Status Matrices)</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold uppercase">
                ১২ টি স্বতন্ত্র চ্যানেল রিয়েল-টাইম সিঙ্ক
              </span>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {relays.map((relay) => (
                  <RelayCard
                    key={relay.id}
                    relay={relay}
                    onToggleState={handleToggleState}
                    onToggleLock={handleToggleLock}
                    onRename={handleRename}
                    isLastHexTriggered={lastHex !== '' && lastHex === relay.irCode}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Quick Bilingual Help Instructions Accordion */}
        <section className="bg-slate-800/10 border border-slate-750 p-6 rounded-3xl shadow-sm mb-10">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-widest">গিটহাব হোস্টিং এবং সংযোগ নির্দেশিকা (Hosting & Node Details)</h3>
            </div>
            {showHelp ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showHelp && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-5 border-t border-slate-800 pt-5 text-slate-400 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  {/* Step 1: GitHub Hosting steps */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                      <Github className="w-4 h-4 text-emerald-400" />
                      <span>গিটহাবে হোস্ট করার সহজ উপায়</span>
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-400 text-xs">
                      <li>পেজটি সম্পূর্ণ রেন্ডার হবার পর গিটহাব রেপো তৈরি করুন ও কোড পুশ করুন।</li>
                      <li>গিটহাব রেপোর <strong className="text-slate-200">Settings &gt; Pages</strong> অপশনে যান।</li>
                      <li>সেখান থেকে সোার্স হিসেবে <strong className="text-slate-200">Deploy from a branch</strong> নির্বাচন করে <strong className="text-emerald-400">main / root</strong> ব্রাঞ্চ সেভ করুন।</li>
                      <li>গিটহাব পেজেস লাইভ হবে। পেজে ব্রাউস করে গ্লোবাল কনফিগারেশন বাটন দিয়ে যেকোনো ক্রেডেনশিয়াল সেভ করতে পারেন!</li>
                    </ol>
                  </div>

                  {/* Step 2: ESP32 Conn Info */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                      <Info className="w-4 h-4 text-emerald-400" />
                      <span>পিন ডিস্ট্রিবিউশন ও ট্র্যাকার ম্যাপিং</span>
                    </h4>
                    <div className="space-y-2">
                      <p>
                        আপনার নির্দেশিত ESP32 স্কেক কোড অনুযায়ী নিচের পিনগুলো ব্যবহার করা হয়েছে:
                      </p>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-350">
                        <li>• Relay 1: <strong className="text-emerald-400">GPIO 23</strong></li>
                        <li>• Relay 2: <strong className="text-emerald-400">GPIO 22</strong></li>
                        <li>• Relay 5: <strong className="text-emerald-400">GPIO 18</strong></li>
                        <li>• Relay 6: <strong className="text-emerald-400">GPIO  5</strong></li>
                        <li>• Relay 10: <strong className="text-emerald-400">GPIO  4</strong></li>
                        <li>• Relay 12: <strong className="text-emerald-400">GPIO 15</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* Database Connection / Configuration settings modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
