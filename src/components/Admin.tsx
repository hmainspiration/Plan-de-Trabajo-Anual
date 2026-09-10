import React, { useState, useEffect, useRef } from 'react';
import { PlanState, PREDEFINED_CHURCHES, MONTHS, createInitialState } from '../data';
import { getAllPlans, updatePlanAdmin, useAdminSettings, updateAdminConfig, deleteChurchPlan } from '../lib/store';
import { importFromExcel } from '../lib/import';
import { 
  Building2, 
  LogOut, 
  Download, 
  Users, 
  BarChart3, 
  Loader2, 
  Edit2, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert,
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Copy,
  Trash2,
  Upload,
  ChevronsDown,
  ChevronsUp,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { exportToExcel } from '../export';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.88-9.889 9.88z" />
  </svg>
);

interface AdminDashboardProps {
  isDarkMode: boolean;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode, onLogout }) => {
  const [plans, setPlans] = useState<PlanState[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'consolidated'>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { config: adminConfig, loading: loadingConfig } = useAdminSettings();
  const [isTogglingWhatsApp, setIsTogglingWhatsApp] = useState(false);

  // Delete church state
  const [churchToDelete, setChurchToDelete] = useState<PlanState | null>(null);
  const [isDeletingChurch, setIsDeletingChurch] = useState(false);

  // Excel import state
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [adminToast, setAdminToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [editingField, setEditingField] = useState<'ministro' | 'accessCode' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async (code: string) => {
    if (!code) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Error copying code:', err);
    }
  };

  // Accordion open/close state for church detail view
  const [openDetailAreas, setOpenDetailAreas] = useState<Record<number, boolean>>({});

  // Accordion open/close state for consolidated view
  const [openConsolidatedAreas, setOpenConsolidatedAreas] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getAllPlans();
        setPlans(data);
        // By default open the first registered church if available
        if (data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(data[0].churchId || null);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getChurchName = (id: string) => {
    const plan = plans.find(p => p.churchId === id);
    if (plan && plan.iglesia) return plan.iglesia;
    return PREDEFINED_CHURCHES.find(c => c.id === id)?.name || id;
  };

  const selectedPlan = plans.find(p => p.churchId === selectedPlanId);

  // Whenever a new plan is selected, expand areas that have activities
  useEffect(() => {
    if (selectedPlan) {
      const initialOpen: Record<number, boolean> = {};
      selectedPlan.areas.forEach((area, idx) => {
        const hasData = area.activities.some(act => {
          const total = MONTHS.reduce((sum, m) => sum + (act.months[m] || 0), 0);
          return total > 0 || (act.observaciones && act.observaciones.trim() !== "");
        });
        if (hasData) {
          initialOpen[idx] = true;
        }
      });
      setOpenDetailAreas(initialOpen);
    }
  }, [selectedPlanId]);

  const calculateConsolidated = () => {
    const consolidated = createInitialState();
    consolidated.iglesia = "Consolidado Nacional";
    
    plans.forEach(plan => {
      plan.areas.forEach((area, aIdx) => {
        area.activities.forEach((act, actIdx) => {
          MONTHS.forEach(month => {
            consolidated.areas[aIdx].activities[actIdx].months[month] += (act.months[month] || 0);
          });
        });
      });
    });

    return consolidated;
  };

  const consolidatedData = calculateConsolidated();

  // Initialize consolidated areas on switch
  useEffect(() => {
    if (activeTab === 'consolidated') {
      const initialOpen: Record<number, boolean> = {};
      consolidatedData.areas.forEach((area, idx) => {
        const hasData = area.activities.some(act => MONTHS.reduce((sum, m) => sum + (act.months[m] || 0), 0) > 0);
        if (hasData) {
          initialOpen[idx] = true;
        }
      });
      setOpenConsolidatedAreas(initialOpen);
    }
  }, [activeTab]);

  const toggleDetailArea = (idx: number) => {
    setOpenDetailAreas(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const setAllDetailAreas = (open: boolean) => {
    if (!selectedPlan) return;
    const newState: Record<number, boolean> = {};
    selectedPlan.areas.forEach((_, idx) => {
      newState[idx] = open;
    });
    setOpenDetailAreas(newState);
  };

  const toggleConsolidatedArea = (idx: number) => {
    setOpenConsolidatedAreas(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const setAllConsolidatedAreas = (open: boolean) => {
    const newState: Record<number, boolean> = {};
    consolidatedData.areas.forEach((_, idx) => {
      newState[idx] = open;
    });
    setOpenConsolidatedAreas(newState);
  };

  const formatMonth = (m: string) => {
    const parts = m.split('-');
    if (parts.length === 2) return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} '${parts[1]}`;
    return m.toUpperCase();
  };

  const startEdit = (field: 'ministro' | 'accessCode', currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = async () => {
    if (!selectedPlanId || !editingField) return;
    setIsSavingEdit(true);
    try {
      const updates = { [editingField]: editValue };
      await updatePlanAdmin(selectedPlanId, updates);
      setPlans(plans.map(p => p.churchId === selectedPlanId ? { ...p, ...updates } : p));
      setEditingField(null);
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleLock = async () => {
    if (!selectedPlan || !selectedPlan.churchId) return;
    const newLockStatus = !selectedPlan.isLocked;
    setIsTogglingLock(true);
    try {
      await updatePlanAdmin(selectedPlan.churchId, { isLocked: newLockStatus });
      setPlans(plans.map(p => p.churchId === selectedPlan.churchId ? { ...p, isLocked: newLockStatus } : p));
    } catch (error) {
      console.error("Error al actualizar bloqueo:", error);
      alert("Error al cambiar el estado de bloqueo de la iglesia.");
    } finally {
      setIsTogglingLock(false);
    }
  };

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlan || !selectedPlan.churchId) return;

    setIsImportingExcel(true);
    setAdminToast(null);

    try {
      const updatedPlan = await importFromExcel(file, selectedPlan);
      updatedPlan.churchId = selectedPlan.churchId;
      updatedPlan.updatedAt = Date.now();
      if (!updatedPlan.iglesia) updatedPlan.iglesia = selectedPlan.iglesia;
      if (!updatedPlan.accessCode) updatedPlan.accessCode = selectedPlan.accessCode;

      await updatePlanAdmin(selectedPlan.churchId, updatedPlan);
      setPlans(prev => prev.map(p => p.churchId === selectedPlan.churchId ? updatedPlan : p));

      setAdminToast({
        type: 'success',
        message: `¡Datos importados y actualizados correctamente desde Excel para "${getChurchName(selectedPlan.churchId)}"!`
      });
      setTimeout(() => setAdminToast(null), 4000);
    } catch (err) {
      console.error("Error al importar Excel en administración:", err);
      setAdminToast({
        type: 'error',
        message: 'No se pudo importar el archivo. Asegúrate de que sea el formato de Plan de Trabajo oficial.'
      });
      setTimeout(() => setAdminToast(null), 5000);
    } finally {
      setIsImportingExcel(false);
      if (adminFileInputRef.current) {
        adminFileInputRef.current.value = '';
      }
    }
  };

  const confirmDeleteChurch = async () => {
    if (!churchToDelete || !churchToDelete.churchId) return;

    const idToDelete = churchToDelete.churchId;
    const nameToDelete = getChurchName(idToDelete);
    setIsDeletingChurch(true);

    try {
      await deleteChurchPlan(idToDelete);
      const remainingPlans = plans.filter(p => p.churchId !== idToDelete);
      setPlans(remainingPlans);

      if (selectedPlanId === idToDelete) {
        setSelectedPlanId(remainingPlans.length > 0 ? (remainingPlans[0].churchId || null) : null);
      }

      setChurchToDelete(null);
      setAdminToast({
        type: 'success',
        message: `El registro de "${nameToDelete}" fue eliminado de la base de datos.`
      });
      setTimeout(() => setAdminToast(null), 4000);
    } catch (err) {
      console.error("Error al eliminar iglesia:", err);
      setAdminToast({
        type: 'error',
        message: 'Ocurrió un error al intentar eliminar la iglesia de la base de datos.'
      });
      setTimeout(() => setAdminToast(null), 5000);
    } finally {
      setIsDeletingChurch(false);
    }
  };

  const handleToggleWhatsApp = async () => {
    setIsTogglingWhatsApp(true);
    try {
      const nextVal = !adminConfig.enableWhatsApp;
      await updateAdminConfig({ enableWhatsApp: nextVal });
    } catch (error) {
      console.error("Error toggling WhatsApp:", error);
      alert("Error al actualizar la configuración de WhatsApp.");
    } finally {
      setIsTogglingWhatsApp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className={`animate-spin mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={32} />
        <p className={`font-medium tracking-wide text-sm ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>Cargando datos administrativos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Panel de Administración</h1>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Supervisión, bloqueo y consolidado nacional</p>
        </div>
        <button 
          onClick={onLogout}
          className={`mt-4 sm:mt-0 flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}
        >
          <LogOut size={16} className="mr-2" /> Salir
        </button>
      </div>

      {/* Control Global: Opción de Envío por WhatsApp */}
      <div className={`mb-6 p-4 sm:p-5 rounded-2xl border transition-all ${
        isDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
              adminConfig.enableWhatsApp
                ? 'bg-emerald-500/15 text-emerald-500'
                : isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'
            }`}>
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Opción de Envío por WhatsApp
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  adminConfig.enableWhatsApp
                    ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                    : isDarkMode ? 'bg-white/10 text-white/50 border border-white/10' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {adminConfig.enableWhatsApp ? (
                    <>
                      <Check size={12} className="stroke-[3]" /> Desbloqueado para Iglesias
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} /> Oculto para Iglesias (Por defecto)
                    </>
                  )}
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-xl ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                {adminConfig.enableWhatsApp 
                  ? 'El botón y el banner de envío por WhatsApp están actualmente VISIBLES para todas las iglesias.'
                  : 'El botón y banner de WhatsApp se mantienen OCULTOS en los formularios de las iglesias. Puedes activarlo cuando lo desees.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleWhatsApp}
            disabled={isTogglingWhatsApp}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm whitespace-nowrap ${
              adminConfig.enableWhatsApp
                ? isDarkMode 
                  ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30' 
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isTogglingWhatsApp ? (
              <Loader2 size={16} className="animate-spin" />
            ) : adminConfig.enableWhatsApp ? (
              <>
                <EyeOff size={16} /> Bloquear / Ocultar a Iglesias
              </>
            ) : (
              <>
                <Unlock size={16} /> Desbloquear WhatsApp
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`flex p-1 mb-6 rounded-xl w-fit ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
        <button
          onClick={() => { setActiveTab('list'); }}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? (isDarkMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-700 shadow-sm') : (isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
        >
          <Building2 size={16} className="mr-2" /> Iglesias Registradas ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('consolidated')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'consolidated' ? (isDarkMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-700 shadow-sm') : (isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
        >
          <BarChart3 size={16} className="mr-2" /> Consolidado General
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Iglesias ({plans.length})</h3>
            {plans.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>No hay datos registrados aún.</p>
            ) : (
              plans.map(plan => (
                <div key={plan.churchId} className="relative group">
                  <button
                    onClick={() => setSelectedPlanId(plan.churchId || null)}
                    className={`w-full flex items-center p-4 pr-11 rounded-xl border text-left transition-all ${selectedPlanId === plan.churchId ? (isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200') : (isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm')}`}
                  >
                    <Building2 size={20} className={`mr-3 flex-shrink-0 ${selectedPlanId === plan.churchId ? 'text-indigo-500' : (isDarkMode ? 'text-white/40' : 'text-slate-400')}`} />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate ${selectedPlanId === plan.churchId ? (isDarkMode ? 'text-indigo-300' : 'text-indigo-700') : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>
                          {getChurchName(plan.churchId!)}
                        </p>
                        {plan.isLocked && (
                          <span title="Edición bloqueada" className={`ml-1.5 flex-shrink-0 p-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                            <Lock size={11} /> Bloqueada
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                        {plan.ministro || 'Sin ministro registrado'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChurchToDelete(plan);
                    }}
                    title={`Eliminar registro de ${getChurchName(plan.churchId!)}`}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-all ${
                      isDarkMode 
                        ? 'hover:bg-red-500/20 text-red-400/80 hover:text-red-300' 
                        : 'hover:bg-red-50 text-red-500 hover:text-red-700'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="md:col-span-2">
            {selectedPlan ? (
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                {/* Header of selected church */}
                <div className="mb-6 pb-5 border-b border-dashed border-slate-200 dark:border-white/10 space-y-4">
                  {/* Church Identity & Metadata (Full width, generous breathing room) */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {getChurchName(selectedPlan.churchId!)}
                      </h2>
                      {selectedPlan.isLocked && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          <Lock size={12} /> Bloqueado para cambios
                        </span>
                      )}
                    </div>
                    
                    {/* Metadata Row: Ministro & Código de Acceso with ample space */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      {/* Ministro Inline Edit */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-semibold whitespace-nowrap ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Ministro:</span>
                        {editingField === 'ministro' ? (
                          <div className="flex items-center gap-1">
                            <input 
                              value={editValue} 
                              onChange={e => setEditValue(e.target.value)} 
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEdit();
                                } else if (e.key === 'Escape') {
                                  setEditingField(null);
                                }
                              }}
                              className={`px-2.5 py-1 text-sm rounded-lg border ${isDarkMode ? 'bg-black/30 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                              autoFocus
                            />
                            <button onClick={handleSaveEdit} disabled={isSavingEdit} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingField(null)} disabled={isSavingEdit} className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group">
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedPlan.ministro || 'No asignado'}</span>
                            <button onClick={() => startEdit('ministro', selectedPlan.ministro)} title="Editar ministro" className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-white/10 text-indigo-500 transition-all">
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Access Code Inline Edit */}
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold whitespace-nowrap ${isDarkMode ? 'text-indigo-300/80' : 'text-indigo-600/80'}`}>Código de acceso:</span>
                        {editingField === 'accessCode' ? (
                          <div className="flex items-center gap-1">
                            <input 
                              value={editValue} 
                              onChange={e => setEditValue(e.target.value)} 
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEdit();
                                } else if (e.key === 'Escape') {
                                  setEditingField(null);
                                }
                              }}
                              className={`px-2.5 py-1 text-sm font-mono rounded-lg border w-24 ${isDarkMode ? 'bg-black/30 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                              maxLength={6}
                              autoFocus
                            />
                            <button onClick={handleSaveEdit} disabled={isSavingEdit} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingField(null)} disabled={isSavingEdit} className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group">
                            <span className={`font-mono font-bold tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedPlan.accessCode}</span>
                            <button 
                              onClick={() => handleCopyCode(selectedPlan.accessCode || '')} 
                              title="Copiar código" 
                              className={`p-1 rounded-md transition-all ${
                                copiedCode 
                                  ? 'text-emerald-500 bg-emerald-500/10' 
                                  : 'opacity-0 group-hover:opacity-100 hover:bg-indigo-50 dark:hover:bg-white/10 text-indigo-500'
                              }`}
                            >
                              {copiedCode ? <Check size={13} className="stroke-[3]" /> : <Copy size={13} />}
                            </button>
                            <button onClick={() => startEdit('accessCode', selectedPlan.accessCode || '')} title="Editar código PIN" className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-white/10 text-indigo-500 transition-all">
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Toolbar: Dedicated row below info so buttons never compress the minister name */}
                  <div className={`pt-3.5 border-t flex flex-wrap items-center gap-2 sm:gap-2.5 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    <button
                      onClick={handleToggleLock}
                      disabled={isTogglingLock}
                      className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selectedPlan.isLocked 
                          ? (isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 shadow-sm')
                          : (isDarkMode ? 'bg-white/10 text-white/90 border-white/15 hover:bg-white/20' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm')
                      }`}
                      title={selectedPlan.isLocked ? "Haz clic para desbloquear y permitir modificaciones a esta iglesia" : "Haz clic para bloquear y evitar que modifiquen este plan"}
                    >
                      {isTogglingLock ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : selectedPlan.isLocked ? (
                        <Lock size={14} className="mr-1.5 text-amber-500" />
                      ) : (
                        <Unlock size={14} className="mr-1.5 text-emerald-500" />
                      )}
                      <span>{selectedPlan.isLocked ? "Desbloquear Edición" : "Bloquear Edición"}</span>
                    </button>

                    {/* Import XLSX */}
                    <input
                      type="file"
                      ref={adminFileInputRef}
                      onChange={handleAdminFileUpload}
                      accept=".xlsx, .xls"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => adminFileInputRef.current?.click()}
                      disabled={isImportingExcel}
                      className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isDarkMode 
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm'
                      }`}
                      title="Importar archivo Excel para autollenar o actualizar las actividades de esta iglesia"
                    >
                      {isImportingExcel ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : (
                        <Upload size={14} className="mr-1.5 text-emerald-500" />
                      )}
                      <span>Importar XLSX</span>
                    </button>

                    <button
                      onClick={() => exportToExcel(selectedPlan)}
                      className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isDarkMode 
                          ? 'bg-indigo-600/80 hover:bg-indigo-600 text-white border-indigo-500/30' 
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                      }`}
                    >
                      <Download size={14} className="mr-1.5 text-indigo-400" />
                      <span>Exportar XLSX</span>
                    </button>

                    {/* Delete Church button (Separated to the right on larger screens) */}
                    <button
                      type="button"
                      onClick={() => setChurchToDelete(selectedPlan)}
                      className={`sm:ml-auto flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isDarkMode 
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30' 
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-sm'
                      }`}
                      title={`Eliminar el registro de ${getChurchName(selectedPlan.churchId!)}`}
                    >
                      <Trash2 size={14} className="mr-1.5 text-red-500" />
                      <span>Eliminar Iglesia</span>
                    </button>
                  </div>
                </div>
                
                {/* Desplegable: Detalle de Actividades */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className={`text-sm font-bold uppercase tracking-wide ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                        Detalle de Actividades por Área
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Haz clic en cualquier área para desplegar u ocultar su información</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => setAllDetailAreas(true)} 
                        title="Expandir todo"
                        aria-label="Expandir todo"
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 text-indigo-300 hover:text-white' 
                            : 'bg-white border-slate-200 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 shadow-xs'
                        }`}
                      >
                        <ChevronsDown size={18} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAllDetailAreas(false)} 
                        title="Colapsar todo"
                        aria-label="Colapsar todo"
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/50 hover:text-white' 
                            : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-xs'
                        }`}
                      >
                        <ChevronsUp size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {selectedPlan.areas.map((area, idx) => {
                    const activeActivities = area.activities.filter(act => {
                      const total = MONTHS.reduce((sum, m) => sum + (act.months[m] || 0), 0);
                      return total > 0 || (act.observaciones && act.observaciones.trim() !== "");
                    });

                    const areaTotal = area.activities.reduce((sum, act) => sum + MONTHS.reduce((mSum, m) => mSum + (act.months[m] || 0), 0), 0);
                    const isOpen = openDetailAreas[idx] ?? (activeActivities.length > 0);

                    if (activeActivities.length === 0) {
                      return (
                        <div key={idx} className={`p-3 rounded-xl border text-xs flex justify-between items-center opacity-60 ${isDarkMode ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                          <span>{area.name}</span>
                          <span className="italic">Sin actividades programadas</span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`rounded-xl border overflow-hidden transition-all ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        {/* Accordion header */}
                        <button
                          type="button"
                          onClick={() => toggleDetailArea(idx)}
                          className={`w-full p-4 flex items-center justify-between text-left transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100/70'}`}
                        >
                          <div className="flex items-center gap-3 pr-2">
                            <div className={`p-1.5 rounded-lg flex items-center justify-center transition-transform ${isDarkMode ? 'bg-white/10 text-indigo-300' : 'bg-white text-indigo-600 shadow-sm'}`}>
                              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            <div>
                              <h4 className={`font-bold text-sm leading-snug ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>{area.name}</h4>
                              <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                                {activeActivities.length} {activeActivities.length === 1 ? 'actividad con registros' : 'actividades con registros'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                              Total: {areaTotal}
                            </span>
                          </div>
                        </button>

                        {/* Accordion content */}
                        {isOpen && (
                          <div className={`p-4 pt-2 border-t space-y-3 ${isDarkMode ? 'border-white/10 bg-black/10' : 'border-slate-200 bg-white/50'}`}>
                            {activeActivities.map((act, actIdx) => {
                              const activeMonths = MONTHS.filter(m => (act.months[m] || 0) > 0);
                              const total = activeMonths.reduce((sum, m) => sum + act.months[m], 0);

                              return (
                                <div key={actIdx} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-medium pr-4 ${isDarkMode ? 'text-white/90' : 'text-slate-800'}`}>{act.name}</span>
                                    <span className={`text-sm font-bold shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{total > 0 ? total : '-'}</span>
                                  </div>
                                  {activeMonths.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {activeMonths.map(m => (
                                        <span key={m} className={`text-[10px] px-2 py-0.5 rounded font-medium ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                          {formatMonth(m)}: {act.months[m]}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {act.observaciones && (
                                    <p className={`text-xs mt-2 italic ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                                      Nota: {act.observaciones}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={`h-full min-h-[300px] flex flex-col items-center justify-center rounded-2xl border border-dashed ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-300 bg-slate-50'}`}>
                <Building2 size={48} className={`mb-4 ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>Selecciona una iglesia para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consolidado General Desplegable */}
      {activeTab === 'consolidated' && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
            <div>
              <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Datos Consolidados Nacionales</h2>
              <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>Suma total acumulada de {plans.length} iglesias registradas.</p>
            </div>
            <button
              onClick={() => exportToExcel(consolidatedData)}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}`}
            >
              <Download size={16} className="mr-2" /> Descargar Consolidado (.XLSX)
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
              Áreas de Trabajo Nacional
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => setAllConsolidatedAreas(true)} 
                title="Expandir todo"
                aria-label="Expandir todo"
                className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-indigo-300 hover:text-white' 
                    : 'bg-white border-slate-200 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 shadow-xs'
                }`}
              >
                <ChevronsDown size={18} />
              </button>
              <button 
                type="button"
                onClick={() => setAllConsolidatedAreas(false)} 
                title="Colapsar todo"
                aria-label="Colapsar todo"
                className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/50 hover:text-white' 
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-xs'
                }`}
              >
                <ChevronsUp size={18} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {consolidatedData.areas.map((area, idx) => {
              const totalActividades = area.activities.reduce((sum, act) => sum + MONTHS.reduce((mSum, m) => mSum + (act.months[m] || 0), 0), 0);
              const activeActivities = area.activities.filter(act => MONTHS.reduce((s, m) => s + (act.months[m] || 0), 0) > 0);
              const isOpen = openConsolidatedAreas[idx] ?? (activeActivities.length > 0);

              if (activeActivities.length === 0) {
                return (
                  <div key={idx} className={`p-3 rounded-xl border text-xs flex justify-between items-center opacity-60 ${isDarkMode ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <span>{area.name}</span>
                    <span className="italic">Sin actividades programadas a nivel nacional</span>
                  </div>
                );
              }

              return (
                <div key={idx} className={`rounded-xl border overflow-hidden transition-all ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  {/* Header accordion for Consolidated */}
                  <button
                    type="button"
                    onClick={() => toggleConsolidatedArea(idx)}
                    className={`w-full p-4 flex items-center justify-between text-left transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100/70'}`}
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <div className={`p-1.5 rounded-lg flex items-center justify-center transition-transform ${isDarkMode ? 'bg-white/10 text-indigo-300' : 'bg-white text-indigo-600 shadow-sm'}`}>
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                      <div>
                        <h3 className={`text-sm sm:text-base font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{area.name}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                          {activeActivities.length} {activeActivities.length === 1 ? 'actividad activa nacional' : 'actividades activas nacionales'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                        Total Nacional: {totalActividades}
                      </span>
                    </div>
                  </button>

                  {/* Body for Consolidated Area */}
                  {isOpen && (
                    <div className={`p-4 pt-2 border-t space-y-3 ${isDarkMode ? 'border-white/10 bg-black/10' : 'border-slate-200 bg-white/50'}`}>
                      {activeActivities.map((act, actIdx) => {
                        const totalAct = MONTHS.reduce((sum, m) => sum + (act.months[m] || 0), 0);
                        const activeMonths = MONTHS.filter(m => (act.months[m] || 0) > 0);
                        return (
                          <div key={actIdx} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-sm border-slate-100'}`}>
                            <div className="flex justify-between items-start text-xs sm:text-sm mb-2">
                              <span className={`font-medium pr-4 ${isDarkMode ? 'text-white/90' : 'text-slate-800'}`}>{act.name}</span>
                              <span className={`font-bold shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{totalAct}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {activeMonths.map(m => (
                                <span key={m} className={`text-[10px] px-2 py-0.5 rounded uppercase font-medium ${isDarkMode ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-600'}`}>
                                  {m.split('-')[0]}: {act.months[m]}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {adminToast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl border shadow-xl flex items-start gap-3 animate-fade-in ${
          adminToast.type === 'success'
            ? (isDarkMode ? 'bg-slate-900 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40' : 'bg-white border-emerald-300 text-emerald-800 shadow-slate-200')
            : (isDarkMode ? 'bg-slate-900 border-red-500/40 text-red-300 shadow-red-950/40' : 'bg-white border-red-300 text-red-800 shadow-slate-200')
        }`}>
          <div className="mt-0.5">
            {adminToast.type === 'success' ? (
              <Check size={18} className="text-emerald-500" />
            ) : (
              <AlertTriangle size={18} className="text-red-500" />
            )}
          </div>
          <div className="flex-1 text-xs leading-relaxed font-medium">
            {adminToast.message}
          </div>
          <button 
            type="button" 
            onClick={() => setAdminToast(null)}
            className="opacity-60 hover:opacity-100 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {churchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">¿Eliminar iglesia registrada?</h3>
                <p className="text-xs opacity-70">Esta acción borrará el registro de la base de datos</p>
              </div>
            </div>

            <div className="space-y-3 mb-5 text-sm leading-relaxed">
              <p>
                Estás a punto de eliminar el registro de{' '}
                <strong className={`font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {getChurchName(churchToDelete.churchId!)}
                </strong>.
              </p>
              
              {(!churchToDelete.ministro || churchToDelete.ministro.trim() === '') ? (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="font-semibold">Estado:</span>
                  <span className="italic">Sin ministro registrado / Registro vacío</span>
                </div>
              ) : (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="font-semibold">Ministro:</span>
                  <span>{churchToDelete.ministro}</span>
                </div>
              )}

              <p className="text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                ⚠️ Al eliminar este registro, la iglesia quedará liberada en el sistema. Si fue un ingreso por accidente, se limpiará el vacío. Si necesitan registrarse luego, podrán hacerlo desde cero con un código nuevo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setChurchToDelete(null)}
                disabled={isDeletingChurch}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteChurch}
                disabled={isDeletingChurch}
                className="flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {isDeletingChurch ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} className="mr-1.5" />
                    Sí, Eliminar Registro
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
