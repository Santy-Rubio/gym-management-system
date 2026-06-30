import {collection, addDoc, query, where, getDocs, Timestamp} from "firebase/firestore";

import { db } from "../firebase/config";

export const buscarAlumnoPorDni = async (dni: string) => {
  try {
    const q = query(
      collection(db, "Alumno"),
      where("dni", "==", dni)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const doc = snap.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    };

  } catch (error) {
    console.error(error);
    return null;
  }
};

export const obtenerHorarioMasCercano = (
  actividades: any[]
) => {

  if (!actividades || actividades.length === 0)
    return null;

  return actividades[0];
};

export const registrarIngreso = async (
  alumno: any,
  actividad: any
) => {

  try {
    const ahora = new Date();

    await addDoc(
      collection(db, "ingresos"),
      {

        alumnoId: alumno.id,

        alumnoNombre: alumno.nombre,

        actividadId: actividad.actividadId,

        actividadNombre: actividad.nombre,

        fecha: ahora.toISOString().split("T")[0],

        hora: ahora.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),

        timestamp: Timestamp.now(),
      }
    );

  } catch (error) {

    console.error(
      "Error registrando ingreso",
      error
    );

    throw error;
  }
};

export const registrarAsistencia = async (
  alumno: any,
  actividad: any
) => {

  try {

    await addDoc(
      collection(db, "asistencias"),
      {

        alumnoId: alumno.id,

        alumnoNombre: alumno.nombre,

        actividadId: actividad.actividadId,

        actividad: actividad.nombre,

        fecha: new Date().toLocaleDateString(),

        hora: new Date().toLocaleTimeString(),

        timestamp: Timestamp.now(),
      }
    );

  } catch (error) {

    console.error(
      "Error registrando asistencia",
      error
    );
  }
};

export const registrarIngresoCompleto = async (
    alumno: any,
    actividad: any
) => {

    if (
        !alumno.actividades ||
        alumno.actividades.length === 0
    ) {
        throw new Error(
            "El alumno no tiene actividades."
        );
    }

    await registrarIngreso(
        alumno,
        actividad
    );

    const asistencia =
        await registrarAsistencia(
            alumno,
            actividad
        );

    return asistencia;
};