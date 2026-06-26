import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";

import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

// 🔥 SERVICES
import {
  getHorarios,
  agregarHorario,
  eliminarHorario,
  type Horario,
} from "../services/horariosService";

import {
  getActividades,
  type Actividad,
  actualizarHorarioActividad,
} from "../services/actividadesService";

import {
  getProfesores,
  type Profesor,
} from "../services/profesoresService";
import { db } from "../firebase/config";

export default function Horarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [profesores, setProfesores] = useState<Profesor[]>([]);

  // 🔥 LOAD FIREBASE
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {

    const horariosData =
      await getHorarios();

    const actividadesData =
      await getActividades();

    const profesoresData =
      await getProfesores();

    setHorarios(horariosData);

    setActividades(actividadesData);

    setProfesores(profesoresData);

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);
  }
};

  // ➕ AGREGAR
  const handleAdd = async (data: Horario) => {

    try {

      await agregarHorario(data);

      // 🔥 ACTUALIZAR ACTIVIDAD
      const actividad =
        actividades.find(
          (a) =>
            a.id === data.actividad
        );

      if (actividad) {

        await actualizarHorarioActividad(
          actividad.id!,
          {
            dia: data.dia,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
          }
        );
      }

      const updated =
        await getHorarios();

      setHorarios(updated);

      setShowModal(false);

    } catch (error) {

      console.error(error);
    }
  };

  // 🗑️ ELIMINAR
  const handleDelete = async (id: string) => {
    const confirmar = confirm("¿Eliminar horario?");

    if (!confirmar) return;

    await eliminarHorario(id);

    setHorarios((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Horarios
          </h1>

          <p className="text-gray-500 mt-1">
            Administrá los horarios de las actividades
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow"
        >
          <Plus size={18} />
          Agregar Horario
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <Card
          title="Total Horarios"
          value={horarios.length}
        />

        <Card
          title="Actividades"
          value={actividades.length}
        />

        <Card
          title="Turnos"
          value={horarios.length}
        />

        <Card
          title="Cupos Totales"
          value={
            horarios.reduce(
              (acc, item) => acc + Number(item.cupo),
              0
            )
          }
        />
      </div>

      {/* CALENDARIO */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-8 border-b bg-gray-50 text-sm font-medium text-gray-600">

          <div className="p-4 border-r text-center">
            Hora
          </div>

          {[
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo",
          ].map((dia) => (
            <div
              key={dia}
              className="p-4 border-r text-center"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* HORAS */}
        {[
          "07:00",
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
        ].map((hora) => (

          <div
            key={hora}
            className="grid grid-cols-8 min-h-[110px] border-b"
          >

            {/* HORA */}
            <div className="border-r p-3 text-sm text-gray-500 text-center">
              {hora}
            </div>

            {/* DÍAS */}
            {[
              "Lunes",
              "Martes",
              "Miércoles",
              "Jueves",
              "Viernes",
              "Sábado",
            ].map((dia) => {

              const clases = horarios.filter(
                (h) =>
                  h.dia === dia &&
                  h.horaInicio.startsWith(hora.split(":")[0])
              );

              return (
                <div
                  key={dia}
                  className="border-r p-1 relative"
                >

                  {clases.map((clase) => (

                    <div
                      key={clase.id}
                      className={`
                        rounded-xl p-3 text-sm shadow-sm mb-2 border-l-4

                        ${
                          clase.actividad === "Yoga"
                            ? "bg-green-100 border-green-400"
                            : ""
                        }

                        ${
                          clase.actividad === "Funcional"
                            ? "bg-blue-100 border-blue-400"
                            : ""
                        }

                        ${
                          clase.actividad === "Musculación"
                            ? "bg-orange-100 border-orange-400"
                            : ""
                        }

                        ${
                          clase.actividad === "Pilates"
                            ? "bg-purple-100 border-purple-400"
                            : ""
                        }

                        ${
                          clase.actividad === "Spinning"
                            ? "bg-yellow-100 border-yellow-400"
                            : ""
                        }
                      `}
                    >

                      {/* NOMBRE */}
                      <p className="font-semibold">
                        {clase.actividad}
                      </p>

                      {/* PROFESOR */}
                      <p className="text-gray-600 text-xs">
                        {clase.profesor}
                      </p>

                      {/* HORARIO */}
                      <p className="text-xs mt-1">
                        {clase.horaInicio} - {clase.horaFin}
                      </p>

                      {/* CUPO */}
                      <div className="mt-2">

                        {/* ocupación ficticia */}
                        {(() => {

                          const ocupacion = Math.floor(clase.cupo * 0.8);

                          return (
                            <>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Cupo</span>
                                <span>
                                  {ocupacion}/{clase.cupo}
                                </span>
                              </div>

                              <div className="w-full bg-white/60 rounded-full h-2">

                                <div
                                  className={`
                                    h-2 rounded-full

                                    ${
                                      ocupacion / clase.cupo > 0.9
                                        ? "bg-red-400"
                                        : ocupacion / clase.cupo > 0.7
                                        ? "bg-yellow-400"
                                        : "bg-green-400"
                                    }
                                  `}
                                  style={{
                                    width: `${
                                      (ocupacion / clase.cupo) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* ACCIONES */}
                      <div className="flex justify-end gap-2 mt-3">

                        <Pencil
                          size={14}
                          className="text-blue-500 cursor-pointer"
                        />

                        <Trash2
                          size={14}
                          onClick={() =>
                            handleDelete(clase.id!)
                          }
                          className="text-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <ModalHorario
          actividades={actividades}
          profesores={profesores}
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
        />
      )}

    </MainLayout>
  );
}

/* CARD */

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

/* MODAL */

function ModalHorario({
  onClose,
  onSave,
  actividades,
  profesores,
}: any) {

  const [form, setForm] = useState({
    actividad: "",
    actividadId: "",
    profesor: "",
    profesorId: "",
    dia: "",
    cupo: 20,
    horaInicio: "",
    horaFin: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    const { name, value } = e.target;

    // 🔥 ACTIVIDAD
    if (name === "actividad") {

      const act =
        actividades.find(
          (a: Actividad) =>
            a.id === value
        );

      setForm({
        ...form,

        actividadId: act?.id || "",

        actividad: act?.nombre || "",
      });

      return;
    }

    // 🔥 PROFESOR
    if (name === "profesor") {

      const prof =
        profesores.find(
          (p: Profesor) =>
            p.id === value
        );

      setForm({
        ...form,

        profesorId: prof?.id || "",

        profesor: prof?.nombre || "",
      });

      return;
    }

    if (name === "cupo") {
      setForm({
        ...form,
        cupo: Number(value),
      });

      return;
    }
  };

  const handleSave = async () => {
    if (
      !form.actividad ||
      !form.profesor ||
      !form.dia
    ) {
      return alert("Completar campos");
    }

    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white w-[700px] rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-2xl font-semibold">
            Nuevo Horario
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 text-2xl"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* ACTIVIDAD */}
          <div>
            <label className="text-sm font-medium">
              Actividad *
            </label>

            <select
              name="actividad"
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl px-4 py-3"
            >
              <option value="">
                Seleccionar actividad
              </option>

              {actividades.map((a: Actividad) => (
                <option
                  key={a.id}
                  value={a.id}
                >
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* PROFESOR */}
          <div>
            <label className="text-sm font-medium">
              Instructor *
            </label>

            <select
              name="profesor"
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl px-4 py-3"
            >

              <option value="">
                Seleccionar profesor
              </option>

              {profesores.map((p: Profesor) => (

                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* FILA */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium">
                Día *
              </label>

              <select
                name="dia"
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3"
              >
                <option value="">
                  Seleccionar día
                </option>

                <option>Lunes</option>
                <option>Martes</option>
                <option>Miércoles</option>
                <option>Jueves</option>
                <option>Viernes</option>
                <option>Sábado</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Cupo máximo *
              </label>

              <input
                type="number"
                name="cupo"
                value={form.cupo}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3"
              />
            </div>
          </div>

          {/* HORAS */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium">
                Hora inicio *
              </label>

              <input
                type="time"
                name="horaInicio"
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Hora fin *
              </label>

              <input
                type="time"
                name="horaFin"
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">

            <Calendar className="text-blue-500" />

            <div>
              <p className="font-medium text-blue-700">
                Gestión de horarios
              </p>

              <p className="text-sm text-blue-600">
                El horario se vinculará automáticamente
                con la actividad y el profesor.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-6 border-t">

          <button
            onClick={onClose}
            className="px-5 py-3 border rounded-xl"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
          >
            Crear Horario
          </button>
        </div>
      </div>
    </div>
  );
}