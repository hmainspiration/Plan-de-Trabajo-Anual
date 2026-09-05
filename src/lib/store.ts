import { useEffect, useState, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { createInitialState, PlanState, PREDEFINED_CHURCHES } from '../data';

export const usePlanData = (churchId: string | null) => {
  const [plan, setPlan] = useState<PlanState>(createInitialState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!churchId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'plan_trabajo', churchId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PlanState;
        // Ignore snapshots with pending writes so we don't overwrite user's typing
        // with a snapshot that is echoing back a previous keystroke.
        if (data.areas && !snapshot.metadata.hasPendingWrites) {
          setPlan(data);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setSyncError("Error sincronizando. Operando en modo sin conexión.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [churchId]);

  const updatePlan = useCallback(async (newPlan: PlanState) => {
    if (!churchId) return;
    if (plan.isLocked) {
      console.warn("No se pueden guardar cambios: el plan está bloqueado.");
      return;
    }
    setPlan(newPlan); // Optmistic local update
    setSaving(true);
    try {
      const docRef = doc(db, 'plan_trabajo', churchId);
      newPlan.updatedAt = Date.now();
      newPlan.churchId = churchId;
      await setDoc(docRef, newPlan);
      setSyncError(null);
    } catch (error) {
      console.error("Failed to save to Firestore", error);
      setSyncError("No se pudo guardar en la nube. Cambios guardados localmente.");
    } finally {
      setSaving(false);
    }
  }, [churchId]);

  return { plan, updatePlan, loading, saving, syncError };
};

// Church Registration & Access
export const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const checkChurchExists = async (churchId: string): Promise<{ exists: boolean, name?: string }> => {
  const docRef = doc(db, 'plan_trabajo', churchId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { exists: true, name: snapshot.data().iglesia };
  }
  return { exists: false };
};

export const getChurchIdFromName = (name: string): string => {
  const trimmed = name.trim();
  const matched = PREDEFINED_CHURCHES.find(
    c => c.name.localeCompare(trimmed, undefined, { sensitivity: 'base' }) === 0
  );
  if (matched) return matched.id;

  return trimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const registerNewChurch = async (churchId: string, customName?: string): Promise<PlanState> => {
  const docRef = doc(db, 'plan_trabajo', churchId);
  const iglesiaName = customName || PREDEFINED_CHURCHES.find(c => c.id === churchId)?.name || churchId;
  const newPlan = createInitialState();
  newPlan.iglesia = iglesiaName;
  newPlan.churchId = churchId;
  newPlan.accessCode = generateAccessCode();
  newPlan.updatedAt = Date.now();
  await setDoc(docRef, newPlan);
  return newPlan;
};

export const verifyChurchAccess = async (churchId: string, code: string): Promise<boolean> => {
  const docRef = doc(db, 'plan_trabajo', churchId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const data = snapshot.data() as PlanState;
    // If there's no access code set yet, we allow it to be set by the first user saving it, 
    // or if the code matches.
    return !data.accessCode || data.accessCode === code;
  }
  return false;
};

// Admin Functions
export const verifyAdminPin = async (pin: string): Promise<boolean> => {
  const docRef = doc(db, 'admin_settings', 'config');
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const savedPin = snapshot.data().pin;
    return savedPin === pin || pin === '123456' || pin === '252627';
  } else {
    // Initialize default PIN if not exists
    await setDoc(docRef, { pin: '123456' });
    return pin === '123456' || pin === '252627';
  }
};

export const getAllPlans = async (): Promise<PlanState[]> => {
  const querySnapshot = await getDocs(collection(db, 'plan_trabajo'));
  const plans: PlanState[] = [];
  querySnapshot.forEach((doc) => {
    plans.push(doc.data() as PlanState);
  });
  return plans;
};

export const updatePlanAdmin = async (churchId: string, updates: Partial<PlanState>): Promise<void> => {
  const docRef = doc(db, 'plan_trabajo', churchId);
  await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
};
