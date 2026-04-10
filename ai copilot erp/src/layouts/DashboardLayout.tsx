import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Quote, 
  Package, 
  ShoppingCart, 
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vendors', path: '/vendors', icon: Users },
    { name: 'RFQs', path: '/rfqs', icon: FileText },
    { name: 'Quotes', path: '/quotes', icon: Quote },
    { name: 'Purchase Orders', path: '/pos', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Finance', path: '/finance', icon: DollarSign },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-[#F5F5F5] font-sans text-[#141414]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141414] text-white flex flex-col border-r border-[#141414]">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <ShoppingCart className="text-[#141414] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">ProcureMind</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-white text-[#141414]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-[#141414]" : "text-white/40 group-hover:text-white")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5 text-white/40" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#141414]/10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-[#F5F5F5] px-4 py-2 rounded-full w-96">
            <Search className="w-4 h-4 text-[#141414]/40" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#141414]/40"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-[#F5F5F5] rounded-full transition-all">
              <Bell className="w-5 h-5 text-[#141414]/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-[#141414]/10">
              <div className="text-right">
                <p className="text-sm font-bold">{user.displayName || 'User'}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-[#141414] rounded-full flex items-center justify-center text-white overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
