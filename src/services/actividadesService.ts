import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const ref = collection(db, "Actividad");

export type Actividad = {
  id?: string;
  nombre: string;
  descripcion?: string;
  profesor?: string;
  cupo: number;
  precio: number;
  inscritos: number;
  color: string;
  dia?: string;
  horaInicio?: string;
  horaFin?: string;
};

export const actualizarHorarioActividad =
  async (
    actividadId: string,
    data: {
      dia: string;
      horaInicio: string;
      horaFin: string;
    }
  ) => {

    try {

      const ref =
        doc(
          db,
          "Actividad",
          actividadId
        );

      await updateDoc(ref, {

        dia: data.dia,

        horaInicio:
          data.horaInicio,

        horaFin:
          data.horaFin,

        tieneHorario: true,
      });

    } catch (error) {

      console.error(
        "Error actualizando horario",
        error
      );
    }
  };

export const getActividades = async () => {
  const snap = await getDocs(ref);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Actividad[];
};

export const agregarActividad = async (actividad: Actividad) => {
  await addDoc(ref, actividad);
};

export const eliminarActividad = async (id: string) => {
  await deleteDoc(doc(db, "Actividad", id));
};