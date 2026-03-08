/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Settings, 
  Zap, 
  Target, 
  Rocket,
  Skull, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut
} from 'lucide-react';

// --- Types ---
type Screen = 'LOGIN' | 'ADMIN' | 'DASHBOARD' | 'RAM_CLEANER' | 'REGEDIT' | 'SENSITIVITY' | 'CROSSHAIR' | 'LAUNCHER';

// --- Components ---

const Header = ({ title, onBack, onLogout }: { title: string; onBack?: () => void; onLogout?: () => void }) => (
  <div className="flex items-center p-6 border-b border-white/5 bg-gaming-bg/80 backdrop-blur-md sticky top-0 z-10">
    {onBack && (
      <button onClick={onBack} className="mr-4 p-2 hover:bg-white/5 rounded-full transition-colors">
        <ChevronLeft className="w-6 h-6 text-gaming-accent" />
      </button>
    )}
    <div className="flex-1">
      <h1 className="text-xl font-bold tracking-tight uppercase italic flex items-center gap-2">
        {!onBack && <Skull className="w-6 h-6 text-gaming-accent" />}
        {title}
      </h1>
      {!onBack && title === "HyperApp Pro" && (
        <p className="text-[10px] text-gaming-accent font-bold tracking-[0.3em] uppercase ml-8 -mt-1">AimHead</p>
      )}
    </div>
    {onLogout && (
      <button 
        onClick={onLogout}
        className="p-2 hover:bg-red-500/10 rounded-xl transition-colors group"
        title="Logout"
      >
        <LogOut className="w-5 h-5 text-white/20 group-hover:text-red-500 transition-colors" />
      </button>
    )}
  </div>
);

const ActionCard = ({ icon: Icon, title, subtitle, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full p-5 rounded-2xl bg-gaming-card neon-border flex items-center gap-4 text-left transition-all group"
  >
    <div className="p-3 rounded-xl bg-gaming-accent-dim group-hover:bg-gaming-accent transition-colors">
      <Icon className="w-6 h-6 text-gaming-accent group-hover:text-black transition-colors" />
    </div>
    <div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-xs text-white/40 uppercase tracking-widest">{subtitle}</p>
    </div>
  </motion.button>
);

const SimulationScreen = ({ 
  title, 
  steps, 
  onComplete, 
  icon: Icon 
}: { 
  title: string; 
  steps: string[]; 
  onComplete: string; 
  icon: any 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
    }
  }, [currentStep, steps.length]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center">
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-4 border-gaming-accent/20 border-t-gaming-accent rounded-full"
              />
              <Icon className="w-12 h-12 text-gaming-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <div className="h-6">
              <motion.p 
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gaming-accent font-mono text-sm"
              >
                {steps[currentStep] || "Finalizing..."}
              </motion.p>
            </div>
            
            <div className="w-64 h-1 bg-white/5 rounded-full mt-8 overflow-hidden">
              <motion.div 
                className="h-full bg-gaming-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-gaming-accent rounded-full flex items-center justify-center mb-6 neon-glow">
              <CheckCircle2 className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Success</h2>
            <p className="text-white/60">{onComplete}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('LOGIN');
  const [crosshairEnabled, setCrosshairEnabled] = useState(false);
  const [crosshairColor, setCrosshairColor] = useState('#FF0000');
  const [inputKey, setInputKey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customKeys, setCustomKeys] = useState<{key: string, expires: string}[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('hyperapp_session');
    
    if (savedSession) {
      const { key, expiry } = JSON.parse(savedSession);
      if (new Date(expiry) > new Date()) {
        setScreen('DASHBOARD');
      } else {
        localStorage.removeItem('hyperapp_session');
      }
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (screen !== 'DASHBOARD') return;

    const updateTimer = () => {
      const savedSession = localStorage.getItem('hyperapp_session');
      if (!savedSession) return;

      const { expiry } = JSON.parse(savedSession);
      const now = new Date().getTime();
      const distance = new Date(expiry).getTime() - now;

      if (distance < 0) {
        localStorage.removeItem('hyperapp_session');
        setScreen('LOGIN');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [screen]);

  const handleLogin = async () => {
    setIsVerifying(true);
    setLoginError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputKey })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.type === 'ADMIN') {
          setScreen('ADMIN');
          fetchKeys();
        } else {
          localStorage.setItem('hyperapp_session', JSON.stringify({
            key: data.key,
            expiry: data.expires
          }));
          setScreen('DASHBOARD');
        }
      } else {
        setLoginError(data.error || 'Invalid license key.');
      }
    } catch (err) {
      setLoginError('Connection error. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setCustomKeys(data);
    } catch (err) {
      console.error("Failed to fetch keys");
    }
  };

  const generateNewKey = async () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newKey = `HYPER-${randomPart}-${new Date().getFullYear()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // Default 1 day
    
    const expires = expiryDate.toISOString();
    
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, expires })
      });
      if (response.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to generate key");
    }
  };

  const deleteKey = async (keyToDelete: string) => {
    try {
      const response = await fetch(`/api/keys/${keyToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to delete key");
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg text-white selection:bg-gaming-accent selection:text-black">
      {/* Global Crosshair Overlay */}
      {crosshairEnabled && (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Circle */}
            <div 
              className="absolute w-4 h-4 rounded-full border-[1.5px]" 
              style={{ borderColor: crosshairColor }}
            />
            {/* Center Dot */}
            <div 
              className="absolute w-0.5 h-0.5 rounded-full" 
              style={{ backgroundColor: crosshairColor }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'LOGIN' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm space-y-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gaming-accent/10 rounded-3xl flex items-center justify-center mb-6 border border-gaming-accent/20 neon-glow">
                  <Skull className="w-10 h-10 text-gaming-accent" />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter mb-0">HYPERAPP</h1>
                <p className="text-gaming-accent text-[10px] font-bold tracking-[0.4em] uppercase mb-4">AimHead</p>
                <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">License Verification Required</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER LICENSE KEY"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full bg-gaming-card border border-white/10 rounded-2xl px-6 py-4 text-center font-mono tracking-widest focus:outline-none focus:border-gaming-accent transition-colors uppercase"
                  />
                </div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold uppercase"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </motion.div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={isVerifying || !inputKey}
                  className="w-full bg-gaming-accent text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isVerifying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    "ACTIVATE SYSTEM"
                  )}
                </button>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
                  Contact admin for keys<br/>
                  v2.0.4 Stable Build
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'ADMIN' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto"
          >
            <Header title="Key Manager" onBack={() => setScreen('LOGIN')} />
            <div className="p-6 space-y-6">
              <div className="p-6 rounded-3xl bg-gaming-accent/10 border border-gaming-accent/20">
                <h3 className="text-lg font-bold mb-2">Admin Control Panel</h3>
                <p className="text-xs text-white/60 mb-6">Generate and manage custom license keys. New keys expire in 24 hours.</p>
                <button
                  onClick={generateNewKey}
                  className="w-full bg-gaming-accent text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Skull className="w-4 h-4" />
                  GENERATE NEW KEY
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Custom Keys</h4>
                {customKeys.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                    <p className="text-xs text-white/20">No custom keys generated yet.</p>
                  </div>
                ) : (
                  customKeys.map((k, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gaming-card border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-gaming-accent font-bold">{k.key}</p>
                        <p className="text-[10px] text-white/40 uppercase">Expires: {new Date(k.expires).toLocaleDateString()} {new Date(k.expires).toLocaleTimeString()}</p>
                      </div>
                      <button 
                        onClick={() => deleteKey(k.key)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-500 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto"
          >
            <Header 
              title="HyperApp Pro" 
              onLogout={() => {
                localStorage.removeItem('hyperapp_session');
                setScreen('LOGIN');
              }}
            />
            
            <div className="p-6 space-y-4">
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-gaming-accent/20 to-transparent border border-gaming-accent/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-black italic tracking-tighter">HYPER MODE</h2>
                    <p className="text-gaming-accent text-xs font-bold tracking-widest">SYSTEM STATUS: OPTIMAL</p>
                  </div>
                  <div className="text-right">
                    <div className="p-2 bg-gaming-accent rounded-lg inline-block mb-2">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    {timeLeft && (
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        Key Expires In: <span className="text-gaming-accent font-mono">{timeLeft}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-1 flex-1 bg-gaming-accent rounded-full" />
                  <div className="h-1 flex-1 bg-gaming-accent rounded-full" />
                  <div className="h-1 flex-1 bg-gaming-accent/20 rounded-full" />
                </div>
              </div>

              <div className="grid gap-4">
                <ActionCard 
                  icon={Cpu} 
                  title="Clean RAM" 
                  subtitle="Memory Optimization"
                  onClick={() => setScreen('RAM_CLEANER')}
                />
                <ActionCard 
                  icon={Settings} 
                  title="Regedit" 
                  subtitle="Registry Tweaks"
                  onClick={() => setScreen('REGEDIT')}
                />
                <ActionCard 
                  icon={Zap} 
                  title="Sensitivity" 
                  subtitle="Touch Response"
                  onClick={() => setScreen('SENSITIVITY')}
                />
                <ActionCard 
                  icon={Target} 
                  title="Tâm Ảo" 
                  subtitle="Overlay Tool"
                  onClick={() => setScreen('CROSSHAIR')}
                />
                <ActionCard 
                  icon={Rocket} 
                  title="Quick Launch" 
                  subtitle="Game Launcher"
                  onClick={() => setScreen('LAUNCHER')}
                />
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'RAM_CLEANER' && (
          <motion.div key="ram" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <Header title="RAM Cleaner" onBack={() => setScreen('DASHBOARD')} />
            <SimulationScreen 
              title="Optimizing Memory"
              icon={Cpu}
              steps={["Scanning memory...", "Cleaning cache...", "Freeing background processes...", "Optimizing RAM..."]}
              onComplete="RAM Optimization Completed. 1.2GB Cleared."
            />
          </motion.div>
        )}

        {screen === 'REGEDIT' && (
          <motion.div key="reg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <Header title="Regedit Pro" onBack={() => setScreen('DASHBOARD')} />
            <SimulationScreen 
              title="Registry Optimization"
              icon={Settings}
              steps={["Applying device tweaks...", "Optimizing registry values...", "Injecting gaming profile...", "Syncing kernel settings..."]}
              onComplete="Regedit Optimization Completed."
            />
          </motion.div>
        )}

        {screen === 'SENSITIVITY' && (
          <motion.div key="sens" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <Header title="Sensitivity Boost" onBack={() => setScreen('DASHBOARD')} />
            <SimulationScreen 
              title="Buffing Response"
              icon={Zap}
              steps={["Analyzing device hardware...", "Applying sensitivity boost...", "Calibrating touch response...", "Reducing input lag..."]}
              onComplete="Sensitivity Boost Applied. 40% faster response."
            />
          </motion.div>
        )}

        {screen === 'CROSSHAIR' && (
          <motion.div key="crosshair" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
            <Header title="Tâm Ảo" onBack={() => setScreen('DASHBOARD')} />
            <div className="p-6 space-y-8">
              <div className="p-8 rounded-3xl bg-gaming-card border border-white/5 flex flex-col items-center">
                <div className="relative w-24 h-24 border border-white/10 rounded-xl flex items-center justify-center mb-6">
                  {/* Preview */}
                  <div className="relative flex items-center justify-center">
                    {/* Circle */}
                    <div 
                      className="absolute w-6 h-6 rounded-full border-2" 
                      style={{ borderColor: crosshairColor }}
                    />
                    {/* Center Dot */}
                    <div 
                      className="absolute w-1 h-1 rounded-full" 
                      style={{ backgroundColor: crosshairColor }}
                    />
                  </div>
                </div>
                <h3 className="font-bold mb-1">Crosshair Preview</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest">Active Overlay</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gaming-card border border-white/5">
                  <div>
                    <h4 className="font-bold">Enable Overlay</h4>
                    <p className="text-xs text-white/40">Show crosshair on screen</p>
                  </div>
                  <button 
                    onClick={() => setCrosshairEnabled(!crosshairEnabled)}
                    className={`w-14 h-8 rounded-full transition-all relative ${crosshairEnabled ? 'bg-gaming-accent' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: crosshairEnabled ? 24 : 4 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-gaming-card border border-white/5">
                  <h4 className="font-bold mb-4">Crosshair Color</h4>
                  <div className="flex gap-4">
                    {['#FF0000', '#00FFAA', '#0088FF', '#FFFF00', '#FFFFFF'].map(color => (
                      <button
                        key={color}
                        onClick={() => setCrosshairColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${crosshairColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gaming-accent/10 border border-gaming-accent/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-gaming-accent shrink-0" />
                <p className="text-xs text-gaming-accent/80 leading-relaxed">
                  The virtual crosshair will remain visible even when you switch to other apps in this browser tab.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'LAUNCHER' && (
          <motion.div key="launcher" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
            <Header title="Quick Launch" onBack={() => setScreen('DASHBOARD')} />
            <div className="p-6 space-y-6">
              <div className="grid gap-4">
                <button 
                  onClick={() => {
                    // Try to open Free Fire (Android Intent)
                    window.location.href = "intent://#Intent;scheme=dtsfreefireth;package=com.dts.freefireth;end";
                    // Fallback for iOS or if intent fails
                    setTimeout(() => {
                      window.location.href = "dtsfreefireth://";
                    }, 500);
                  }}
                  className="group relative overflow-hidden rounded-3xl aspect-video bg-gaming-card border border-white/5 flex items-center justify-center p-6 hover:border-gaming-accent/50 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/5 to-transparent opacity-50" />
                  <div className="relative z-10 text-center">
                    <h3 className="text-3xl font-black italic tracking-tighter group-hover:text-gaming-accent transition-colors">FREE FIRE</h3>
                    <p className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Original Version</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    // Try to open Free Fire MAX (Android Intent)
                    window.location.href = "intent://#Intent;scheme=dtsfreefiremax;package=com.dts.freefiremax;end";
                    // Fallback for iOS or if intent fails
                    setTimeout(() => {
                      window.location.href = "dtsfreefiremax://";
                    }, 500);
                  }}
                  className="group relative overflow-hidden rounded-3xl aspect-video bg-gaming-card border border-white/5 flex items-center justify-center p-6 hover:border-gaming-accent/50 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gaming-accent/5 to-transparent opacity-50" />
                  <div className="relative z-10 text-center">
                    <h3 className="text-3xl font-black italic tracking-tighter group-hover:text-gaming-accent transition-colors">FREE FIRE MAX</h3>
                    <p className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Enhanced Graphics</p>
                  </div>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3">
                <AlertCircle className="w-5 h-5 text-white/40 shrink-0" />
                <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-wider">
                  Note: The app will attempt to launch the game directly. If it doesn't open, please ensure the game is installed on your device.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
