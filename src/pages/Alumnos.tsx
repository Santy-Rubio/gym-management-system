import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";

import {Users, Search, Pencil, Trash2, Filter, Plus} from "lucide-react";

//  FIREBASE
import { getAlumnos, eliminarAlumno, crearAlumno, actualizarAlumno } from "../services/alumnosService";
import { getActividades } from "../services/actividadesService";

//  TYPES
type ActividadAlumno = {
  actividadId: string;
  nombre: string;
  precio: number;
};

type Alumno = {
  id?: string;

  nombre: string;
  dni: string;
  email: string;
  telefono: string;

  actividades?: ActividadAlumno[];

  estado: "activo" | "inactivo";

  vencimiento: string;
};

type Actividad = {
  id?: string;
  nombre: string;
  precio: number;
};

export default function Alumnos() {

  const [busqueda, setBusqueda] = useState("");

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  const [loading, setLoading] = useState(true);

  const [showFiltros, setShowFiltros] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [alumnoEditando, setAlumnoEditando] = useState<Alumno | null>(null);

  const [actividadFiltro, setActividadFiltro] = useState("");

  const [estadoFiltro, setEstadoFiltro] = useState("");

  const [fechaFiltro, setFechaFiltro] = useState("");

  const [actividadesDisponibles, setActividadesDisponibles] = useState<Actividad[]>([]);
  

  //  CARGAR FIREBASE
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAlumnos();
        setAlumnos(data as Alumno[]);

        const acts = await getActividades();
        setActividadesDisponibles(acts as Actividad[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  //  ESTADO CUOTA
  const getEstadoCuota = (
    alumno: Alumno
  ) => {

    if (alumno.estado === "inactivo") {
      return "inactivo";
    }

    const hoy = new Date();

    const venc = new Date(
      alumno.vencimiento
    );

    if (venc < hoy) {
      return "vencido";
    }

    const diff =
      (venc.getTime() - hoy.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff <= 5) {
      return "pendiente";
    }

    return "pagado";
  };

  //  KPIs
  const total = alumnos.length;

  const activos = alumnos.filter(
    (a) => a.estado === "activo"
  ).length;

  const inactivos = alumnos.filter(
    (a) => a.estado === "inactivo"
  ).length;

  const pendientes = alumnos.filter(
    (a) =>
      getEstadoCuota(a) === "pendiente"
  ).length;

  const vencidas = alumnos.filter(
    (a) =>
      getEstadoCuota(a) === "vencido"
  ).length;

  //  BUSCADOR
  const filtrados = alumnos.filter((a) => {

    // BUSCADOR
    const coincideBusqueda = `
        ${a.nombre}
        ${a.email}
        ${a.dni}
        ${(a.actividades || [])
          .map((act) => act.nombre)
          .join(" ")}
      `
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    // ACTIVIDAD
    const coincideActividad =
      !actividadFiltro ||
      (a.actividades || []).some(
        (act) => act.nombre === actividadFiltro
      );

    // ESTADO
    const coincideEstado =
      !estadoFiltro ||
      a.estado === estadoFiltro;

    // FECHA
    const coincideFecha =
      !fechaFiltro ||
      a.vencimiento === fechaFiltro;

    return (
      coincideBusqueda &&
      coincideActividad &&
      coincideEstado &&
      coincideFecha
    );
  });

  //  ELIMINAR
  const handleDelete = async (
    id: string
  ) => {

    const confirmar = confirm(
      "¿Eliminar alumno?"
    );

    if (!confirmar) return;

    try {

      await eliminarAlumno(id);

      setAlumnos((prev) =>
        prev.filter((a) => a.id !== id)
      );

    } catch (error) {

      console.error(error);
    }
  };

  //  AGREGAR
  const handleAdd = async (
    alumno: Alumno
  ) => {

    try {

      await crearAlumno(alumno);

      const data = await getAlumnos();

      setAlumnos(data as Alumno[]);

      setShowModal(false);

    } catch (error) {

      console.error(error);
    }
  };

  const handleEdit = async (alumno: Alumno) => {
    await actualizarAlumno(alumno.id!, alumno);

    const data = await getAlumnos();

    setAlumnos(data as Alumno[]);

    setShowEditModal(false);

    setAlumnoEditando(null);
  };

  if (loading) {

    return (
      <MainLayout>
        <p>Cargando alumnos...</p>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            Gestión de Alumnos
          </h1>

          <p className="text-gray-500 text-sm">
            Administra los alumnos del gimnasio
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Nuevo Alumno
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 mb-6">

        <Card
          title="Total"
          value={total}
          icon={<Users size={18} />}
        />

        <Card
          title="Activos"
          value={activos}
          color="green"
        />

        <Card
          title="Inactivos"
          value={inactivos}
          color="gray"
        />

        <Card
          title="Pendientes"
          value={pendientes}
          color="yellow"
        />

        <Card
          title="Vencidas"
          value={vencidas}
          color="red"
        />
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-5">

        <div className="flex gap-3">

          <div className="flex items-center border rounded-lg px-3 py-2 flex-1">

            <Search
              size={16}
              className="text-gray-400"
            />

            <input
              placeholder="Buscar alumno..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              className="ml-2 w-full outline-none"
            />
          </div>

          <button
            onClick={() =>
              setShowFiltros(
                !showFiltros
              )
            }
            className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>

        {/* FILTROS */}
        {showFiltros && (

          <div className="grid grid-cols-3 gap-4 mt-4">

            <select
              value={actividadFiltro}
              onChange={(e) => setActividadFiltro(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            >
              <option value="">
                Todas las actividades
              </option>

              {actividadesDisponibles.map((act) => (
                <option
                  key={act.id}
                  value={act.nombre}
                >
                  {act.nombre}
                </option>
              ))}
            </select>

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            >
              <option value="">
                Todos
              </option>

              <option value="activo">
                Activo
              </option>

              <option value="inactivo">
                Inactivo
              </option>
            </select>

            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">

        {/* HEADER */}
        <div className="grid grid-cols-6 bg-gray-50 border-b text-gray-500 text-sm font-medium p-4">

          <div>Alumno</div>

          <div>Contacto</div>

          <div>Actividades</div>

          <div>Estado</div>

          <div>Vencimiento</div>

          <div>Acciones</div>
        </div>

        {/* FILAS */}
        {filtrados.map((alumno) => {

          const estado =
            getEstadoCuota(alumno);

          return (

            <div
              key={alumno.id}
              className="grid grid-cols-6 items-center border-b p-4 hover:bg-gray-50 transition"
            >

              {/* ALUMNO */}
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">

                  {alumno.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>

                  <h2 className="font-medium text-sm">
                    {alumno.nombre}
                  </h2>

                  <p className="text-xs text-gray-500">
                    DNI: {alumno.dni}
                  </p>
                </div>
              </div>

              {/* CONTACTO */}
              <div>

                <p className="text-sm">
                  {alumno.email}
                </p>

                <p className="text-xs text-gray-500">
                  {alumno.telefono}
                </p>
              </div>

              {/* ACTIVIDADES */}
              <div className="flex flex-wrap gap-2">

                {(alumno.actividades || []).map(
                  (act, i) => (

                    <span
                      key={i}
                      className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                    >
                      {act.nombre}
                    </span>
                  )
                )}
              </div>

              {/* ESTADO */}
              <div>
                <Estado estado={estado} />
              </div>

              {/* VENCIMIENTO */}
              <div className="text-sm">
                {alumno.vencimiento}
              </div>

              {/* ACCIONES */}
              <div className="flex gap-3">

                <Pencil
                  size={16}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => {
                    setAlumnoEditando(alumno);
                    setShowEditModal(true);
                  }}                    
                />

                <Trash2
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() =>
                    handleDelete(
                      alumno.id!
                    )
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <ModalAlumno
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
          actividadesDisponibles={actividadesDisponibles}
        />
      )}

      {showEditModal && alumnoEditando && (
        <ModalAlumno
          alumno={alumnoEditando}
          onClose={() => {
            setShowEditModal(false);

            setAlumnoEditando(null);
          }}
          onSave={handleEdit}
          actividadesDisponibles={actividadesDisponibles}
        />
      )}
    </MainLayout>
  );
}

//  CARD KPI
function Card({
  title,
  value,
  color,
  icon,
}: any) {

  return (

    <div className="bg-white p-4 rounded-xl shadow-sm border">

      <div className="flex justify-between items-center">

        <p className="text-sm text-gray-500">
          {title}
        </p>

        {icon}
      </div>

      <h3 className="text-2xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

//  ESTADO
function Estado({
  estado,
}: any) {

  const styles: any = {

    pagado:
      "bg-green-100 text-green-600",

    pendiente:
      "bg-yellow-100 text-yellow-600",

    vencido:
      "bg-red-100 text-red-600",

    inactivo:
      "bg-gray-200 text-gray-600",
  };

  return (

    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium
        ${styles[estado]}
      `}
    >
      {estado}
    </span>
  );
}

//  MODAL
function ModalAlumno({
  alumno,
  onClose,
  onSave,
  actividadesDisponibles,
}: {
  alumno?: Alumno;
  onClose: () => void;
  onSave: (alumno: Alumno) => void;
  actividadesDisponibles: Actividad[];
}) {

  const [form, setForm] = useState<Alumno>(
    alumno ?? {
      nombre: "",
      dni: "",
      email: "",
      telefono: "",
      actividades: [],
      estado: "activo",
      vencimiento: "",
    }
  );
  useEffect(() => {
    if (alumno) {
      setForm(alumno);
    }
  }, [alumno]);

  //  INPUTS
  const handleChange = (
    e: any
  ) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  //  ACTIVIDADES
  const toggleActividad = (
    actividad: Actividad
  ) => {

    const existe =
      form.actividades?.some(
        (a) =>
          a.actividadId ===
          actividad.id
      );

    if (existe) {

      setForm({
        ...form,

        actividades:
          form.actividades?.filter(
            (a) =>
              a.actividadId !==
              actividad.id
          ) || [],
      });

    } else {

      setForm({
        ...form,

        actividades: [
          ...(form.actividades || []),

          {
            actividadId:
              actividad.id || "",

            nombre:
              actividad.nombre,

            precio:
              actividad.precio,
          },
        ],
      });
    }
  };

  //  GUARDAR
  const handleSave = () => {

    if (
      !form.nombre ||
      !form.dni
    ) {
      return;
    }

    onSave(form);
  };
  
  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white w-[650px] rounded-2xl p-6 shadow-lg">

        <h2 className="text-2xl font-bold mb-6">
          {alumno ? "Editar Alumno" : "Nuevo Alumno"}
        </h2>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">

          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="border px-4 py-3 rounded-xl"
          />

          <input
            name="dni"
            placeholder="DNI"
            value={form.dni}
            onChange={handleChange}
            className="border px-4 py-3 rounded-xl"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border px-4 py-3 rounded-xl"
          />

          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            className="border px-4 py-3 rounded-xl"
          />

          <select
            name="estado"
            onChange={handleChange}
            value={form.estado}
            className="border px-4 py-3 rounded-xl"
          >
            <option value="activo">
              Activo
            </option>

            <option value="inactivo">
              Inactivo
            </option>
          </select>

          <input
            type="date"
            name="vencimiento"
            value={form.vencimiento}
            onChange={handleChange}
            className="border px-4 py-3 rounded-xl"
          />
        </div>

        {/* ACTIVIDADES */}
        <div className="mt-6">

          <h3 className="font-semibold text-lg mb-4">
            Seleccionar Actividades
          </h3>

          {actividadesDisponibles.length === 0 ? (

            <div className="border rounded-xl p-4 text-gray-500 text-sm">
              No hay actividades cargadas
            </div>

          ) : (

            <div className="grid grid-cols-2 gap-4">

              {actividadesDisponibles.map(
                (act: Actividad) => {

                  const selected =
                    form.actividades?.some(
                      (a) =>
                        a.actividadId === act.id
                    );

                  return (

                    <div
                      key={act.id}
                      onClick={() =>
                        toggleActividad(act)
                      }
                      className={`
                        border-2 rounded-2xl p-4 cursor-pointer transition-all
                        ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }
                      `}
                    >

                      <div className="flex justify-between items-center">

                        <div>

                          <h4 className="font-semibold text-gray-800">
                            {act.nombre}
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            ${act.precio}
                          </p>
                        </div>

                        <div
                          className={`
                            w-5 h-5 rounded-full border-2
                            flex items-center justify-center
                            ${
                              selected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }
                          `}
                        >

                          {selected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-xl"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl"
          >
            {alumno ? "Guardar Cambios" : "Guardar Alumno"}
          </button>
        </div>
      </div>
    </div>
  );
}