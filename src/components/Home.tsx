import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PREDEFINED_CHURCHES } from '../data';
import { checkChurchExists, verifyChurchAccess, verifyAdminPin, registerNewChurch, getChurchIdFromName } from '../lib/store';
import { Building2, Lock, Shield, ArrowRight, Loader2, ChevronDown, Check, X, Search } from 'lucide-react';

const CustomLogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 3987 10118" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve">
    <g transform="translate(5231 -138)">
      <path d="M-3714.36 8972.41-3714.36 8972.42-3714.36 8972.42ZM-3714.36 6840.3-3714.36 6840.3-3714.36 6840.3ZM-3714.36 4164.75-3714.36 4164.75-3714.36 4164.75ZM-4511.4 2719.43-3189.3 2719.74-1917.07 2720.19C-1890.59 2719.99-1888.59 2765.07-1961.01 2774.95-2034.26 2784.1-2150.03 2804.43-2150.34 2816.92L-2160.5 2816.91-2207 2849.54C-2325.75 2935.5-2403.67 3010.21-2456.8 3063.13-2510.53 3112.14-2572.92 3270.85-2587.85 3361.01L-2590.64 3389.4-2355.32 3389.52C-2320.68 3411.06-2389.98 3453.66-2466.27 3490.83L-2471.79 3490.81-2503.69 3525.91C-2587.02 3620.45-2641.7 3702.62-2678.98 3760.83-2716.69 3814.73-2760.47 3989.28-2770.95 4088.44L-2772.33 4110.48-2766.98 4122.45-2762.86 4122.45C-2739.5 4122.45-2720.56 4141.39-2720.56 4164.75L-2720.56 4164.75C-2720.56 4176.44-2725.3 4187.01-2732.95 4194.67L-2739.56 4199.12-2738.31 4203.46C-2712.51 4316.64-2729.13 4445.87-2800.9 4519.57L-2823.43 4539.3-2811.94 4550.95C-2710.22 4667.87-2691.53 4909.11-2800.9 5021.41L-2823.43 5041.15-2811.94 5052.79C-2710.22 5169.71-2691.53 5410.95-2800.9 5523.25L-2823.43 5542.99-2811.94 5554.64C-2710.22 5671.56-2691.53 5912.79-2800.9 6025.1L-2823.43 6044.83-2811.94 6056.48C-2735.65 6144.17-2706.07 6301.79-2742.18 6422.5L-2745.28 6431.24-2705.78 6466.01C-2558.81 6590.75-2403.59 6704.9-2253.43 6805.72L-2233.9 6818.53-2245.87 6810.16C-2257.87 6801.51-2268.36 6793.63-2277.13 6786.67-2336.84 6498.73-2514.81 5918.77-2525.09 5609.03-2538.67 5199.98-2458.25 4694.72-2341.38 4560.96-2302.3 4518.37-2114.43 4501.15-1910.73 4500.43-1648.83 4499.51-1360.78 4525.87-1329.16 4560.61-1486.15 4918.55-1669.45 5295.94-1704.86 5691.34-1741.25 6089.87-1719.9 6356.51-1689.46 6610.27-1659.02 6864.03-1517.01 7157.66-1453.16 7248.45-1465.81 7247.81-1485.97 7241.85-1511.85 7231.7L-1519.99 7228.24-1519.59 7228.44C-1481.23 7246.64-1450.79 7260.12-1429.93 7268.54-1204.2 7369.17-1247.71 7209.3-1246.81 7396.94-1245.87 7593.45-1299.79 8395.8-1301.74 8440.4-1618.5 8442.33-2194.5 8044.11-2718.49 7614.34L-2768.68 7572.55-2768.68 8907.67C-2768.68 8913.05-2769.77 8918.17-2771.75 8922.83L-2776.65 8930.11-2762.86 8930.11C-2739.5 8930.11-2720.56 8949.05-2720.56 8972.42L-2720.56 8972.42C-2720.56 8984.1-2725.3 8994.67-2732.95 9002.33L-2744.62 9010.2-2732.32 9010.2C-2712.23 9010.2-2695.94 9026.48-2695.94 9046.57-2695.94 9066.66-2712.23 9082.95-2732.32 9082.95L-2732.38 9082.95-2731.23 9116.33C-2724.16 9208.02-2687.17 9380.78-2633.29 9491.54-2579.41 9602.3-2509.66 9690.18-2408.34 9795.56L-2365.05 9839.76-2299.7 9839.76C-2245.87 9839.76-2202.24 9883.4-2202.24 9937.23L-2202.24 9937.23C-2202.24 9977.6-2226.78 10012.2-2261.77 10027L-2265.92 10027.9-1984.34 10027.9C-1949.45 10027.9-1921.17 10056.2-1921.17 10091L-1921.17 10192.8C-1921.17 10227.7-1949.45 10256-1984.34 10256L-4474.24 10256C-4509.13 10256-4537.42 10227.7-4537.42 10192.8L-4537.42 10091C-4537.42 10056.2-4509.13 10027.9-4474.24 10027.9L-4192.66 10027.9-4196.82 10027C-4231.8 10012.2-4256.35 9977.6-4256.35 9937.23-4256.35 9883.4-4212.71 9839.76-4158.88 9839.76L-3119.28 9839.76-3234.95 9839.43-4074.07 9835.86C-3956.51 9703.74-3883.26 9588.18-3835.5 9509.58-3793.22 9445.9-3744.14 9239.67-3732.39 9122.51L-3729.99 9082.2-3740.43 9080.09C-3753.48 9074.57-3762.64 9061.64-3762.64 9046.57-3762.64 9026.48-3746.36 9010.2-3726.27 9010.2L-3686.86 9010.2-3695.71 9007.49C-3702.46 9002.93-3707.83 8996.47-3711.04 8988.88L-3714.36 8972.42-3711.04 8955.95C-3704.61 8940.76-3689.58 8930.11-3672.06 8930.11L-3657.5 8930.11-3662.41 8922.83C-3664.38 8918.17-3665.47 8913.05-3665.47 8907.67L-3665.47 6894.29-3663.11 6882.6-3672.06 6882.6C-3689.58 6882.6-3704.61 6871.95-3711.04 6856.77L-3714.36 6840.3-3711.04 6823.83C-3704.61 6808.65-3689.58 6798-3672.06 6798L-3639.31 6798-3824.73 6630.47C-3883.34 6577.96-3942.23 6525.55-4000.88 6473.71L-4147.54 6345.05-4130.2 6454.45C-4089.9 6733.14-4063.5 7095.56-4075.32 7403.4-4088.82 7755.22-4131.34 8317.71-4229.27 8451.48-4421.98 8537.05-5089.62 8374.64-5231 8183.23-4711.96 7327.06-4742.61 6900.7-4752.56 6578.66-4761.9 6276.75-4868.95 5835.55-4926.39 5706.77L-4929.46 5700.65-4972.53 5669.53C-4989.39 5657.63-5005.36 5646.65-5020.37 5636.67-5105.93 5579.76-5134.59 5590.54-5177.32 5601.97-5237.31 5408.09-5134.1 4505.75-5084.31 4522.79-4546.73 4723.93-4097.85 5083.77-3712.79 5454.78L-3660.95 5505.73-3658.2 5484.48C-3651.88 5446.78-3641.06 5408.68-3624.24 5371.57L-3607.47 5339.2-3607.76 5338.87C-3633.08 5293.71-3713.94 5067.63-3624.24 4869.73L-3607.47 4837.36-3607.76 4837.03C-3633.08 4791.87-3713.94 4565.78-3624.24 4367.88L-3607.47 4335.52-3607.76 4335.19C-3617.25 4318.25-3634.56 4275.87-3647.75 4219.08L-3649.99 4207.06-3672.06 4207.06C-3689.58 4207.06-3704.61 4196.4-3711.04 4181.22L-3714.36 4164.75-3711.04 4148.29C-3704.61 4133.11-3689.58 4122.45-3672.06 4122.45L-3662.24 4122.45-3662.24 4122.38-3662.86 4122.38-3663.3 4110.3-3665.12 4089.54-3664.98 4084.41-3668.2 4056.57C-3679.94 3975.36-3710.07 3856.45-3751.26 3776.1-3799.31 3682.35-3861.53 3607.97-3951.9 3518.77L-3987.54 3484.24-3991.25 3484.22C-4056.1 3447.35-4136.5 3418.37-4099.11 3388.76L-3859.08 3388.84-3860.38 3365.77C-3869.37 3295.2-3916.39 3162.25-3984.87 3077.02-4053.35 2991.78-4142.02 2924.15-4270.8 2843.05L-4316.33 2814.9-4324.02 2814.89C-4321 2805.47-4406.02 2786.89-4477.33 2771.11-4563.56 2753.67-4538.14 2721.66-4511.4 2719.43ZM-4113.76 983.271C-4126.18 1104.05-4096.57 1188.4-4048.14 1302.88-3999.71 1417.35-3899.46 1547.56-3823.18 1670.14-3746.9 1792.71-3630.81 1900.89-3590.48 2038.34-3550.14 2175.8-3575.53 2347.94-3803.66 2494.87-3787.12 2300.43-3833.11 2228.76-3918.29 2044.99-4003.46 1861.22-4279.92 1576.89-4322.65 1392.25-4352.1 1231-4268.45 1084.77-4113.76 983.271ZM-3678.02 511.789C-3694.47 675.698-3655.28 790.172-3591.19 945.532-3527.09 1100.89-3394.41 1277.59-3293.46 1443.95-3192.52 1610.3-3038.88 1757.11-2985.49 1943.65-2932.11 2130.2-2965.71 2363.81-3267.62 2563.22-3245.74 2299.33-3306.61 2202.07-3419.33 1952.68-3532.06 1703.28-3897.93 1317.41-3954.49 1066.83-3993.46 847.984-3882.75 649.543-3678.02 511.789ZM-3178.33 138C-3196.33 318.806-3153.44 445.082-3083.28 616.459-3013.12 787.835-2867.9 982.755-2757.4 1166.26-2646.9 1349.76-2478.73 1511.7-2420.3 1717.48-2361.87 1923.26-2398.64 2180.95-2729.12 2400.92-2705.16 2109.83-2771.79 2002.54-2895.17 1727.43-3018.56 1452.32-3419.04 1026.68-3480.94 750.259-3523.6 508.854-3402.43 289.955-3178.33 138Z" />
    </g>
  </svg>
);

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

  const handleSelectChurchItem = async (church: { id: string; name: string }) => {
    setChurchInput(church.name);
    setSelectedChurchId(church.id);
    setSelectedChurchName(church.name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setError('');

    setLoading(true);
    try {
      const { exists, name: existingName } = await checkChurchExists(church.id);
      if (exists) {
        if (existingName) setSelectedChurchName(existingName);
        setShowCodeInput(true);
      } else {
        setShowCodeInput(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error al verificar la iglesia.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChurchInput(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
    setError('');
    setShowCodeInput(false);
    setAccessCode('');

    // Check if typed value matches an official church exactly
    const exact = PREDEFINED_CHURCHES.find(c => normalize(c.name) === normalize(value));
    if (exact) {
      setSelectedChurchId(exact.id);
      setSelectedChurchName(exact.name);
      checkExistingInline(exact.id);
    } else {
      setSelectedChurchId('');
      setSelectedChurchName('');
    }
  };

  const checkExistingInline = async (id: string) => {
    setLoading(true);
    try {
      const { exists, name: existingName } = await checkChurchExists(id);
      if (exists) {
        if (existingName) setSelectedChurchName(existingName);
        setShowCodeInput(true);
      } else {
        setShowCodeInput(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

    if (showCodeInput) {
      handleVerifyAccess();
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
          <CustomLogoIcon className="w-8 h-8" />
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
                          <CustomLogoIcon className={`w-[15px] h-[15px] flex-shrink-0 ${isSelected ? 'text-indigo-500' : isDarkMode ? 'text-white/30' : 'text-slate-400'}`} />
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

          {showCodeInput && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-xl text-sm ${isDarkMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-800'}`}>
                La iglesia <span className="font-bold">{selectedChurchName}</span> ya está registrada. Por favor ingresa el código de acceso.
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  Código de Acceso (PIN)
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
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={loading || !churchInput.trim() || (showCodeInput && !accessCode.trim())}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex justify-center items-center disabled:opacity-50 shadow-md shadow-indigo-600/20 active:scale-98"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              showCodeInput ? 'Verificar y Entrar' : (
                <>Continuar <ArrowRight size={18} className="ml-2" /></>
              )
            )}
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-200/20 text-center">
            <button
              onClick={() => setShowAdminLogin(true)}
              className={`inline-flex items-center text-xs font-medium ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}
            >
              <Shield size={14} className="mr-1" /> Acceso Administrativo
            </button>
            <div className={`mt-2 text-[10px] ${isDarkMode ? 'text-white/30' : 'text-slate-300'}`}>v1.0.1</div>
          </div>
        </div>
      )}
    </div>
  );
};

