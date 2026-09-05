import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PREDEFINED_CHURCHES } from '../data';
import { checkChurchExists, verifyChurchAccess, verifyAdminPin, registerNewChurch, getChurchIdFromName } from '../lib/store';
import { Building2, Lock, Shield, ArrowRight, Loader2, ChevronDown, Check, X, Search } from 'lucide-react';

interface HomeProps {
  onSelectChurch: (churchId: string, isNew: boolean) => void;
  onAdminLogin: () => void;
  isDarkMode: boolean;
}

// Normalizer for accent-free, lowercase comparison
const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const Home: React.FC<HomeProps> = ({ onSelectChurch, onAdminLogin, isDarkMode }) => {
  const [churchInput, setChurchInput] = useState<string>('');
  const [selectedChurchId, setSelectedChurchId] = useState<string>('');
  const [selectedChurchName, setSelectedChurchName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort suggestions based on input
  const filteredChurches = useMemo(() => {
    const q = normalize(churchInput);
    if (!q) return PREDEFINED_CHURCHES;

    const startsWith = PREDEFINED_CHURCHES.filter(c => normalize(c.name).startsWith(q));
    const contains = PREDEFINED_CHURCHES.filter(c => !normalize(c.name).startsWith(q) && normalize(c.name).includes(q));
    return [...startsWith, ...contains];
  }, [churchInput]);

  const handleSelectChurchItem = (church: { id: string; name: string }) => {
    setChurchInput(church.name);
    setSelectedChurchId(church.id);
    setSelectedChurchName(church.name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChurchInput(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
    setError('');

    // Check if typed value matches an official church exactly
    const exact = PREDEFINED_CHURCHES.find(c => normalize(c.name) === normalize(value));
    if (exact) {
      setSelectedChurchId(exact.id);
      setSelectedChurchName(exact.name);
    } else {
      setSelectedChurchId('');
      setSelectedChurchName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsDropdownOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredChurches.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredChurches.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isDropdownOpen && highlightedIndex >= 0 && filteredChurches[highlightedIndex]) {
        handleSelectChurchItem(filteredChurches[highlightedIndex]);
      } else {
        handleContinue();
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-church-item]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleContinue = async () => {
    const trimmed = churchInput.trim();
    if (!trimmed) {
      setError('Por favor escribe o selecciona el nombre de tu iglesia.');
      inputRef.current?.focus();
      return;
    }

    let finalId = selectedChurchId;
    let finalName = selectedChurchName;

    // If no ID is explicitly selected, resolve automatically
    if (!finalId) {
      const matched = PREDEFINED_CHURCHES.find(c => normalize(c.name) === normalize(trimmed));
      if (matched) {
        finalId = matched.id;
        finalName = matched.name;
      } else {
        finalId = getChurchIdFromName(trimmed);
        finalName = trimmed;
      }
      setSelectedChurchId(finalId);
      setSelectedChurchName(finalName);
    }

    setLoading(true);
    setError('');
    setIsDropdownOpen(false);

    try {
      const { exists, name: existingName } = await checkChurchExists(finalId);
      if (exists) {
        if (existingName) setSelectedChurchName(existingName);
        setShowCodeInput(true);
      } else {
        await registerNewChurch(finalId, finalName);
        onSelectChurch(finalId, true);
      }
    } catch (err) {
      console.error(err);
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
      const isValid = await verifyChurchAccess(selectedChurchId, accessCode);
      if (isValid) {
        onSelectChurch(selectedChurchId, false);
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

  // Helper to visually highlight the typed match in church name
  const renderHighlightedName = (name: string) => {
    const q = normalize(churchInput);
    if (!q) return name;

    const normName = normalize(name);
    const index = normName.indexOf(q);
    if (index === -1) return name;

    const before = name.slice(0, index);
    const match = name.slice(index, index + churchInput.length);
    const after = name.slice(index + churchInput.length);

    return (
      <>
        {before}
        <span className="font-extrabold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/20 px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
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
            La iglesia <span className="font-bold">{selectedChurchName || PREDEFINED_CHURCHES.find(c => c.id === selectedChurchId)?.name || selectedChurchId}</span> ya ha sido registrada. Por favor ingresa el código de 6 dígitos para acceder.
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
          {/* Searchable Combobox with Autocomplete Suggestions */}
          <div ref={containerRef} className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                Selecciona o Escribe tu Iglesia
              </label>
              <span className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                36 iglesias oficiales
              </span>
            </div>

            <div className="relative">
              <Search 
                size={18} 
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isDropdownOpen ? 'text-indigo-500' : isDarkMode ? 'text-white/40' : 'text-slate-400'}`} 
              />

              <input
                ref={inputRef}
                type="text"
                value={churchInput}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe o busca tu iglesia (Ej. Masaya)..."
                autoComplete="off"
                className={`w-full rounded-xl pl-10 pr-20 py-3 text-sm focus:outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-black/20 border border-white/10 text-white placeholder-white/30 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400' 
                    : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs'
                }`}
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {churchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setChurchInput('');
                      setSelectedChurchId('');
                      setSelectedChurchName('');
                      setIsDropdownOpen(true);
                      inputRef.current?.focus();
                    }}
                    className={`p-1 rounded-md transition-colors ${isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                    title="Borrar texto"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`p-1 rounded-md transition-colors ${isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                  title={isDropdownOpen ? "Cerrar lista" : "Ver lista de iglesias"}
                >
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && (
              <div 
                ref={listRef}
                className={`absolute z-30 left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border shadow-2xl backdrop-blur-xl animate-fade-in ${
                  isDarkMode 
                    ? 'bg-[#18162d] border-white/15 divide-y divide-white/5' 
                    : 'bg-white border-slate-200 divide-y divide-slate-100'
                }`}
              >
                {/* Search match counter header */}
                <div className={`px-3.5 py-2 text-[11px] font-semibold flex items-center justify-between ${
                  isDarkMode ? 'bg-white/5 text-white/50' : 'bg-slate-50 text-slate-500'
                }`}>
                  <span>{filteredChurches.length} {filteredChurches.length === 1 ? 'coincidencia' : 'iglesias'}</span>
                  <span className="text-[10px] uppercase tracking-wider font-normal">Orden Alfabético</span>
                </div>

                <div className="py-1">
                  {filteredChurches.map((church, idx) => {
                    const isSelected = selectedChurchId === church.id || normalize(churchInput) === normalize(church.name);
                    const isHighlighted = highlightedIndex === idx;

                    return (
                      <button
                        key={church.id}
                        type="button"
                        data-church-item
                        onClick={() => handleSelectChurchItem(church)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                          isSelected
                            ? isDarkMode ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'bg-indigo-50 text-indigo-700 font-semibold'
                            : isHighlighted
                            ? isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                            : isDarkMode ? 'text-white/80 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          <Building2 size={15} className={`flex-shrink-0 ${isSelected ? 'text-indigo-500' : isDarkMode ? 'text-white/30' : 'text-slate-400'}`} />
                          <span className="truncate">{renderHighlightedName(church.name)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            isDarkMode ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Oficial
                          </span>
                          {isSelected && (
                            <Check size={16} className="text-indigo-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {filteredChurches.length === 0 && (
                    <div className="p-4 text-center">
                      <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                        No se encontró ninguna iglesia oficial con este nombre.
                      </p>
                      {churchInput.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChurchId(getChurchIdFromName(churchInput));
                            setSelectedChurchName(churchInput.trim());
                            setIsDropdownOpen(false);
                          }}
                          className="mt-2 text-xs font-bold text-indigo-500 hover:underline inline-block"
                        >
                          Usar "{churchInput.trim()}" como iglesia personalizada
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={loading || !churchInput.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex justify-center items-center disabled:opacity-50 shadow-md shadow-indigo-600/20 active:scale-98"
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

