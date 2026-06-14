import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Users, CreditCard, TrendingUp, Calendar, Pencil, Search, UserPlus } from "lucide-react";

// 🔥 Firebase
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

import { updateAlumno, getStatsAlumnos } from "../services/alumnosService";
import { getIngresosMes, getComparacionIngresos } from "../services/pagosService";


export default function Dashboard() {

  const [dni, setDni] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const [comparacionIngresos, setComparacionIngresos] = useState("0");

  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalAlumnos: 0,
    activos: 0,
    cuotasPagadas: 0,
    pendientes: 0,
    vencidos: 0,
    porcentajePago: 0,
    ingresosMes: 0,
  });

  useEffect(() => {
    const loadData = async () => {

      const alumnosSnap = await getDocs(collection(db, "Alumno"));
      setAlumnos(alumnosSnap.docs.map(d => d.data()));

      const pagosSnap = await getDocs(
        collection(db, "pagos")
      );

      setPagos(
        pagosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      const actSnap = await getDocs(
        collection(db, "actividades")
      );

      setActividades(
        actSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      const ingresosSnap = await getDocs(
        collection(db, "ingresos")
      );

      setIngresos(
        ingresosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      const comp =
        await getComparacionIngresos();

      setComparacionIngresos(
        `${comp.porcentaje}%`
      );

    };

    loadData();
  }, []);

  useEffect(() => {
    const load = async () => {
      const data = await getStatsAlumnos();
      const ingresosMes = await getIngresosMes();
      setStats({...data,ingresosMes,});
    };

    load();
  }, []);

  const alumnosActivos = alumnos.filter(a => a.estado === "activo").length;

  const cuotasPagadas = pagos.length;
  const totalAlumnos = alumnos.length;

  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long",}).toLowerCase();

  const clasesHoy = actividades.reduce(
    (total, actividad) => {
      const clasesDelDia =
        actividad.horarios?.filter(
          (h: any) =>
            h.dia?.toLowerCase() === hoy
        ).length || 0;

      return total + clasesDelDia;
    },
    0
  );

  const actividadReciente = [
    ...ingresos.map(i => ({
      text: `${i.nombre} registró ingreso`,
      time: i.fecha,
      color: "green",
    })),

    ...pagos.map(p => ({
      text: `${p.nombre} pagó cuota`,
      time: p.fecha,
      color: "green",
    })),

    ...alumnos.map(a => ({
      text: `Nuevo alumno: ${a.nombre}`,
      time: a.createdAt,
      color: "blue",
    })),
  ].slice(0, 5);
  
  // 🔍 BUSCAR ALUMNO POR DNI
  const handleBuscar = async () => {
    if (!dni) return;

    const q = query(
      collection(db, "Alumno"),
      where("dni", "==", dni)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const doc = snap.docs[0];
      setResultado({ id: doc.id, ...doc.data() });
    } else {
      setResultado(null);
      alert("Alumno no encontrado");
    }
  };

  // ➕ INGRESO (lógica simple por ahora)
  const handleIngreso = () => {
    if (!resultado) return;

    alert(`Ingreso registrado para ${resultado.nombre} ✅`);
  };

   // ✏️ ABRIR MODAL
  const handleEdit = () => {
    setEditData(resultado);
    setShowModal(true);
  };

  // 💾 GUARDAR
  const handleSave = async () => {
    await updateAlumno(editData.id, editData);
    setResultado(editData);
    setShowModal(false);
  };

  return (
    <MainLayout>

      {/* CARD */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-xl shadow mb-6">

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus size={20} />
          Ingreso de personas
        </h2>

        <div className="flex gap-3">
          <input
            placeholder="DNI..."
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg text-black"
          />

          <button onClick={handleBuscar} className="bg-white text-blue-600 px-4 py-2 rounded-lg flex gap-2">
            <Search size={16} /> Buscar
          </button>

          <button onClick={handleIngreso} className="bg-green-500 px-4 py-2 rounded-lg flex gap-2">
            <UserPlus size={16} /> Ingresar
          </button>
        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="mt-4 bg-white/10 p-4 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{resultado.nombre}</p>
                <p>DNI: {resultado.dni}</p>
                <p>Actividad: {resultado.actividad}</p>
              </div>

              <Pencil
                className="cursor-pointer"
                onClick={handleEdit}
              />
            </div>

          </div>
        )}
    
        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-[400px] text-black">

              <h2 className="text-lg font-semibold mb-4">
                Editar Alumno
              </h2>

              <div className="space-y-3">

                <input
                  value={editData.nombre}
                  onChange={(e) =>
                    setEditData({ ...editData, nombre: e.target.value })
                  }
                  className="input"
                  placeholder="Nombre"
                />

                <input
                  value={editData.actividad}
                  onChange={(e) =>
                    setEditData({ ...editData, actividad: e.target.value })
                  }
                  className="input"
                  placeholder="Actividad"
                />

              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowModal(false)}>
                  Cancelar
                </button>

                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          Gestión de Alumnos
        </h1>

        <div className="flex gap-3 mt-4">
          <div className="flex items-center border rounded-lg px-3 flex-1">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Buscar alumno para editar o agregar nuevo..."
              className="w-full px-2 py-2 outline-none"
            />
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserPlus size={16} />
            Agregar Nuevo Alumno
          </button>
        </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* ALUMNOS */}
          <Card
            icon={<Users className="text-blue-500" />}
            title="Alumnos activos"
            value={stats.activos}
            extra="+2.1%"
          />

          {/* CUOTAS */}
          <Card
            icon={<CreditCard className="text-green-500" />}
            title="Cuotas pagadas"
            value={`${stats.cuotasPagadas} / ${stats.totalAlumnos}`}
            extra={`${stats.porcentajePago}%`}
          />

          {/* INGRESOS */}
          <Card
            icon={<TrendingUp className="text-blue-600" />}
            title="Ingresos del mes"
            value={`$${stats.ingresosMes.toLocaleString()}`}
            extra={comparacionIngresos}
          />

          {/* CLASES */}
          <Card
            icon={<Calendar className="text-purple-500" />}
            title="Clases del día"
            value={clasesHoy}
            extra=""
          />
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-white rounded-xl shadow">

          <div className="p-4 border-b">
            <h2 className="font-semibold">Actividad Reciente</h2>
          </div>

          <div className="divide-y">

            {actividadReciente.map((a, index) => (
              <Item
                key={index}
                color={a.color}
                text={a.text}
                time={a.time}
              />
            ))}

            <Item
              color="green"
              text="Carlos Ruiz realizó pago de cuota mensual"
              time="Hace 15 min"
            />

            <Item
              color="blue"
              text="Nuevo alumno: Ana López"
              time="Hace 1 hora"
            />

            <Item
              color="green"
              text="Pedro Martínez registró ingreso"
              time="Hace 2 horas"
            />

          </div>
        </div>
    </MainLayout>
  );
}

function Card({ icon, title, value, extra }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex justify-between items-start">
      
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold mt-1">{value}</h3>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="bg-gray-100 p-2 rounded-lg">
          {icon}
        </div>

        {extra && (
          <span className="text-green-500 text-sm">
            {extra}
          </span>
        )}
      </div>

    </div>
  );
}

function Item({ text, time, color }: any) {
  const colors: any = {
    green: "bg-green-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="p-4 flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${colors[color]}`} />

      <div>
        <p className="text-sm">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}