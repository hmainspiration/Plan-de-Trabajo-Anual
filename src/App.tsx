import React, { useState, useEffect, useRef } from 'react';
import { usePlanData } from './lib/store';
import { PREDEFINED_CHURCHES, MONTHS } from './data';
import AreaAccordion from './components/AreaAccordion';
import { exportToExcel } from './export';
import { importFromExcel } from './lib/import';
import { 
  Save, 
  Download, 
  Cloud, 
  CloudOff, 
  Loader2, 
  Building2, 
  User, 
  Sun, 
  Moon, 
  ArrowLeft, 
  FileSpreadsheet, 
  Upload, 
  Lock,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Home } from './components/Home';
import { AdminDashboard } from './components/Admin';

type ViewState = 'home' | 'admin' | 'editor';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.88-9.889 9.88z" />
  </svg>
);

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeChurchId, setActiveChurchId] = useState<string | null>(null);
  
  const { plan, updatePlan, loading, saving, syncError } = usePlanData(activeChurchId);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const [whatsAppSuccessModal, setWhatsAppSuccessModal] = useState(false);
  const [isProcessingSend, setIsProcessingSend] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const bgStyle = isDarkMode 
    ? { background: 'radial-gradient(circle at 0% 0%, #4c1d95 0%, #1e1b4b 50%, #000 100%)' }
    : { background: '#f0f2f5' };

  const handleSelectChurch = (churchId: string, isNew: boolean) => {
    setActiveChurchId(churchId);
    setCurrentView('editor');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const updatedPlan = await importFromExcel(file, plan);
      updatePlan(updatedPlan);
      alert('Datos importados correctamente.');
    } catch (error) {
      console.error(error);
      alert('Error al importar el archivo. Asegúrate de que sea el formato correcto.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const churchName = plan.iglesia || PREDEFINED_CHURCHES.find(c => c.id === activeChurchId)?.name || 'Iglesia';

  const handleConfirmSendWhatsApp = async () => {
    setIsProcessingSend(true);
    try {
      // 1. Generate & download the official XLSX
      const blob = await exportToExcel(plan);
      const fileName = `Plan_Trabajo_${churchName.replace(/\s+/g, '_')}.xlsx`;

      // 2. Prepare message for WhatsApp (+505 5769 3382)
      const targetPhone = "50557693382";
      const message = `¡Hola! Saludos de la iglesia *${churchName}*.\n\n` +
        `Envío el *Plan Anual de Trabajo oficial* (Jurisdicción Nicaragua).\n\n` +
        `👤 *Ministro:* ${plan.ministro || 'No especificado'}\n` +
        `🔢 *Código de acceso:* ${plan.accessCode || 'N/A'}\n` +
        `📊 *Total de Actividades:* ${totalActividades}\n\n` +
        `_He generado el archivo Excel (.xlsx) oficial y lo adjunto a continuación._`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

      // 3. Try Web Share API with File (Supported on modern Android/iOS Chrome & Safari)
      let sharedSuccessfully = false;
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
        try {
          const file = new File([blob], fileName, { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Plan de Trabajo - ${churchName}`,
              text: message
            });
            sharedSuccessfully = true;
          }
        } catch (shareErr) {
          console.log("Web Share omite o cancela, usando enlace directo a WhatsApp:", shareErr);
        }
      }

      // 4. Fallback or standard: Open WhatsApp chat directly
      if (!sharedSuccessfully) {
        window.open(waUrl, '_blank');
      }

      setShowWhatsAppConfirm(false);
      setWhatsAppSuccessModal(true);
    } catch (err) {
      console.error("Error al exportar o enviar a WhatsApp:", err);
      alert("Ocurrió un error al preparar el archivo Excel.");
    } finally {
      setIsProcessingSend(false);
    }
  };

  if (currentView === 'home') {
    return (
      <div className="min-h-screen pb-20 transition-all duration-500" style={bgStyle}>
        <header className={`border-b transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-end">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors flex items-center justify-center ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10' : 'bg-white/50 border-slate-200 text-indigo-600 hover:bg-white'}`}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        <Home 
          isDarkMode={isDarkMode}
          onSelectChurch={handleSelectChurch}
          onAdminLogin={() => setCurrentView('admin')}
        />
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen pb-20 transition-all duration-500" style={bgStyle}>
        <header className={`border-b transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('home')}
              className={`flex items-center text-sm font-medium transition-colors ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <ArrowLeft size={16} className="mr-2" /> Volver al Inicio
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors flex items-center justify-center ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10' : 'bg-white/50 border-slate-200 text-indigo-600 hover:bg-white'}`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        <AdminDashboard isDarkMode={isDarkMode} onLogout={() => setCurrentView('home')} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <div className={`flex flex-col items-center p-8 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
          <Loader2 className={`animate-spin mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={32} />
          <p className={`font-medium tracking-wide text-sm ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>Cargando tu plan de trabajo...</p>
        </div>
      </div>
    );
  }

  const handleIglesiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePlan({ ...plan, iglesia: e.target.value });
  };

  const handleMinistroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePlan({ ...plan, ministro: e.target.value });
  };

  const handleAreaChange = (index: number, updatedArea: any) => {
    const newAreas = [...plan.areas];
    newAreas[index] = updatedArea;
    updatePlan({ ...plan, areas: newAreas });
  };

  const totalActividades = plan.areas.reduce((acc, area) => 
    acc + area.activities.reduce((a, act) => 
      a + MONTHS.reduce((m, month) => m + (act.months[month] || 0), 0)
    , 0)
  , 0);

  return (
    <div className="min-h-screen pb-20 transition-all duration-500" style={bgStyle}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-10 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => {
                setCurrentView('home');
                setActiveChurchId(null);
              }}
              className={`mr-4 p-2 -ml-2 rounded-full transition-colors ${isDarkMode ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className={`text-xl md:text-2xl font-light tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800 font-medium'}`}>
              Plan de Trabajo <span className={isDarkMode ? "font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400" : "font-bold text-indigo-600"}>{PREDEFINED_CHURCHES.find(c => c.id === activeChurchId)?.name || 'Iglesia'}</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors flex items-center justify-center ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10' : 'bg-white/50 border-slate-200 text-indigo-600 hover:bg-white'}`}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {syncError ? (
              <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${isDarkMode ? 'text-red-300 bg-red-900/50 border-red-500/20' : 'text-red-700 bg-red-100 border-red-200'}`} title={syncError}>
                <CloudOff size={14} className="mr-1" />
                <span className="hidden sm:inline">Sin conexión</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1">
                {saving ? (
                  <Loader2 size={14} className={`animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                ) : (
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
                )}
                <span className={`text-[10px] uppercase font-semibold ${isDarkMode ? 'text-white/90' : 'text-slate-700'}`}>{saving ? 'Guardando...' : 'Sincronizado'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {plan.isLocked && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <Lock size={20} className="flex-shrink-0 text-amber-500" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Plan de Trabajo Bloqueado por la Administración</p>
              <p className="opacity-90">Este plan está en modo de solo lectura. No se pueden realizar modificaciones ni cargar nuevos archivos.</p>
            </div>
          </div>
        )}

        {plan.accessCode && (
          <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>Código de Acceso a tu Iglesia</h3>
              <p className={`text-xs ${isDarkMode ? 'text-indigo-300/70' : 'text-indigo-600'}`}>Guarda este código. Se te pedirá la próxima vez que intentes ingresar a esta iglesia.</p>
            </div>
            <div className={`mt-3 sm:mt-0 px-4 py-2 rounded-lg text-lg font-mono font-bold tracking-widest ${isDarkMode ? 'bg-black/40 text-white' : 'bg-white text-indigo-900 border border-indigo-100 shadow-sm'}`}>
              {plan.accessCode}
            </div>
          </div>
        )}

        {/* Info Section */}
        <section className={`rounded-2xl border p-6 mb-6 transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
            <h2 className={`text-[11px] uppercase font-bold tracking-wide ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Información General</h2>
            
            {!plan.isLocked && (
              <div className="mt-3 sm:mt-0 flex gap-2">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  <Upload size={14} className="mr-1.5" /> Importar Excel
                </button>
              </div>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="group">
              <label className={`flex items-center text-[13px] mb-2 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                <Building2 size={16} className={`mr-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
                Nombre de la Iglesia
              </label>
              <input
                type="text"
                value={plan.iglesia}
                onChange={handleIglesiaChange}
                placeholder="Ej. Iglesia Central"
                readOnly
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors opacity-70 cursor-not-allowed ${isDarkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}
              />
            </div>
            
            <div className="group">
              <label className={`flex items-center text-[13px] mb-2 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                <User size={16} className={`mr-2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
                Ministro Actual {plan.isLocked && <Lock size={13} className="ml-1 text-amber-500 inline" />}
              </label>
              <input
                type="text"
                value={plan.ministro}
                onChange={handleMinistroChange}
                placeholder="Ej. Juan Pérez"
                disabled={plan.isLocked}
                readOnly={plan.isLocked}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${plan.isLocked ? (isDarkMode ? 'bg-white/5 border border-white/10 text-white/60 cursor-not-allowed' : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed') : (isDarkMode ? 'bg-white/5 border border-white/10 text-white focus:border-indigo-400 placeholder:text-white/20' : 'bg-transparent border border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400')}`}
              />
            </div>
          </div>
        </section>

        {/* Areas Section */}
        <section>
          {plan.areas.map((area, idx) => (
            <AreaAccordion
              key={idx}
              area={area}
              isDarkMode={isDarkMode}
              isLocked={plan.isLocked}
              onChange={(updated) => handleAreaChange(idx, updated)}
            />
          ))}
        </section>

        {/* Banner de Envío por WhatsApp */}
        <div className={`mt-8 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${isDarkMode ? 'bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border-emerald-500/20' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-sm'}`}>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-white shadow-xs'}`}>
                <WhatsAppIcon className="w-5 h-5" />
              </span>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Envío Oficial a la Jurisdicción
              </h3>
            </div>
            <p className={`text-xs max-w-md ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
              Al finalizar de registrar tus actividades, envía el documento oficial XLSX directamente por WhatsApp al número de la Jurisdicción: <span className="font-semibold text-emerald-600 dark:text-emerald-400">+505 5769 3382</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowWhatsAppConfirm(true)}
            className="flex items-center px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/25 transition-all whitespace-nowrap"
          >
            <WhatsAppIcon className="w-4 h-4 mr-2" /> Enviar por WhatsApp
          </button>
        </div>

      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-30">
        <div className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg text-center ${isDarkMode ? 'bg-black/70 border-white/10' : 'bg-white/95 border-slate-200 shadow-slate-200/50'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Total Anual</div>
          <div className={`text-xl font-bold leading-none ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{totalActividades}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(plan)}
            className={`group flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
            title="Descargar archivo Excel (.xlsx)"
          >
            <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform text-indigo-500" />
          </button>

          <button
            onClick={() => setShowWhatsAppConfirm(true)}
            className="flex items-center gap-2 px-4 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 font-semibold text-xs sm:text-sm"
            title="Enviar a WhatsApp (+505 5769 3382)"
          >
            <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Enviar por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* MODAL: Confirmación antes de enviar por WhatsApp */}
      {showWhatsAppConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all ${isDarkMode ? 'bg-[#151329] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <button
              onClick={() => setShowWhatsAppConfirm(false)}
              disabled={isProcessingSend}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-white/40 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-500">
                <WhatsAppIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">Confirmación de Envío</h3>
                <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                  Destino: Jurisdicción Nicaragua (+505 5769 3382)
                </p>
              </div>
            </div>

            <div className={`p-4 mb-5 rounded-2xl border space-y-2.5 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200/80'}`}>
              <p className="text-sm font-semibold text-center pb-1 border-b border-dashed border-slate-300 dark:border-white/10">
                ¿Completó toda la información del Plan de Trabajo?
              </p>
              <div className="text-xs space-y-1 pt-1 opacity-90">
                <p><span className="font-semibold">🏛️ Iglesia:</span> {churchName}</p>
                <p><span className="font-semibold">👤 Ministro:</span> {plan.ministro || 'No especificado'}</p>
                <p><span className="font-semibold">📊 Total de actividades:</span> {totalActividades}</p>
              </div>
            </div>

            <p className={`text-xs mb-6 text-center ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>
              Al confirmar que la información está completa, se descargará el archivo oficial en Excel (.xlsx) y se abrirá WhatsApp con el mensaje estructurado listo para enviarse.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowWhatsAppConfirm(false)}
                disabled={isProcessingSend}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white/90' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                No, continuar el llenado
              </button>
              
              <button
                type="button"
                onClick={handleConfirmSendWhatsApp}
                disabled={isProcessingSend}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {isProcessingSend ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Preparando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Sí, enviar ahora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Éxito tras abrir WhatsApp y descargar Excel */}
      {whatsAppSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all ${isDarkMode ? 'bg-[#151329] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-bold">¡Envío Iniciado con Éxito!</h3>
              
              <div className={`p-4 rounded-2xl border text-xs text-left space-y-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-emerald-50/60 border-emerald-200 text-slate-700'}`}>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Pasos finales para completar la entrega:
                </p>
                <ol className="list-decimal list-inside space-y-1 opacity-90">
                  <li>El archivo oficial <span className="font-mono font-bold">.xlsx</span> se descargó en tu dispositivo.</li>
                  <li>WhatsApp se abrió con el chat de la Jurisdicción (+505 5769 3382).</li>
                  <li><strong>Adjunta el archivo Excel descargado</strong> y presiona enviar en WhatsApp.</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => setWhatsAppSuccessModal(false)}
                className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Entendido, regresar al plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

