import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/config";

const pagosRef = collection(db, "pagos");

export interface Pago {
  alumnoId: string;
  alumnoNombre: string;
  actividades: string[];
  monto: number;
  metodoPago: string;
  fechaPago: string;
}

export const registrarPagoHistorico = async (
  pago: Pago
) => {
  await addDoc(pagosRef, pago);
};

export const getPagos = async () => {
  const snap = await getDocs(pagosRef);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getIngresosMes = async () => {
  const pagos = await getPagos();

  const hoy = new Date();

  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  return pagos.reduce((total: number, pago: any) => {
    const fecha = new Date(pago.fechaPago);

    if (
      fecha.getMonth() === mesActual &&
      fecha.getFullYear() === anioActual
    ) {
      total += Number(pago.monto || 0);
    }

    return total;
  }, 0);
};

export const registrarVenta = async (
    descripcion: string,
    monto: number,
    metodoPago: string
  ) => {

    await addDoc(pagosRef, {
      tipo: "venta",
      descripcion,
      monto,
      metodoPago,
      fechaPago:
        new Date().toISOString(),
    });

  };

export const getComparacionIngresos = async () => {

  const pagos = await getPagos();

  const hoy = new Date();

  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  const mesAnterior =
    mesActual === 0 ? 11 : mesActual - 1;

  const anioAnterior =
    mesActual === 0
      ? anioActual - 1
      : anioActual;

  let actual = 0;
  let anterior = 0;

  pagos.forEach((pago: any) => {

    const fecha =
      new Date(pago.fechaPago);

    const monto =
      Number(pago.monto || 0);

    if (
      fecha.getMonth() === mesActual &&
      fecha.getFullYear() === anioActual
    ) {
      actual += monto;
    }

    if (
      fecha.getMonth() === mesAnterior &&
      fecha.getFullYear() === anioAnterior
    ) {
      anterior += monto;
    }

  });

  const porcentaje =
    anterior > 0
      ? (
          ((actual - anterior) /
            anterior) *
          100
        ).toFixed(1)
      : 100;

  return {
    actual,
    anterior,
    porcentaje,
  };
};