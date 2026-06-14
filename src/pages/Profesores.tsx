import { useEffect, useState } from "react";

import MainLayout from "../layout/MainLayout";

import {
  Pencil,
  Trash2,
  X,
  Plus,
} from "lucide-react";

import {
  type Profesor,
  getProfesores,
  agregarProfesor,
  eliminarProfesor,
} from "../services/profesoresService";

import {
  getActividades,
} from "../services/actividadesService";

type Actividad = {
  id?: string;
  nombre: string;
  profesor?: string;
  dia?: string;
  horario?: string;
};

export default function Profesores() {

  const [busqueda, setBusqueda] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [profesores, setProfesores] =
    useState<Profesor[]>([]);

  const [actividades, setActividades] =
    useState<Actividad[]>([]);

  // 🔥 LOAD
  useEffect(() => {

    loadProfesores();
    loadActividades();

  }, []);

  const loadProfesores =
    async () => {

      const data =
        await getProfesores();

      setProfesores(data);
    };

  const loadActividades =
    async () => {

      const data =
        await getActividades();

      setActividades(data);
    };

  // 🔥 AGREGAR
  const handleAdd =
    async (
      profesor: Profesor
    ) => {

      await agregarProfesor(
        profesor
      );

      loadProfesores();
    };

  // 🔥 ELIMINAR
  const handleDelete =
    async (
      id: string
    ) => {

      const ok =
        confirm(
          "¿Eliminar profesor?"
        );

      if (!ok) return;

      await eliminarProfesor(id);

      loadProfesores();
    };

  // 🔥 FILTRO
  const filtrados =
    profesores.filter((p) =>
      `${p.nombre} ${p.especialidad}`
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
    );

  // 🔥 KPIs
  const total =
    profesores.length;

  const activos =
    profesores.filter(
      (p) =>
        p.estado === "activo"
    ).length;

  const especialidades =
    new Set(
      profesores.map(
        (p) => p.especialidad
      )
    ).size;

  const clases =
    profesores.reduce(
      (acc, p) =>
        acc +
        (p.actividades?.length ||
          0),
      0
    );

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Gestión de Profesores
        </h1>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >

          <Plus size={18} />

          Nuevo Profesor
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <Card
          title="Total"
          value={total}
        />

        <Card
          title="Activos"
          value={activos}
        />

        <Card
          title="Especialidades"
          value={especialidades}
        />

        <Card
          title="Clases"
          value={clases}
        />
      </div>

      {/* BUSCADOR */}
      <input
        placeholder="Buscar por nombre o especialidad..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(
            e.target.value
          )
        }
        className="w-full mb-6 border px-4 py-3 rounded-xl"
      />

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {filtrados.map((prof) => (

          <div
            key={prof.id}
            className="bg-white rounded-2xl shadow border p-5"
          >

            {/* HEADER */}
            <div className="flex justify-between">

              <div>
                <h2 className="font-bold text-lg">
                  {prof.nombre}
                </h2>

                <p className="text-sm text-gray-500">
                  {prof.especialidad}
                </p>
              </div>

              <div className="flex gap-2">

                <Pencil
                  className="text-blue-500 cursor-pointer"
                  size={16}
                />

                <Trash2
                  onClick={() =>
                    handleDelete(
                      prof.id!
                    )
                  }
                  className="text-red-500 cursor-pointer"
                  size={16}
                />
              </div>
            </div>

            {/* INFO */}
            <div className="mt-4 text-sm space-y-2">

              <p>
                📞 {prof.telefono}
              </p>

              <p>
                📧 {prof.email}
              </p>

              <p>
                Estado:
                <span
                  className={`ml-2 font-medium ${
                    prof.estado ===
                    "activo"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {prof.estado}
                </span>
              </p>

              {/* ACTIVIDADES */}
              <div className="flex flex-wrap gap-2 mt-3">

                {prof.actividades?.map(
                  (act, idx) => (

                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg"
                    >
                      {act}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (

        <ModalProfesor
          actividades={
            actividades
          }
          onClose={() =>
            setShowModal(false)
          }
          onSave={handleAdd}
        />
      )}
    </MainLayout>
  );
}

// 🔥 MODAL
function ModalProfesor({
  onClose,
  onSave,
  actividades,
}: {
  onClose: () => void;
  onSave: (
    profesor: Profesor
  ) => void;
  actividades: Actividad[];
}) {

  const [form, setForm] =
    useState<Profesor>({
      nombre: "",
      email: "",
      telefono: "",
      especialidad: "",
      estado: "activo",
      especialidades: [],
      actividades: [],
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

  // 🔥 ACTIVIDADES
  const toggleActividad = (
    actividad: Actividad
  ) => {

    const texto =
      `${actividad.nombre} • ${
        actividad.dia || "Sin día"
      } • ${
        actividad.horario ||
        "Sin horario"
      }`;

    const exists =
      form.actividades?.includes(
        texto
      );

    if (exists) {

      setForm({
        ...form,
        actividades:
          form.actividades?.filter(
            (a) => a !== texto
          ),
      });

    } else {

      setForm({
        ...form,
        actividades: [
          ...(form.actividades ||
            []),
          texto,
        ],
      });
    }
  };

  const handleSave = () => {

    if (
      !form.nombre ||
      !form.email
    )
      return;

    onSave(form);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-2xl font-bold">
            Nuevo Profesor
          </h2>

          <button
            onClick={onClose}
          >
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
              onChange={
                handleChange
              }
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          {/* EMAIL + TEL */}
          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="text-sm font-medium">
                Email
              </label>

              <input
                name="email"
                onChange={
                  handleChange
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
              />
            </div>

            <div>

              <label className="text-sm font-medium">
                Teléfono
              </label>

              <input
                name="telefono"
                onChange={
                  handleChange
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
              />
            </div>
          </div>

          {/* ESPECIALIDAD */}
          <div>

            <label className="text-sm font-medium">
              Especialidad
            </label>

            <input
              name="especialidad"
              onChange={
                handleChange
              }
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          {/* ACTIVIDADES */}
          <div>

            <label className="text-sm font-medium">
              Actividades que dicta
            </label>

            <div className="grid grid-cols-2 gap-3 mt-3">

              {actividades.map(
                (actividad) => {

                  const texto =
                    `${actividad.nombre} • ${
                      actividad.dia ||
                      "Sin día"
                    } • ${
                      actividad.horario ||
                      "Sin horario"
                    }`;

                  const active =
                    form.actividades?.includes(
                      texto
                    );

                  return (

                    <button
                      key={
                        actividad.id
                      }
                      type="button"
                      onClick={() =>
                        toggleActividad(
                          actividad
                        )
                      }
                      className={`border rounded-xl px-4 py-3 text-sm transition ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {texto}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t p-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-6 py-3 border rounded-xl"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            Crear Profesor
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔥 KPI CARD
function Card({
  title,
  value,
}: any) {

  return (
    <div className="bg-white p-5 rounded-2xl shadow border">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}