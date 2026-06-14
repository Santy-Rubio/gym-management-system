import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const ref = doc(db, "Configuracion", "general");

export const guardarConfig = async (data: any) => {
  await setDoc(ref, data);
};

export const obtenerConfig = async () => {
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};