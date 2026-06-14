import { useEffect, useState } from "react";

import MainLayout from "../layout/MainLayout";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// 🔥 SERVICES
import { getAlumnos } from "../services/alumnosService";
import { getActividades } from "../services/actividadesService";
import { getProfesores } from "../services/profesoresService";
import { getHorarios } from "../services/horariosService";

export default function Reportes() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [actividadFiltro, setActividadFiltro] = useState("Todas");
  const [periodo, setPeriodo] = useState("mes");
  const [fechaDesde, setFechaDesde] = useState("");
  const [loading, setLoading] = useState(true);
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] =
  useState({
    actividad: "Todas",
    periodo: "mes",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  let alumnosFiltrados = [...alumnos];

  if (filtrosAplicados.actividad !== "Todas") {

    alumnosFiltrados =
      alumnosFiltrados.filter((alumno) =>
        alumno.actividades?.some(
          (act: any) =>
            act.nombre === filtrosAplicados.actividad
        )
      );
  }

  // 🔥 FILTRO FECHAS
  const hoy = new Date();

  let fechaInicio = new Date();

  if (  filtrosAplicados.periodo === "semana") {

    fechaInicio.setDate(
      hoy.getDate() - 7
    );
  }

  if (filtrosAplicados.periodo === "mes") {

    fechaInicio.setMonth(
      hoy.getMonth() - 1
    );
  }

  if (filtrosAplicados.periodo === "anio") {

    fechaInicio.setFullYear(
      hoy.getFullYear() - 1
    );
  }

  if (
    filtrosAplicados.periodo === "personalizado" &&
    filtrosAplicados.fechaDesde &&
    filtrosAplicados.fechaHasta
  ) {

    fechaInicio = new Date(filtrosAplicados.fechaDesde);

    const fechaFin =
      new Date( filtrosAplicados.fechaHasta);

    alumnosFiltrados =
      alumnosFiltrados.filter((a) => {

        if (!a.vencimiento)
          return false;

        const fechaAlumno =
          new Date(a.vencimiento);

        return (
          fechaAlumno >= fechaInicio &&
          fechaAlumno <= fechaFin
        );
      });
  } else {

    alumnosFiltrados =
      alumnosFiltrados.filter((a) => {

        if (!a.vencimiento)
          return false;

        const fechaAlumno =
          new Date(a.vencimiento);

        return fechaAlumno >= fechaInicio;
      });
  }

  const loadData = async () => {
    try {
      const [
        alumnosData,
        actividadesData,
        profesoresData,
        horariosData,
      ] = await Promise.all([
        getAlumnos(),
        getActividades(),
        getProfesores(),
        getHorarios(),
      ]);

      setAlumnos(alumnosData || []);
      setActividades(actividadesData || []);
      setProfesores(profesoresData || []);
      setHorarios(horariosData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 INGRESOS
  const ingresosMensuales = alumnosFiltrados.reduce(
    (acc, alumno) =>
      acc +
      (alumno.actividades?.reduce(
        (sum: number, act: any) =>
          sum + Number(act.precio || 0),
        0
      ) || 0),
    0
  );

  // 🔥 ACTIVIDAD MÁS POPULAR
  const actividadesCount: any = {};

  alumnosFiltrados.forEach((alumno) => {
    alumno.actividades?.forEach((act: any) => {
      actividadesCount[act.nombre] =
        (actividadesCount[act.nombre] || 0) + 1;
    });
  });

  const actividadPopular =
    Object.keys(actividadesCount).length > 0
      ? Object.entries(actividadesCount).sort(
          (a: any, b: any) => b[1] - a[1]
        )[0][0]
      : "Sin datos";

  // 🔥 RETENCIÓN
  const activos = alumnosFiltrados.filter(
    (a) => a.estado === "activo"
  ).length;

  const retencion =
    alumnosFiltrados.length > 0
      ? ((activos / alumnosFiltrados.length) * 100).toFixed(1)
      : "0";

  // 🔥 ASISTENCIA POR ACTIVIDAD
  const asistenciaData = Object.keys(
    actividadesCount
  ).map((nombre) => ({
    name: nombre,
    value: actividadesCount[nombre],
  }));

  // 🔥 DISTRIBUCIÓN POR CANTIDAD DE ACTIVIDADES

  const planesMap: any = {};

  alumnosFiltrados.forEach((alumno) => {

    const cantidad =
      alumno.actividades?.length || 0;

    if (cantidad === 0)
      return;

    const planNombre =
      cantidad === 1
        ? "1 Actividad"
        : `${cantidad} Actividades`;

    planesMap[planNombre] =
      (planesMap[planNombre] || 0) + 1;
  });

  // 🔥 ORDENAR
  const planesData = Object.keys(
    planesMap
  )
    .sort((a, b) => {

      const numA =
        parseInt(a);

      const numB =
        parseInt(b);

      return numA - numB;
    })
    .map((plan) => ({
      plan,
      value: planesMap[plan],
    }));

  // 🔥 INGRESOS POR MES
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const ingresosData = meses.map((mes) => ({
    mes,
    ingresos: ingresosMensuales,
    objetivo: ingresosMensuales + 50000,
  }));

  // 🔥 ACTIVIDAD RECIENTE
  const actividadesRecientes = [
    `${alumnos.length} alumnos registrados`,
    `${profesores.length} profesores activos`,
    `${horarios.length} horarios cargados`,
    `${actividades.length} actividades disponibles`,
  ];

  // 🔥 MÉTRICAS
  const promedioAsistencia =
    horarios.length > 0
      ? Math.round(
          (alumnosFiltrados.length / horarios.length) * 10
        )
      : 0;

  const ingresoPorCliente =
    alumnosFiltrados.length > 0
      ? Math.round(
          ingresosMensuales / alumnosFiltrados.length
        )
      : 0;

    // 🔥 FILTRAR ALUMNOS POR ACTIVIDAD

  const planesValidos =
  planesData.filter(
    (p) => Number(p.value) > 0
  );  
  

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando reportes...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="flex justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            Reportes y Estadísticas
          </h1>

          <p className="text-gray-500 text-sm">
            Análisis completo del gimnasio
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">
          Exportar Reporte
        </button>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <KPI
          title="Total Clientes"
          value={alumnosFiltrados.length}
        />

        <KPI
          title="Ingresos Mensuales"
          value={`$${ingresosMensuales}`}
          highlight
        />

        <KPI
          title="Actividad Más Popular"
          value={actividadPopular}
        />

        <KPI
          title="Tasa de Retención"
          value={`${retencion}%`}
        />
      </div>
      <div className="flex items-end">

        <button
          onClick={() =>
            setFiltrosAplicados({
              actividad: actividadFiltro,
              periodo,
              fechaDesde,
              fechaHasta,
            })
          }
          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            rounded-xl
            py-3
            font-medium
            transition
          "
        >
          Aplicar filtros
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">

        <div className="grid grid-cols-4 gap-4">

          {/* ACTIVIDAD */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Actividad
            </label>

            <select
              value={actividadFiltro}
              onChange={(e) =>
                setActividadFiltro(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3 mt-2"
            >

              <option value="Todas">
                Todas las actividades
              </option>

              {actividades.map((act) => (

                <option
                  key={act.id}
                  value={act.nombre}
                >
                  {act.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* PERIODO */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Tiempo
            </label>

            <select
              value={periodo}
              onChange={(e) =>
                setPeriodo(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3 mt-2"
            >

              <option value="semana">
                Esta semana
              </option>

              <option value="mes">
                Este mes
              </option>

              <option value="anio">
                Este año
              </option>

              <option value="personalizado">
                Definir período
              </option>
            </select>
          </div>

          {/* DESDE */}
          {periodo === "personalizado" && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Desde
              </label>

              <input
                type="date"
                value={fechaDesde}
                onChange={(e) =>
                  setFechaDesde(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
              />
            </div>
          )}

          {/* HASTA */}
          {periodo === "personalizado" && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Hasta
              </label>

              <input
                type="date"
                value={fechaHasta}
                onChange={(e) =>
                  setFechaHasta(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* INGRESOS */}
        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="font-semibold mb-2">
            Ingresos Mensuales
          </h2>

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <LineChart data={ingresosData}>
              <XAxis dataKey="mes" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#16a34a"
              />

              <Line
                type="monotone"
                dataKey="objetivo"
                stroke="#94a3b8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ASISTENCIA */}
        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="font-semibold mb-2">
            Alumnos por Actividad
          </h2>

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <BarChart data={asistenciaData}>
              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PLANES + ACTIVIDAD */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* PLANES */}
        <div className="bg-white p-4 rounded-xl shadow min-h-[420px]">

          <h2 className="font-semibold mb-4">
            Distribución de Planes
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={planesValidos}
                dataKey="value"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={3}
                label
              >

                {planesValidos.map((_, index) => {

                  const colors = [
                    "#3b82f6",
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                  ];

                  return (
                    <Cell
                      key={index}
                      fill={
                        colors[
                          index % colors.length
                        ]
                      }
                    />
                  );
                })}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* LEYENDA */}
          <div className="mt-4 space-y-1 text-sm">

            {planesValidos.map((p, i) => (

              <div
                key={i}
                className="flex justify-between"
              >

                <span>{p.plan}</span>

                <span className="font-semibold">
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="font-semibold mb-4">
            Actividad Reciente
          </h2>

          {actividadesRecientes.map((a, i) => (

            <p
              key={i}
              className="text-sm text-gray-600 mb-2"
            >
              • {a}
            </p>
          ))}
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-3 gap-4">

        <KPI
          title="Promedio Asistencia"
          value={`${promedioAsistencia}%`}
        />

        <KPI
          title="Profesores"
          value={profesores.length}
        />

        <KPI
          title="Ingreso por Cliente"
          value={`$${ingresoPorCliente}`}
        />
      </div>

    </MainLayout>
  );
}

function KPI({
  title,
  value,
  highlight,
}: any) {

  return (
    <div
      className={`
        p-4 rounded-xl shadow

        ${
          highlight
            ? "bg-green-600 text-white"
            : "bg-white"
        }
      `}
    >

      <p className="text-sm opacity-80">
        {title}
      </p>

      <h3 className="text-xl font-bold">
        {value}
      </h3>
    </div>
  );
}