import { useEffect, useState } from "react";

import MainLayout from "../layout/MainLayout";

import { Dumbbell, Users, Calendar, Search, Plus, Pencil, Trash2, Info, X, } from "lucide-react";

import { getActividades, agregarActividad, eliminarActividad, type Actividad,} from "../services/actividadesService";

import { getProfesores, type Profesor } from "../services/profesoresService";


export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [profesores, setProfesores] = useState<Profesor[]>([]);

  // 🔥 CARGAR
  useEffect(() => {
    loadActividades();
    loadProfesores();
  }, []);

  const loadActividades = async () => {
    const data = await getActividades();
    setActividades(data);
  };

  const loadProfesores = async () => {
    const data = await getProfesores();
    setProfesores(data);
  };

  // 🔥 AGREGAR
  const handleAdd = async (actividad: Actividad) => {
    await agregarActividad(actividad);

    loadActividades();
  };

  // 🔥 ELIMINAR
  const handleDelete = async (id: string) => {
    const ok = confirm("¿Eliminar actividad?");

    if (!ok) return;

    await eliminarActividad(id);

    loadActividades();
  };

  // 🔎 FILTRO
  const filtradas = actividades.filter((a) =>
    `${a.nombre} ${a.descripcion} ${a.profesor}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // KPIs
  const total = actividades.length;

  const cupoTotal = actividades.reduce(
    (acc, a) => acc + Number(a.cupo),
    0
  );

  const inscritos = actividades.reduce(
    (acc, a) => acc + Number(a.inscritos),
    0
  );

  const ocupacion =
    cupoTotal > 0
      ? Math.round((inscritos / cupoTotal) * 100)
      : 0;

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Actividades
          </h1>

          <p className="text-gray-500 mt-1">
            Administra las clases y actividades del gimnasio
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow"
        >
          <Plus size={18} />
          Agregar Actividad
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          title="Total Actividades"
          value={total}
          icon={<Dumbbell className="text-blue-600" />}
        />

        <Card
          title="Cupo Total"
          value={cupoTotal}
          icon={<Users className="text-purple-600" />}
        />

        <Card
          title="Inscriptos"
          value={inscritos}
          icon={<Users className="text-green-600" />}
        />

        <Card
          title="Ocupación"
          value={`${ocupacion}%`}
          icon={<Calendar className="text-orange-500" />}
        />
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
        <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
          <Search className="text-gray-400" size={18} />

          <input
            placeholder="Buscar actividades..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtradas.map((actividad) => (
          <ActividadCard
            key={actividad.id}
            actividad={actividad}
            onDelete={() => handleDelete(actividad.id!)}
          />
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <ModalActividad
          profesores={profesores}
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
        />
      )}
    </MainLayout>
  );
}

function ActividadCard({
  actividad,
  onDelete,
}: {
  actividad: Actividad;
  onDelete: () => void;
}) {
  const porcentaje =
    actividad.cupo > 0
      ? (actividad.inscritos / actividad.cupo) * 100
      : 0;

  return (
    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition">
      {/* HEADER */}
      <div className="p-5 border-b">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {actividad.nombre}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              👨‍🏫 {actividad.profesor}
            </p>
          </div>

          <div className="flex gap-3">
            <Pencil
              size={18}
              className="text-blue-500 cursor-pointer"
            />

            <Trash2
              size={18}
              onClick={onDelete}
              className="text-red-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-5">
        <div className="flex gap-2 items-start mb-4">
          <Info size={16} className="text-gray-400 mt-1" />

          <p className="text-sm text-gray-600 leading-relaxed">
            {actividad.descripcion}
          </p>
        </div>

        {/* CUPO */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Cupo</span>

            <span className="font-semibold">
              {actividad.inscritos} / {actividad.cupo}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* HORARIOS */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-700">
            Los horarios se configuran desde la sección
            "Horarios"
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: any;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h2 className="text-3xl font-bold mt-2">{value}</h2>
      </div>

      <div className="bg-gray-100 p-4 rounded-2xl">
        {icon}
      </div>
    </div>
  );
}

function ModalActividad({
  onClose,
  onSave,
  profesores,
}: {
  onClose: () => void;
  onSave: (actividad: Actividad) => void;
  profesores: Profesor[];
}) {

  const [form, setForm] =
    useState<Actividad>({
      nombre: "",
      descripcion: "",
      profesor: "",
      profesorId: "",
      cupo: 20,
      precio: 0,
      inscritos: 0,
      color: "blue",
    });

  const handleChange = (
    e: any
  ) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleProfesorChange = (
    e: any
  ) => {

    const profesor =
      profesores.find(
        (p) =>
          p.id ===
          e.target.value
      );

    setForm({
      ...form,
      profesorId:
        profesor?.id || "",
      profesor:
        profesor?.nombre || "",
    });
  };

  const handleSave = () => {

    if (
      !form.nombre ||
      !form.profesor
    )
      return;

    onSave({
      ...form,
      cupo: Number(form.cupo),
      precio: Number(form.precio),
      inscritos: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">

      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-2xl font-bold">
            Nueva Actividad
          </h2>

          <button onClick={onClose}>
            <X className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* NOMBRE */}
          <div>
            <label className="text-sm font-medium">
              Nombre
            </label>

            <input
              name="nombre"
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm font-medium">
              Descripción
            </label>

            <textarea
              name="descripcion"
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          {/* PROFESOR + CUPO */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium">
                Profesor
              </label>

              <select
                onChange={
                  handleProfesorChange
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
              >

                <option value="">
                  Seleccionar profesor
                </option>

                {profesores.map((p) => (

                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Cupo
              </label>

              <input
                type="number"
                name="cupo"
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 mt-2"
              />
            </div>
          </div>

          {/* PRECIO */}
          <div>
            <label className="text-sm font-medium">
              Precio
            </label>

            <input
              type="number"
              name="precio"
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          {/* INFO */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">

            <p className="text-blue-700 text-sm">
              Los horarios se configuran desde Horarios.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            Crear Actividad
          </button>
        </div>
      </div>
    </div>
  );
}