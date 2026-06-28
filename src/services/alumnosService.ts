import { doc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const colRef = collection(db, "Alumno");

import { registrarPagoHistorico } from "./pagosService";


// 🔥 Crear alumno
export const crearAlumno = async (Alumno: any) => {
  try {
    const ref = colRef;

    const docRef = await addDoc(ref, Alumno);

    return {
      id: docRef.id,
      ...Alumno,
    };
  } catch (error) {
    console.error("Error creando alumno:", error);
    throw error;
  }
};

export const eliminarAlumno = async (id: string) => {
  try {
    await deleteDoc(doc(db, "Alumno", id));
  } catch (error) {
    console.error("Error eliminando alumno:", error);
    throw error;
  }
};

export const getAlumnos = async (filtros?: {
  actividad?: string;
  estado?: string;
  fecha?: string;
}) => {
  try {
    const ref = colRef

    let condiciones: any[] = [];

    if (filtros?.actividad) {
      condiciones.push(where("actividad", "==", filtros.actividad));
    }

    if (filtros?.estado) {
      condiciones.push(where("estado", "==", filtros.estado));
    }

    if (filtros?.fecha) {
      condiciones.push(where("vencimiento", ">=", filtros.fecha)); 
      // 👈 mejor que ==
    }

    const q = condiciones.length ? query(ref, ...condiciones) : query(ref);

    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error trayendo alumnos:", error);
    return [];
  }
};

export const getStatsAlumnos = async () => {
  const alumnos = await getAlumnos();

  const totalAlumnos = alumnos.length;

  const activos = alumnos.filter((a: any) => a.estado === "activo").length;

  const hoy = new Date();

  const cuotasPagadas = alumnos.filter((a: any) => {
    if (!a.vencimiento) return false;

    return new Date(a.vencimiento) >= hoy;
  }).length;

  const pendientes = alumnos.filter((a: any) => {
    if (!a.vencimiento) return true;

    return new Date(a.vencimiento) < hoy;
  }).length;

  const porcentajePago = totalAlumnos
    ? Math.round((cuotasPagadas / totalAlumnos) * 100)
    : 0;

  return {
    totalAlumnos,
    activos,
    cuotasPagadas,
    pendientes,
    porcentajePago,
  };
};

export const registrarPago = async (
  alumnoId: string,
  nuevaFecha: string,
  metodoPago: string,
  monto: number,
  alumnoNombre: string,
  actividades: string[]
) => {
  try {
    const alumnoRef = doc(db,"Alumno",alumnoId);

    await updateDoc(alumnoRef, {
      vencimiento: nuevaFecha,
      estado: "activo",
      ultimoPago: new Date().toISOString(),
      metodoPago,
    });

    await registrarPagoHistorico({
      alumnoId,
      alumnoNombre,
      actividades,
      monto,
      metodoPago,
      fechaPago: new Date().toISOString(),
    });

  } catch (error) {

    console.error(
      "ERROR FIREBASE:",
      error
    );
  }
};

export const actualizarAlumno = async (
  id: string,
  alumno: any
) => {
  const ref = doc(db, "Alumno", id);

  await updateDoc(ref, {
    nombre: alumno.nombre,
    dni: alumno.dni,
    email: alumno.email,
    telefono: alumno.telefono,
    actividades: alumno.actividades,
    estado: alumno.estado,
    vencimiento: alumno.vencimiento,
  });
};