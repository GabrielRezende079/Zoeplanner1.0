import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  Leaf, 
  LayoutDashboard, 
  ArrowRightLeft, 
  TrendingDown,
  Heart, 
  Target, 
  BarChart3, 
  Building2,
  Menu, 
  X, 
  LogOut, 
  User
} from 'lucide-react';
import { useAuth } from '../stores/authStore';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const navLinks = [
    { to: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { to: "/transactions", icon: <ArrowRightLeft className="h-5 w-5" />, label: "Transações" },
    { to: "/expenses", icon: <TrendingDown className="h-5 w-5" />, label: "Despesas" },
    { to: "/banks", icon: <Building2 className="h-5 w-5" />, label: "Bancos" },
    { to: "/tithing", icon: <Heart className="h-5 w-5" />, label: "Dízimos e Ofertas" },
    { to: "/goals", icon: <Target className="h-5 w-5" />, label: "Metas" },
    { to: "/reports", icon: <BarChart3 className="h-5 w-5" />, label: "Relatórios" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for mobile - overlay */}
      <div 
        className={`mobile-overlay lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />
      
      {/* Sidebar */}
      <aside 
        className={`sidebar fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header">
            <Link to="/dashboard" className="flex items-center">
              <Leaf className="h-6 w-6 text-olive-600 mr-2" />
              <span className="text-xl font-montserrat font-bold text-gray-900">ZoePlanner</span>
            </Link>
            <button 
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 lg:hidden transition-colors"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 py-6 px-4 overflow-y-auto bg-white">
            <ul className="space-y-1">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => 
                      `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {link.icon}
                    <span className="ml-3 font-medium">{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <div className="flex items-center mb-4">
              <div className="h-9 w-9 rounded-full bg-olive-100 flex items-center justify-center text-olive-600 border border-olive-200 shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-600">Plano Pessoal</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 hover:shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="main-header z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <button 
              className="text-gray-600 hover:text-gray-900 lg:hidden transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="header-banner">
              "Deus te confia recursos. O ZoePlanner te ajuda a administrá-los com excelência."
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;