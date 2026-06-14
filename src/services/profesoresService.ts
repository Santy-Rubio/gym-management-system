import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, } from "firebase/firestore";

import { db } from "../firebase/config";

const ref = collection(db, "Profesores");

export type Profesor = {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  especialidad: string;
  estado: "activo" | "inactivo";
  especialidades: string[];
  actividades?: string[];
};

export const getProfesores = async () => {

  const snap = await getDocs(ref);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const agregarProfesor = async (
  profesor: any
) => {

  return await addDoc(
    ref,
    profesor
  );
};

export const eliminarProfesor = async (
  id: string
) => {

  return await deleteDoc(
    doc(db, "Profesores", id)
  );
};

export const editarProfesor = async (
  id: string,
  data: any
) => {

  return await updateDoc(
    doc(db, "Profesores", id),
    data
  );
};