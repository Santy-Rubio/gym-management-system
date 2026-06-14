import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

const colRef = collection(db, "Asistencias");

export interface Asistencia {
  id?: string;

  alumnoId: string;
  alumnoNombre: string;

  actividadId: string;
  actividadNombre: string;

  horarioId: string;

  profesorId: string;
  profesorNombre: string;

  fecha: string;

  presente: boolean;

  createdAt?: Timestamp;
}

/* ==========================================
   CREAR ASISTENCIA
========================================== */

export const agregarAsistencia = async (
  asistencia: Asistencia
) => {
  try {
    const docRef = await addDoc(colRef, {
      ...asistencia,
      createdAt: Timestamp.now(),
    });

    return {
      id: docRef.id,
      ...asistencia,
    };
  } catch (error) {
    console.error(
      "Error agregando asistencia:",
      error
    );
    throw error;
  }
};

/* ==========================================
   OBTENER TODAS
========================================== */

export const getAsistencias = async () => {
  try {
    const snap = await getDocs(colRef);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Asistencia[];
  } catch (error) {
    console.error(
      "Error obteniendo asistencias:",
      error
    );

    return [];
  }
};

/* ==========================================
   OBTENER POR FECHA
========================================== */

export const getAsistenciasPorFecha = async (
  fecha: string
) => {
  try {
    const q = query(
      colRef,
      where("fecha", "==", fecha)
    );

    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Asistencia[];
  } catch (error) {
    console.error(
      "Error obteniendo asistencias por fecha:",
      error
    );

    return [];
  }
};

/* ==========================================
   OBTENER POR ACTIVIDAD
========================================== */

export const getAsistenciasPorActividad =
  async (actividadId: string) => {
    try {
      const q = query(
        colRef,
        where("actividadId", "==", actividadId)
      );

      const snap = await getDocs(q);

      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Asistencia[];
    } catch (error) {
      console.error(
        "Error obteniendo asistencias por actividad:",
        error
      );

      return [];
    }
  };

/* ==========================================
   OBTENER POR HORARIO Y FECHA
========================================== */

export const getAsistenciasPorHorarioYFecha =
  async (
    horarioId: string,
    fecha: string
  ) => {
    try {
      const q = query(
        colRef,
        where("horarioId", "==", horarioId),
        where("fecha", "==", fecha)
      );

      const snap = await getDocs(q);

      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Asistencia[];
    } catch (error) {
      console.error(
        "Error obteniendo asistencias:",
        error
      );

      return [];
    }
  };

/* ==========================================
   VALIDAR DUPLICADO
========================================== */

export const existeAsistencia = async (
  alumnoId: string,
  horarioId: string,
  fecha: string
) => {
  try {
    const q = query(
      colRef,
      where("alumnoId", "==", alumnoId),
      where("horarioId", "==", horarioId),
      where("fecha", "==", fecha)
    );

    const snap = await getDocs(q);

    return !snap.empty;
  } catch (error) {
    console.error(
      "Error validando asistencia:",
      error
    );

    return false;
  }
};

/* ==========================================
   ELIMINAR
========================================== */

export const eliminarAsistencia = async (
  id: string
) => {
  try {
    await deleteDoc(
      doc(db, "Asistencias", id)
    );
  } catch (error) {
    console.error(
      "Error eliminando asistencia:",
      error
    );

    throw error;
  }
};

/* ==========================================
   ESTADÍSTICAS
========================================== */

export const getStatsAsistencias =
  async () => {
    try {
      const asistencias =
        await getAsistencias();

      const total = asistencias.length;

      const presentes =
        asistencias.filter(
          (a) => a.presente
        ).length;

      const porcentaje =
        total > 0
          ? Math.round(
              (presentes / total) * 100
            )
          : 0;

      return {
        total,
        presentes,
        porcentaje,
      };
    } catch (error) {
      console.error(
        "Error calculando estadísticas:",
        error
      );

      return {
        total: 0,
        presentes: 0,
        porcentaje: 0,
      };
    }
  };