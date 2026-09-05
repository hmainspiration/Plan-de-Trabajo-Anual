import React, { useState } from 'react';
import { PREDEFINED_CHURCHES } from '../data';
import { checkChurchExists, verifyChurchAccess, verifyAdminPin, registerNewChurch } from '../lib/store';
import { Building2, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';

interface HomeProps {
  onSelectChurch: (churchId: string, isNew: boolean) => void;
  onAdminLogin: () => void;
  isDarkMode: boolean;
}

export const Home: React.FC<HomeProps> = ({ onSelectChurch, onAdminLogin, isDarkMode }) => {
  const [selectedChurch, setSelectedChurch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleContinue = async () => {
    if (!selectedChurch) return;
    setLoading(true);
    setError('');

    try {
      const { exists } = await checkChurchExists(selectedChurch);
      if (exists) {
        setShowCodeInput(true);
      } else {
        // Doesn't exist, register it in DB to generate access code
        await registerNewChurch(selectedChurch);
        onSelectChurch(selectedChurch, true);
      }
    } catch (err) {
      setError('Error al conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccess = async () => {
    if (!accessCode) return;
    setLoading(true);
    setError('');

    try {
      const isValid = await verifyChurchAccess(selectedChurch, accessCode);
      if (isValid) {
        onSelectChurch(selectedChurch, false);
      } else {
        setError('Código de acceso incorrecto.');
      }
    } catch (err) {
      setError('Error al verificar el acceso.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPin) return;
    setLoading(true);
    setError('');

    try {
      const isValid = await verifyAdminPin(adminPin);
      if (isValid) {
        onAdminLogin();
      } else {
        setError('PIN de administrador incorrecto.');
      }
    } catch (err) {
      setError('Error al verificar el administrador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-16 p-8 rounded-3xl border shadow-xl backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          <Building2 size={32} />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Plan de Trabajo Anual
        </h1>
        <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
          Jurisdicción Nicaragua
        </p>
      </div>

      {showAdminLogin ? (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
              PIN de Administrador
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none transition-colors ${isDarkMode ? 'bg-black/20 border border-white/10 text-white focus:border-indigo-400' : 'bg-transparent border border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                placeholder="Ej. 123456"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-white/40 hover:text-white/80 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                title={showPin ? "Ocultar PIN" : "Mostrar PIN"}
              >
                {showPin ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowAdminLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Volver
            </button>
            <button
              onClick={handleAdminLogin}
              disabled={loading || !adminPin}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex justify-center items-center"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Ingresar'}
            </button>
          </div>
        </div>
      ) : showCodeInput ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl text-sm ${isDarkMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-800'}`}>
            Esta iglesia ya ha sido registrada. Por favor ingresa el código de 6 dígitos para acceder.
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
              Código de Acceso
            </label>
            <div className="relative">
              <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${isDarkMode ? 'bg-black/20 border border-white/10 text-white focus:border-indigo-400' : 'bg-transparent border border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowCodeInput(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Atrás
            </button>
            <button
              onClick={handleVerifyAccess}
              disabled={loading || !accessCode}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex justify-center items-center"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verificar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
              Selecciona tu Iglesia
            </label>
            <select
              value={selectedChurch}
              onChange={(e) => setSelectedChurch(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${isDarkMode ? 'bg-black/20 border border-white/10 text-white focus:border-indigo-400' : 'bg-transparent border border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
            >
              <option value="" disabled className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>-- Seleccionar Iglesia --</option>
              {PREDEFINED_CHURCHES.map(church => (
                <option key={church.id} value={church.id} className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>
                  {church.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={loading || !selectedChurch}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex justify-center items-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>Continuar <ArrowRight size={18} className="ml-2" /></>
            )}
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-200/20 text-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className={`inline-flex items-center text-xs font-medium ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}
            >
              <Shield size={14} className="mr-1" /> Acceso Administrativo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
