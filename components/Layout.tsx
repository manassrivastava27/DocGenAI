
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { LogOut, FileText, LayoutDashboard, User as UserIcon, Bell, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/login');
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return <div className="min-h-screen bg-slate-50 font-sans text-slate-900">{children}</div>;
  }

  const isEditor = location.pathname.includes('/project/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand Section */}
            <div className="flex items-center flex-shrink-0 pl-2">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:brightness-110 transition-all duration-300 ease-out">
                  <FileText className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:opacity-80 transition-opacity">
                    DocGen<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
              
              {/* Navigation */}
              <nav className="flex items-center">
                <Link 
                  to="/dashboard" 
                  className={`
                    group flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${location.pathname === '/dashboard' 
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm'
                    }
                  `}
                >
                  <LayoutDashboard className={`w-4 h-4 transition-transform group-hover:scale-110 ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>Dashboard</span>
                </Link>
              </nav>

              {/* Notification Icon */}
              <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors group">
                <Bell className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

              {/* User Profile Cluster */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-all duration-200 group focus:outline-none"
                >
                  <div className="hidden md:flex flex-col items-end text-right">
                     <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{user.name}</span>
                  </div>

                  {/* PRO Badge */}
                   <span className="hidden md:flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-blue-200">
                     PRO
                   </span>
                  
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                     <UserIcon className="w-5 h-5" />
                  </div>
                   
                   <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <UserIcon className="w-4 h-4 text-slate-400" /> My Account
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <CreditCard className="w-4 h-4 text-slate-400" /> Billing
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <Settings className="w-4 h-4 text-slate-400" /> Settings
                      </button>
                    </div>
                    
                    <div className="border-t border-slate-50 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={`flex-1 ${!isEditor ? 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : 'h-[calc(100vh-64px)]'}`}>
        {children}
      </main>
    </div>
  );
};
