import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Users, CreditCard, TrendingUp, Calendar, Pencil, Search, UserPlus } from "lucide-react";

//  Firebase
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

import { actualizarAlumno, getStatsAlumnos } from "../services/alumnosService";
import { getIngresosMes, getComparacionIngresos } from "../services/pagosService";
import { registrarIngresoCompleto } from "../services/ingresosService";

const formatFecha = (fecha: any) => {

  if (!fecha) return "";

  // Timestamp Firestore
  if (fecha.toDate) {
    return fecha
      .toDate()
      .toLocaleString("es-AR");
  }

  // String ISO
  return new Date(fecha)
    .toLocaleString("es-AR");
};

const convertirFecha = (fecha: any) => {

  if (!fecha) return new Date(0);

  if (fecha.toDate) {
    return fecha.toDate();
  }

  return new Date(fecha);
};


export default function Dashboard() {

  type Alumno = {
    id: string;
    nombre: string;
    dni: string;
    email: string;
    telefono: string;
    estado: string;
    vencimiento: string;
    createdAt?: any;

    actividades: {
        actividadId: string;
        nombre: string;
        precio: number;
    }[];
  };

  const [dni, setDni] = useState("");
  const [resultado, setResultado] = useState<Alumno | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const [comparacionIngresos, setComparacionIngresos] = useState("0");

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
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

  type ActividadAlumno = {
    actividadId: string;
    nombre: string;
    precio: number;
  };

  const [actividadSeleccionada, setActividadSeleccionada] = useState<ActividadAlumno | null>(null);
  const [loading,setLoading] = useState(false);
  const [registrando,setRegistrando] = useState(false);

  useEffect(() => {
    cargarDashboard();
  }, []);

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

  const clasesHoyDetalle = actividades.flatMap((actividad) =>
    (actividad.horarios || [])
      .filter((h: any) => h.dia?.toLowerCase() === hoy)
      .map((h: any) => ({
        actividad: actividad.nombre,
        hora: h.hora,
      }))
  );

  const hoyFecha = new Date();

  const ingresosHoy = ingresos.filter((i) => {
    const fecha = convertirFecha(i.timestamp);

    return (
      fecha.getDate() === hoyFecha.getDate() &&
      fecha.getMonth() === hoyFecha.getMonth() &&
      fecha.getFullYear() === hoyFecha.getFullYear()
    );
  });
  
  const pagosHoy = pagos.filter((p) => {
    const fecha = convertirFecha(p.fechaPago);

    return (
      fecha.getDate() === hoyFecha.getDate() &&
      fecha.getMonth() === hoyFecha.getMonth() &&
      fecha.getFullYear() === hoyFecha.getFullYear()
    );
  });

  const actividadReciente = [

    ...ingresos.map((i) => ({
      tipo: "ingreso",
      titulo: i.alumnoNombre,
      descripcion: `Ingresó a ${i.actividadNombre}`,
      time: i.timestamp,
    })),

    ...pagos.map((p) => ({
      tipo: "pago",
      titulo: p.alumnoNombre,
      descripcion: "Pagó la cuota",
      time: p.fechaPago,
    })),

    ...alumnos.map((a) => ({
      tipo: "alumno",
      titulo: a.nombre,
      descripcion: "Nuevo alumno registrado",
      time: a.createdAt || new Date(),
    })),

  ].sort(
  (a,b)=>
  convertirFecha(b.time).getTime()-
  convertirFecha(a.time).getTime()
  )
  .slice(0,10);
  
  // 🔍 BUSCAR ALUMNO POR DNI
  const handleBuscar = async () => {

    if (!dni.trim()) return;

    setLoading(true);

    const alumno = alumnos.find(a => a.dni === dni);

    if (alumno) {

        setResultado(alumno);

        if (alumno.actividades.length === 1)
            setActividadSeleccionada(alumno.actividades[0]);
        else
            setActividadSeleccionada(null);

    } else {

        setResultado(null);
        setActividadSeleccionada(null);

        alert("Alumno no encontrado");

    }

    setLoading(false);
  };

  

  // INGRESO
  const handleIngreso = async () => {
    if (!resultado) {
      alert("Busque un alumno");
      return;
    }

    if (!actividadSeleccionada) {
      alert("Seleccione una actividad.");
      return;
    }

    if (resultado.estado !== "activo") {
      alert("El alumno está inactivo.");
      return;
    }

    const hoy = new Date();

    const vence = convertirFecha(resultado.vencimiento);

    if (vence < hoy) {
      alert("La cuota está vencida.");
      return;
    }

    setRegistrando(true);

    try {
      await registrarIngresoCompleto(resultado, actividadSeleccionada);
      await cargarDashboard();

      //alert(`Ingreso registrado correctamente en ${actividadSeleccionada.nombre}`);

      setResultado(null);
      setActividadSeleccionada(null);
      setDni("");
      setEditData({});
      

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }finally {
    setRegistrando(false);
    }
  };

   //  ABRIR MODAL
  const handleEdit = () => {
    setEditData(resultado);
    setShowModal(true);
  };

  //  GUARDAR
  const handleSave = async () => {
    await actualizarAlumno(editData.id, editData);  
    await cargarDashboard();
    setResultado(editData);
    setShowModal(false);
  };

  //  CARGAR DASHBOARD
  const cargarDashboard = async () => {

    const alumnosSnap = await getDocs(collection(db, "Alumno"));

    setAlumnos(
      alumnosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Alumno[]
    );

    const pagosSnap = await getDocs(collection(db, "pagos"));

    setPagos(
      pagosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    const ingresosSnap = await getDocs(collection(db, "ingresos"));

    setIngresos(
      ingresosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    const comp = await getComparacionIngresos();

    setComparacionIngresos(`${comp.porcentaje}%`);

    const data = await getStatsAlumnos();

    const ingresosMes = await getIngresosMes();

    setStats({
      ...data,
      ingresosMes,
    });

    const actividadesSnap = await getDocs(
        collection(db, "actividades")
    );

    setActividades(
        actividadesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    );
  };

  return (
    <MainLayout>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">

        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
                <UserPlus className="text-blue-600"/>
            </div>

            Ingreso de Personas
        </h2>

        <p className="text-gray-500 mt-2">
            Buscá un alumno por DNI para registrar su ingreso.
        </p>

        <div className="flex gap-3">
          <input
            placeholder="DNI..."
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleBuscar();
              }
            }}
            className="flex-1 h-14 rounded-xl border border-gray-300 px-5 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <button onClick={handleBuscar} disabled={loading} 
           className={`h-14 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center gap-2 shadow ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
           onKeyDown={(e)=>{
            if(e.key==="Enter"){
                handleBuscar();
            }
          }}>
            <Search size={16} /> {loading ? "Buscando..." : "Buscar"}
          </button>

          <button
            onClick={handleIngreso}
            disabled={registrando || !resultado || !actividadSeleccionada}
            className={`h-14 px-8 rounded-xl font-semibold transition shadow-lg ${ resultado && actividadSeleccionada ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}            >
            <UserPlus size={16} /> {registrando ? "Registrando..." : "Registrar Ingreso"}
          </button>
          
          
          
        </div>
      </div>  

      {/* RESULTADO */}
      {resultado && (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">

          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Alumno encontrado
            </h3>

            <p className="text-sm text-gray-500">
              Verificá la información antes de registrar el ingreso.
            </p>
          </div>

          <button
            onClick={handleEdit}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <Pencil size={18} />
          </button>

        </div>

        {/* Contenido */}
        <div className="p-6">

          {/* Datos principales */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white text-3xl font-bold flex items-center justify-center shadow-md">
                {resultado.nombre.charAt(0)}
              </div>

              {/* Nombre */}
              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  {resultado.nombre}
                </h2>

                <p className="text-gray-500 mt-1">
                  DNI {resultado.dni}
                </p>

                <span
                  className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-semibold ${
                    resultado.estado === "activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {resultado.estado === "activo"
                    ? "Activo"
                    : "Inactivo"}
                </span>

              </div>

            </div>

            {/* Información */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Vencimiento
                </p>

                <p className="font-semibold text-gray-700 mt-1">
                  {formatFecha(resultado.vencimiento)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Teléfono
                </p>

                <p className="font-semibold text-gray-700 mt-1">
                  {resultado.telefono}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="font-semibold text-gray-700 mt-1 break-all">
                  {resultado.email}
                </p>
              </div>

            </div>

          </div>

          {/* Actividades */}
          <div className="mt-8 pt-6 border-t">

            <h4 className="text-lg font-semibold text-gray-800 mb-1">
              Seleccionar actividad
            </h4>

            <p className="text-sm text-gray-500 mb-4">
              Elegí la actividad a la que asistirá el alumno.
            </p>

            <div className="flex flex-wrap gap-3">

              {(resultado.actividades || []).map((act: any) => (

                <button
                  key={act.actividadId}
                  onClick={() => setActividadSeleccionada(act)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    actividadSeleccionada?.actividadId === act.actividadId
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {act.nombre}
                </button>

              ))}

            </div>

          </div>

        </div>

      </div>
    )}
    
        {/* MODAL */}
        

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
            //extra={comparacionAlmunos}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow p-5">

            <p className="text-sm text-gray-500">
              Ingresos registrados hoy
            </p>

            <h2 className="text-3xl font-bold mt-2">
                {ingresosHoy.length}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

              <p className="text-sm text-gray-500">
                  Pagos realizados hoy
              </p>

              <h2 className="text-3xl font-bold mt-2">
                  {pagosHoy.length}
              </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <p className="text-sm text-gray-500 mb-3">
                Clases del día
            </p>

            <div className="space-y-2">
              {clasesHoyDetalle.length===0 ? (
                <p className="text-gray-400">
                  No hay clases
                </p>
              ) : (clasesHoyDetalle.map((c,index)=>(
                <div key={index} className="flex justify-between text-sm">
                  <span>{c.actividad}</span>

                  <span className="font-semibold">
                    {c.hora}
                  </span>

                </div>))
              )}
            </div>
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-white rounded-xl shadow">

          <div className="p-4 border-b">
            <h2 className="font-semibold">Actividad Reciente</h2>
          </div>

          <div className="divide-y">

            {actividadReciente.map((a,index)=>(
              <Item
                  key={index}
                  tipo={a.tipo}
                  titulo={a.titulo}
                  descripcion={a.descripcion}
                  time={formatFecha(a.time)}
              />
            ))}

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

function Item({ tipo, titulo, descripcion, time }: any) {

    const estilos = {

        ingreso:{
            color:"bg-green-500",
            icon:<UserPlus size={16}/>
        },

        pago:{
            color:"bg-emerald-500",
            icon:<CreditCard size={16}/>
        },

        alumno:{
            color:"bg-blue-500",
            icon:<Users size={16}/>
        }

    };

    const estilo = estilos[tipo];

    return(
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${estilo.color}`}>
          {estilo.icon}
        </div>

        <div className="flex-1">

          <p className="font-semibold text-gray-800">
            {titulo}
          </p>

          <p className="text-sm text-gray-500">
            {descripcion}
          </p>

        </div>

        <span className="text-xs text-gray-400 whitespace-nowrap">
          {time}
        </span>

      </div>
    );
}