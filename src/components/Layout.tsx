
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart2, Package, Upload } from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/", icon: BarChart2 },
  { name: "Stock", path: "/stock", icon: Package },
  { name: "Upload", path: "/upload", icon: Upload },
];

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Stock Manager</h1>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map(({ name, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === path
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="page-transition">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
