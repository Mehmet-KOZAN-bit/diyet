"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";

export function useClientData() {
  const { user } = useAuth();
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    let unsubPlan: any;
    let unsubLogs: any;

    const fetchProfile = async () => {
      const q = query(collection(db, "clients"), where("email", "==", user.email));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const profile = { id: docSnap.id, ...docSnap.data() };
        setClientProfile(profile);

        const qPlan = query(collection(db, "diet_plans"), where("clientId", "==", profile.id));
        unsubPlan = onSnapshot(qPlan, (snap) => {
           if (!snap.empty) {
             setDietPlan({ id: snap.docs[0].id, ...snap.docs[0].data() });
           }
        });

        const qLogs = query(collection(db, `clients/${profile.id}/weight_logs`), orderBy("date", "asc"));
        unsubLogs = onSnapshot(qLogs, (snap) => {
          setWeightLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      }
      setLoading(false);
    };

    fetchProfile();

    return () => {
      if (unsubPlan) unsubPlan();
      if (unsubLogs) unsubLogs();
    };
  }, [user]);

  return { clientProfile, dietPlan, weightLogs, loading, user };
}
