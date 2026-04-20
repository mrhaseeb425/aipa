import {
  Briefcase,
  ClipboardList,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    { name: "Users", icon: <Users size={20} />, path: "/users" },
    { name: "Categories", icon: <Layers size={20} />, path: "/categories" },
    { name: "Questions", icon: <HelpCircle size={20} />, path: "/questions" },
    {
      name: "Assessments",
      icon: <ClipboardList size={20} />,
      path: "/assessments",
    },
    {
      name: "Businesses",
      icon: <Briefcase size={20} />,
      path: "/businesses",
    },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 text-xl font-bold text-white border-b border-slate-800 tracking-tight">
        AIPE ADMIN
      </div>

      <nav className="flex-1 px-4 mt-6 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 p-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
