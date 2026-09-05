import React, { useState, useEffect } from 'react';
import { PlanState, PREDEFINED_CHURCHES, MONTHS, createInitialState } from '../data';
import { getAllPlans, updatePlanAdmin } from '../lib/store';
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
  Layers
} from 'lucide-react';
import { exportToExcel } from '../export';

interface AdminDashboardProps {
  isDarkMode: boolean;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode, onLogout }) => {
  const [plans, setPlans] = useState<PlanState[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'consolidated'>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<'ministro' | 'accessCode' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);

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
                <button
                  key={plan.churchId}
                  onClick={() => setSelectedPlanId(plan.churchId || null)}
                  className={`w-full flex items-center p-4 rounded-xl border text-left transition-all ${selectedPlanId === plan.churchId ? (isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200') : (isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm')}`}
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
              ))
            )}
          </div>
          
          <div className="md:col-span-2">
            {selectedPlan ? (
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                {/* Header of selected church */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{getChurchName(selectedPlan.churchId!)}</h2>
                      {selectedPlan.isLocked && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          <Lock size={12} /> Bloqueado para cambios
                        </span>
                      )}
                    </div>
                    
                    {/* Ministro Inline Edit */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>Ministro:</span>
                      {editingField === 'ministro' ? (
                        <div className="flex items-center gap-1">
                          <input 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)} 
                            className={`px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-black/30 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
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
                        <div className="flex items-center gap-2 group">
                          <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedPlan.ministro || 'No asignado'}</span>
                          <button onClick={() => startEdit('ministro', selectedPlan.ministro)} title="Editar ministro" className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-indigo-50 text-indigo-500 transition-all">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Access Code Inline Edit */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300/70' : 'text-indigo-600/70'}`}>Código de acceso:</span>
                      {editingField === 'accessCode' ? (
                        <div className="flex items-center gap-1">
                          <input 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)} 
                            className={`px-2 py-1 text-sm font-mono rounded border w-24 ${isDarkMode ? 'bg-black/30 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
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
                        <div className="flex items-center gap-2 group">
                          <span className={`text-sm font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedPlan.accessCode}</span>
                          <button onClick={() => startEdit('accessCode', selectedPlan.accessCode || '')} title="Editar código PIN" className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-indigo-50 text-indigo-500 transition-all">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions: Lock Toggle and Export */}
                  <div className="flex flex-wrap items-center gap-2.5">
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
                      <span>{selectedPlan.isLocked ? "Bloqueado (Clic para desbloquear)" : "Bloquear Edición"}</span>
                    </button>

                    <button
                      onClick={() => exportToExcel(selectedPlan)}
                      className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}
                    >
                      <Download size={14} className="mr-1.5" /> Exportar XLSX
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAllDetailAreas(true)} 
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-indigo-300 hover:bg-white/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        Expandir todo
                      </button>
                      <button 
                        onClick={() => setAllDetailAreas(false)} 
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-white/50 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
                      >
                        Colapsar todo
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
            <div className="flex gap-2">
              <button 
                onClick={() => setAllConsolidatedAreas(true)} 
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-indigo-300 hover:bg-white/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                Expandir todo
              </button>
              <button 
                onClick={() => setAllConsolidatedAreas(false)} 
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-white/50 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Colapsar todo
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
    </div>
  );
};
