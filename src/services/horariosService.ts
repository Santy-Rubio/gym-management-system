import {collection, addDoc, getDocs, deleteDoc, doc, updateDoc} from "firebase/firestore";

import { db } from "../firebase/config";

export interface Horario {
  id?: string;
  actividadId: string;
  actividad: string;
  profesorId: string;
  profesor: string;
  dia: string;
  cupo: number;
  horaInicio: string;
  horaFin: string;
}

const horariosRef = collection(db, "Horarios");

// GET
export const getHorarios = async (): Promise<Horario[]> => {
  const snap = await getDocs(horariosRef);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Horario[];
};

// ADD
export const agregarHorario = async (
  horario: Horario
) => {
  await addDoc(horariosRef, horario);
};

// DELETE
export const eliminarHorario = async (
  id: string
) => {
  await deleteDoc(doc(db, "Horarios", id));
};

// UPDATE
export const actualizarHorario = async (
  id: string,
  horario: Horario
) => {
  await updateDoc(doc(db, "Horarios", id), horario);
};

