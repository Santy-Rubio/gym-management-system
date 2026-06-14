import MainLayout from "../layout/MainLayout";
import {
  User,
  Bell,
  Palette,
  Globe,
  CreditCard,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  guardarConfig,
  obtenerConfig,
} from "../services/configService";

export default function Configuracion() {

  const [config, setConfig] = useState({
    nombre: "",
    email: "",

    moneda: "ARS",
    idioma: "Español",
    tema: "Claro",

    cuotaBase: "",

    metodosPago: {
      efectivo: true,
      transferencia: true,
      tarjeta: true,
      mercadopago: false,
    },

    notificaciones: {
      pagos: true,
      alumnos: true,
      clases: true,
    },
  });

  useEffect(() => {
    const load = async () => {
      const data = await obtenerConfig();
      if (data) {
        setConfig({
          nombre: data.nombre || "",
          email: data.email || "",

          moneda: data.moneda || "ARS",
          idioma: data.idioma || "Español",
          tema: data.tema || "Claro",

          cuotaBase: data.cuotaBase || "",

          metodosPago: {
            efectivo: data.metodosPago?.efectivo ?? true,
            transferencia:
              data.metodosPago?.transferencia ?? true,
            tarjeta: data.metodosPago?.tarjeta ?? true,
            mercadopago:
              data.metodosPago?.mercadopago ?? false,
          },

          notificaciones: {
            pagos: data.notificaciones?.pagos ?? true,
            alumnos: data.notificaciones?.alumnos ?? true,
            clases: data.notificaciones?.clases ?? true,
          },
        });
      };
    };
    load();
  }, []);

  const handleSave = async () => {
    await guardarConfig(config);
    alert("Configuración guardada 🔥");
  };

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Configuración
        </h1>

        <p className="text-gray-500 text-sm">
          Ajustes generales del sistema
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* PERFIL */}
        <Card
          title="Perfil"
          description="Datos del gimnasio"
          icon={<User />}
        >
          <Input
            label="Nombre"
            value={config.nombre}
            onChange={(e: any) =>
              setConfig({
                ...config,
                nombre: e.target.value,
              })
            }
          />

          <Input
            label="Email"
            value={config.email}
            onChange={(e: any) =>
              setConfig({
                ...config,
                email: e.target.value,
              })
            }
          />

          <button
            onClick={handleSave}
            className="btn-primary mt-2"
          >
            Guardar
          </button>
        </Card>

        {/* PAGOS */}
        <Card
          title="Pagos"
          description="Configuración de cuotas"
          icon={<CreditCard />}
        >
          <Input
            label="Día de vencimiento (1-28)"
            type="number"
            value={config.diaVencimiento}
            onChange={(e: any) =>
              setConfig({
                ...config,
                diaVencimiento: Number(e.target.value),
              })
            }
          />

          <p className="text-sm text-gray-500 mt-2">
            Las cuotas vencerán ese día cada mes
          </p>

          <div className="mt-4 space-y-2">
            <Toggle
              label="Efectivo"
              checked={config.metodosPago.efectivo}
              onChange={() =>
                setConfig({
                  ...config,
                  metodosPago: {
                    ...config.metodosPago,
                    efectivo:
                      !config.metodosPago.efectivo,
                  },
                })
              }
            />

            <Toggle
              label="Transferencia"
              checked={config.metodosPago.transferencia}
              onChange={() =>
                setConfig({
                  ...config,
                  metodosPago: {
                    ...config.metodosPago,
                    transferencia:
                      !config.metodosPago
                        .transferencia,
                  },
                })
              }
            />

            <Toggle
              label="Tarjeta"
              checked={config.metodosPago.tarjeta}
              onChange={() =>
                setConfig({
                  ...config,
                  metodosPago: {
                    ...config.metodosPago,
                    tarjeta:
                      !config.metodosPago.tarjeta,
                  },
                })
              }
            />

            <Toggle
              label="Mercado Pago"
              checked={config.metodosPago.mercadoPago}
              onChange={() =>
                setConfig({
                  ...config,
                  metodosPago: {
                    ...config.metodosPago,
                    mercadoPago:
                      !config.metodosPago
                        .mercadoPago,
                  },
                })
              }
            />
          </div>

          <button
            onClick={handleSave}
            className="btn-primary mt-4"
          >
            Guardar
          </button>
        </Card>

        {/* SISTEMA */}
        <Card
          title="Sistema"
          description="Configuración general"
          icon={<Globe />}
        >
          <select
            value={config.moneda}
            onChange={(e) =>
              setConfig({
                ...config,
                moneda: e.target.value,
              })
            }
            className="input"
          >
            <option value="ARS">
              Peso Argentino (ARS)
            </option>
            <option value="USD">
              Dólar (USD)
            </option>
          </select>

          <button
            onClick={handleSave}
            className="btn-primary mt-4"
          >
            Guardar
          </button>
        </Card>

        {/* NOTIFICACIONES */}
        <Card
          title="Notificaciones"
          description="Alertas del sistema"
          icon={<Bell />}
        >
          <Toggle label="Pagos vencidos" />
          <Toggle label="Nuevos alumnos" />
          <Toggle label="Clases del día" />
        </Card>

        {/* APARIENCIA */}
        <Card
          title="Apariencia"
          description="Personalización"
          icon={<Palette />}
        >
          <select className="input">
            <option>Claro</option>
            <option>Oscuro</option>
          </select>
        </Card>

      </div>
    </MainLayout>
  );
}

/* COMPONENTES */

function Card({ title, description, icon, children }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold">
            {title}
          </h2>

          <p className="text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  value = "",
  type = "text",
  onChange,
}: any) {
  return (
    <div>
      <label className="text-sm text-gray-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded-lg mt-1"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5"
      />
    </div>
  );
}