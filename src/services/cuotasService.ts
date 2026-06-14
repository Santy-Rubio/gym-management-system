import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/config";

export const getIngresosMes = async () => {

  const snap = await getDocs(
    collection(db, "pagos")
  );

  const hoy = new Date();

  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  let total = 0;

  snap.docs.forEach((doc) => {

    const data = doc.data();

    if (!data.fechaPago) return;

    const fechaPago = new Date(
      data.fechaPago
    );

    if (
      fechaPago.getMonth() === mesActual &&
      fechaPago.getFullYear() === anioActual
    ) {
      total += Number(
        data.monto || 0
      );
    }
  });

  return total;
};