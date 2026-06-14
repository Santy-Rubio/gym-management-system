import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Dumbbell,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Alumnos", path: "/alumnos", icon: Users },
  { name: "Profesores", path: "/profesores", icon: UserCog },
  { name: "Actividades", path: "/Actividades", icon: Dumbbell },
  { name: "Horarios", path: "/horarios", icon: Calendar },
  { name: "Cuotas", path: "/cuotas", icon: CreditCard },
  { name: "Reportes", path: "/reportes", icon: BarChart3 },
  { name: "Configuración", path: "/configuracion", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#0f172a] text-white flex flex-col">
      
      {/* Logo */}
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        GymPro
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © GymPro
      </div>
    </aside>
  );
}