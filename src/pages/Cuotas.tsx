import { useEffect, useState, useMemo } from "react";
import MainLayout from "../layout/MainLayout";
import { getAlumnos, registrarPago,} from "../services/alumnosService";
import { registrarVenta, getIngresosMes } from "../services/pagosService";

import {
  Search,
  Filter,
  Eye,
  Pencil,
} from "lucide-react";


type ActividadAlumno = {
  actividadId: string;
  nombre: string;
  precio: number;
};

type Alumno = {
  id?: string;
  nombre: string;
  email: string;
  actividades: ActividadAlumno[];
  estado: "activo" | "inactivo";
  vencimiento: string;
};

export default function Cuotas() {

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [tipoDescuento, setTipoDescuento] =
  useState<"ninguno" | "porcentaje" | "monto">(
    "ninguno"
  );

  const [descripcionVenta, setDescripcionVenta] = useState("");

  const [montoVenta, setMontoVenta] = useState(0);

  const [valorDescuento, setValorDescuento] = useState(0);

  const [ingresosMes, setIngresosMes] = useState(0);

  const [showPagoAlumnoModal, setShowPagoAlumnoModal] = useState(false);

  const [showVentaModal, setShowVentaModal] = useState(false);

  const [busquedaAlumnoPago, setBusquedaAlumnoPago] = useState("");
  const [modoRenovacion, setModoRenovacion] = useState< "desdeHoy" | "desdeVencimiento" >("desdeVencimiento");
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  const [showEditarModal, setShowEditarModal] = useState(false);
  const [editAlumno, setEditAlumno] = useState<Alumno | null>(null);
  
  const cargarAlumnos = async () => {

    const data = await getAlumnos();
    setAlumnos( data as Alumno[] );

  };

  const cargarIngresos = async () => {

    const total = await getIngresosMes();
    setIngresosMes(total);

  };

  useEffect(() => {
    const loadIngresos =
      async () => {

        await cargarIngresos();

      };

    loadIngresos();
  }, []);

  // CARGAR FIREBASE
  useEffect(() => {
    const load = async () => {
      try {
        await cargarAlumnos();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  

  // 🔥 ESTADO CUOTA
  const getEstadoCuota = (alumno: Alumno) => {

    if (alumno.estado === "inactivo") {
      return "inactivo";
    }

    const hoy = new Date();
    const venc = alumno.vencimiento ? new Date(alumno.vencimiento): new Date();

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

  const handleRegistrarPago = async () => {

    if (!selectedAlumno?.id)
      return;

    try {

      let nuevaFecha: Date;

      if (
        modoRenovacion ===
        "desdeVencimiento" &&
        selectedAlumno.vencimiento
      ) {

        const vencimientoActual =
          new Date(
            selectedAlumno.vencimiento
          );

        nuevaFecha =
          new Date(vencimientoActual);

        nuevaFecha.setMonth(
          nuevaFecha.getMonth() + 1
        );

      } else {

        nuevaFecha =
          new Date();

        nuevaFecha.setMonth(
          nuevaFecha.getMonth() + 1
        );

      }

      const fechaFormateada =
        nuevaFecha
          .toISOString()
          .split("T")[0];

      const montoTotal =
      calcularTotalConDescuento(
        selectedAlumno
      );

      await registrarPago(
        selectedAlumno.id,
        fechaFormateada,
        metodoPago,
        montoTotal,
        selectedAlumno.nombre,
        selectedAlumno.actividades.map(
          (a) => a.nombre
        )
      );

      await cargarIngresos();

      // 🔥 RECARGAR FIREBASE
      await cargarAlumnos();

      setShowPagoModal(false);

      setSelectedAlumno(null);

    } catch (error) {

      console.error(error);
    }
  };

  const handleRegistrarVenta = async () => {

    if (
      !descripcionVenta ||
      montoVenta <= 0
    ) {
      alert("Completá los datos");
      return;
    }

    try {

      await registrarVenta(
        descripcionVenta,
        montoVenta,
        metodoPago
      );

      alert("Venta registrada");
      await cargarIngresos();

      setDescripcionVenta("");
      setMontoVenta(0);

      setShowPagoModal(false);

    } catch (error) {

      console.error(error);

    }

  };

  const calcularIngresoAlumno = (
    alumno: Alumno
  ) => {

    if (!alumno.actividades)
      return 0;

    return alumno.actividades.reduce(
      (acc, act) =>
        acc + Number(act.precio || 0),
      0
    );
  };

  const calcularTotalConDescuento = (
    alumno: Alumno
  ) => {

    const total = calcularIngresoAlumno(alumno);

    if (
      tipoDescuento === "ninguno"
    ) {
      return total;
    }

    if (
      tipoDescuento === "porcentaje"
    ) {
      return Math.max(
        0,
        total -
          (total * valorDescuento) / 100
      );
    }

    if (
      tipoDescuento === "monto"
    ) {
      return Math.max(
        0,
        total - valorDescuento
      );
    }

    return total;
  };

  const estadisticas = useMemo(() => {

    let pagadas = 0;
    let pendientes = 0;
    let vencidas = 0;

    alumnos.forEach((alumno) => {

      const estado =
        getEstadoCuota(alumno);

      if (estado === "pagado")
        pagadas++;

      if (estado === "pendiente")
        pendientes++;

      if (estado === "vencido")
        vencidas++;

    });

    return {
      cuotasPagadas: pagadas,
      cuotasPendientes: pendientes,
      cuotasVencidas: vencidas,
      morosos: vencidas,
    };

  }, [alumnos]);

  // BUSCADOR
  const filtrados = useMemo(() => {
    return alumnos.filter((a) =>
      `${a.nombre} ${a.email} ${a.actividades
        ?.map((act) => act.nombre)
        .join(" ")}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [alumnos, busqueda]);

  const alumnosPagoFiltrados = useMemo(() => {
    return alumnos.filter((a) =>
      a.nombre
        .toLowerCase()
        .includes(busquedaAlumnoPago.toLowerCase())
    );
  }, [alumnos, busquedaAlumnoPago]);

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando cuotas...</p>
      </MainLayout>
    );
  }


  return (
    <MainLayout>
      {/* MODAL PAGO */}
        {showPagoModal && (
            
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white w-[450px] rounded-3xl p-7 shadow-xl">

              {/* HEADER */}
              <div className="mb-6">

                <h2 className="text-2xl font-bold">
                  Registrar Pago
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Confirmá el pago del alumno
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl mb-4">

                <p className="font-semibold">
                  {selectedAlumno?.nombre}
                </p>

                <p className="text-sm text-gray-500">
                  Vence:
                  {" "}
                  {selectedAlumno?.vencimiento}
                </p>

              </div>

              {/* DESCUENTO */}
              <div className="mb-4">

                <label className="text-sm text-gray-500">
                  Tipo de descuento
                </label>

                <select
                  value={tipoDescuento}
                  onChange={(e) =>
                    setTipoDescuento(
                      e.target.value
                    )
                  }
                  className="w-full border px-4 py-3 rounded-2xl mt-2"
                >

                  <option value="ninguno">
                    Sin descuento
                  </option>

                  <option value="porcentaje">
                    Descuento %
                  </option>

                  <option value="monto">
                    Descuento $
                  </option>

                </select>

              </div>
              {tipoDescuento !== "ninguno" && (

                <div className="mb-4">

                  <label className="text-sm text-gray-500">

                    {tipoDescuento === "porcentaje"
                      ? "Porcentaje de descuento"
                      : "Monto de descuento"}

                  </label>

                  <input
                    type="number"
                    value={valorDescuento}
                    onChange={(e) =>
                      setValorDescuento(
                        Number(e.target.value)
                      )
                    }
                    className="w-full border px-4 py-3 rounded-2xl mt-2"
                  />

                </div>

              )}

              <div className="bg-green-50 p-4 rounded-xl mb-4">

                <p className="text-sm text-gray-500">
                  Total a cobrar
                </p>

                <h3 className="text-2xl font-bold text-green-600">

                  $
                  {selectedAlumno
                    ? calcularTotalConDescuento(
                        selectedAlumno
                      )
                    : 0}

                </h3>

              </div>  
              {/* MÉTODO */}
              <div className="mb-6">

                <label className="text-sm text-gray-500">
                  Método de Pago
                </label>
                <div className="mb-6">

                  <label className="text-sm text-gray-500">
                    Renovación
                  </label>

                  <select
                    value={modoRenovacion}
                    onChange={(e) =>
                      setModoRenovacion(
                        e.target.value as
                          | "desdeHoy"
                          | "desdeVencimiento"
                      )
                    }
                    className="w-full border px-4 py-3 rounded-2xl mt-2"
                  >
                    <option value="desdeVencimiento">
                      Mantener vencimiento actual (+1 mes)
                    </option>

                    <option value="desdeHoy">
                      Renovar desde hoy
                    </option>
                  </select>

                </div>

                <select
                  value={metodoPago}
                  onChange={(e) =>
                    setMetodoPago(e.target.value)
                  }
                  className="w-full border px-4 py-3 rounded-2xl mt-2"
                >

                  <option>Efectivo</option>
                  <option>Transferencia</option>
                  <option>Tarjeta</option>
                  <option>Mercado Pago</option>

                </select>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3">

                <button
                  onClick={() => {
                    setShowPagoModal(false);
                    setSelectedAlumno(null);
                  }}
                  className="px-5 py-2 rounded-xl border hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    if (
                      tipoMovimiento === "alumno"
                    ) {
                      handleRegistrarPago();
                    } else {
                      handleRegistrarVenta();
                    }
                  }}
                  className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            Gestión de Cuotas
          </h1>

          <p className="text-gray-500 text-sm">
            Administra los pagos y mensualidades
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={() =>
              setShowPagoAlumnoModal(true)
            }
            className="bg-green-600 text-white px-5 py-2 rounded-lg shadow"
          >
            Registrar Pago Alumno
          </button>

          <button
            onClick={() =>
              setShowVentaModal(true)
            }
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
          >
            Registrar Venta
          </button>

        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <KPI
          title="Total Ingresos del Mes"
          value={`$${ingresosMes.toLocaleString("es-AR")}`}
          highlight
        />

        <KPI
          title="Cuotas Pagadas"
          value={estadisticas.cuotasPagadas}
        />

        <KPI
          title="Pendientes"
          value={estadisticas.cuotasPendientes}
        />

        <KPI
          title="Clientes Morosos"
          value={estadisticas.morosos}
        />
      </div>

      {/* BUSCADOR */}
      <div className="flex gap-4 mb-6">

        <div className="flex items-center border rounded-lg px-3 py-2 w-full bg-white">

          <Search
            size={16}
            className="text-gray-400"
          />

          <input
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            className="ml-2 w-full outline-none"
          />
        </div>

        <button className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-6 text-sm text-gray-500 border-b p-4 bg-gray-50 font-medium">

          <div>Cliente</div>
          <div>Actividades</div>
          <div>Estado</div>
          <div>Fecha vencimiento</div>
          <div>Monto</div>
          <div>Acciones</div>
        </div>

        {/* FILAS */}
        {filtrados.map((alumno) => {

          const estado = getEstadoCuota(alumno);

          return (

            <div
              key={alumno.id}
              className="grid grid-cols-6 items-center border-b p-4 text-sm hover:bg-gray-50 transition"
            >

              {/* CLIENTE */}
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">

                  {alumno.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>
                  <p className="font-medium">
                    {alumno.nombre}
                  </p>

                  <p className="text-gray-500 text-xs">
                    {alumno.email}
                  </p>
                </div>
              </div>

              {/* ACTIVIDADES */} {/* PLAN */}
              <div className="flex flex-col gap-1">

                {alumno.actividades?.map(
                  (act, i) => (

                    <span
                      key={i}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full w-fit"
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

              {/* FECHA */}
              <div>
                {alumno.vencimiento}
              </div>

              {/* MONTO */}
              <div>
                $
                {calcularIngresoAlumno(alumno)}
              </div>

              {/* ACCIONES */}
              <div className="flex items-center gap-3">

                {estado !== "pagado" && (
                  <button
                    onClick={() => {
                      setSelectedAlumno(alumno);
                      setShowPagoModal(true);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Pagar
                  </button>
                )}

                <Eye
                  size={16}
                  className="cursor-pointer text-gray-500"
                  onClick={() => {
                    setSelectedAlumno(alumno);
                    setShowDetalleModal(true);
                  }}
                />

                <Pencil
                  size={16}
                  className="cursor-pointer text-blue-500"
                  onClick={() => {
                    setEditAlumno(alumno);
                    setShowEditarModal(true);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {
      showPagoAlumnoModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-[600px] rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Buscar Alumno
            </h2>

            <input
              placeholder="Buscar alumno..."
              value={busquedaAlumnoPago}
              onChange={(e) =>
                setBusquedaAlumnoPago(
                  e.target.value
                )
              }
              className="w-full border px-4 py-3 rounded-xl mb-4"
            />

            <div className="max-h-[400px] overflow-y-auto">

              {alumnosPagoFiltrados.map(
                (alumno) => (

                  <div
                    key={alumno.id}
                    className="border rounded-xl p-3 mb-2 flex justify-between items-center"
                  >
                    <div>

                      <p className="font-medium">
                        {alumno.nombre}
                      </p>

                      <p className="text-sm text-gray-500">
                        {alumno.actividades
                          ?.map(
                            (a) => a.nombre
                          )
                          .join(", ")}
                      </p>

                    </div>

                    <button
                      onClick={() => {

                        setSelectedAlumno(
                          alumno
                        );

                        setShowPagoAlumnoModal(
                          false
                        );

                        setShowPagoModal(
                          true
                        );

                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Seleccionar
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        </div>
      )
    }
    {
      showVentaModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-[450px] rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Registrar Venta
            </h2>

            <input
              placeholder="Descripción"
              value={descripcionVenta}
              onChange={(e) =>
                setDescripcionVenta(
                  e.target.value
                )
              }
              className="w-full border px-4 py-3 rounded-xl mb-4"
            />

            <input
              type="number"
              placeholder="Monto"
              value={montoVenta}
              onChange={(e) =>
                setMontoVenta(
                  Number(e.target.value)
                )
              }
              className="w-full border px-4 py-3 rounded-xl mb-4"
            />

            <select
              value={metodoPago}
              onChange={(e) =>
                setMetodoPago(
                  e.target.value
                )
              }
              className="w-full border px-4 py-3 rounded-xl mb-4"
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Mercado Pago</option>
              <option>Tarjeta</option>
            </select>

            <div className="flex justify-end gap-2">

              <button
                onClick={() =>
                  setShowVentaModal(false)
                }
                className="border px-4 py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleRegistrarVenta}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Registrar
              </button>

            </div>

          </div>

        </div>
      )
    }
    {
      showDetalleModal &&
      selectedAlumno && (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-[600px] rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Detalle del Alumno
            </h2>

            <p>
              <strong>Nombre:</strong>
              {" "}
              {selectedAlumno.nombre}
            </p>

            <p>
              <strong>Email:</strong>
              {" "}
              {selectedAlumno.email}
            </p>

            <p>
              <strong>Vencimiento:</strong>
              {" "}
              {selectedAlumno.vencimiento}
            </p>

            <div className="mt-4">

              <h3 className="font-semibold mb-2">
                Actividades
              </h3>

              {
                selectedAlumno.actividades.map(
                  (act) => (
                    <div
                      key={act.actividadId}
                      className="flex justify-between border-b py-2"
                    >
                      <span>{act.nombre}</span>
                      <span>${act.precio}</span>
                    </div>
                  )
                )
              }

            </div>

            <div className="mt-4 text-right font-bold">

              Total:
              {" "}
              $
              {
                calcularIngresoAlumno(
                  selectedAlumno
                )
              }

            </div>

            <div className="mt-6 text-right">

              <button
                onClick={() =>
                  setShowDetalleModal(false)
                }
                className="border px-4 py-2 rounded"
              >
                Cerrar
              </button>

            </div>

          </div>

        </div>

      )
    }
    {
      showDetalleModal &&
      selectedAlumno && (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-[600px] rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Detalle del Alumno
            </h2>

            <p>
              <strong>Nombre:</strong>
              {" "}
              {selectedAlumno.nombre}
            </p>

            <p>
              <strong>Email:</strong>
              {" "}
              {selectedAlumno.email}
            </p>

            <p>
              <strong>Vencimiento:</strong>
              {" "}
              {selectedAlumno.vencimiento}
            </p>

            <div className="mt-4">

              <h3 className="font-semibold mb-2">
                Actividades
              </h3>

              {
                selectedAlumno.actividades.map(
                  (act) => (
                    <div
                      key={act.actividadId}
                      className="flex justify-between border-b py-2"
                    >
                      <span>{act.nombre}</span>
                      <span>${act.precio}</span>
                    </div>
                  )
                )
              }

            </div>

            <div className="mt-4 text-right font-bold">

              Total:
              {" "}
              $
              {
                calcularIngresoAlumno(
                  selectedAlumno
                )
              }

            </div>

            <div className="mt-6 text-right">

              <button
                onClick={() =>
                  setShowDetalleModal(false)
                }
                className="border px-4 py-2 rounded"
              >
                Cerrar
              </button>

            </div>

          </div>

        </div>

      )
    }
    {
      showEditarModal &&
      editAlumno && (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-[600px] rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Editar Alumno
            </h2>

            <input
              value={editAlumno.nombre}
              onChange={(e) =>
                setEditAlumno({
                  ...editAlumno,
                  nombre:
                    e.target.value
                })
              }
              className="w-full border p-3 rounded mb-3"
            />

            <input
              value={editAlumno.email}
              onChange={(e) =>
                setEditAlumno({
                  ...editAlumno,
                  email:
                    e.target.value
                })
              }
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="date"
              value={editAlumno.vencimiento}
              onChange={(e) =>
                setEditAlumno({
                  ...editAlumno,
                  vencimiento:
                    e.target.value
                })
              }
              className="w-full border p-3 rounded mb-3"
            />
            {/* BOTONES */}

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() =>
                  setShowEditarModal(false)
                }
                className="border px-4 py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {

                  if (!editAlumno?.id)
                    return;

                  await actualizarAlumno(
                    editAlumno.id,
                    {
                      nombre:
                        editAlumno.nombre,
                      email:
                        editAlumno.email,
                      vencimiento:
                        editAlumno.vencimiento,
                    }
                  );

                  await cargarAlumnos();
                  setShowEditarModal(false);

                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>

            </div>

          </div>

        </div>

      )
    }    
    </MainLayout>
  );
}

// 🔥 KPI
function KPI({
  title,
  value,
  highlight,
}: any) {

  return (
    <div
      className={`p-5 rounded-xl shadow-sm border ${
        highlight
          ? "bg-green-600 text-white"
          : "bg-white"
      }`}
    >

      <p className="text-sm opacity-80">
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

// 🔥 ESTADO
function Estado({ estado }: any) {

  const styles: any = {
    pagado:
      "bg-green-100 text-green-700",

    vencido:
      "bg-red-100 text-red-600",

    pendiente:
      "bg-yellow-100 text-yellow-700",

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