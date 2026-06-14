import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { obtenerConfig } from "../services/configService";




export default function Header() {
  
  const [nombreEmpresa, setNombreEmpresa] = useState("...");

  useEffect(() => {
  const load = async () => {
    const data = await obtenerConfig();
    if (data && data.nombre) {
      setNombreEmpresa(data.nombre);
    }
  };
  load();
}, []);
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      
      {/* Buscador */}
      <div className="flex items-center w-1/3">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-6">
        
        {/* Notificaciones */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            3
          </span>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full font-semibold">
            A
          </div>

          <div className="text-sm">
            <p className="font-semibold">{nombreEmpresa}</p>
            <p className="text-gray-500 text-xs">Administrador</p>
          </div>
        </div>

      </div>
    </header>
  );
}