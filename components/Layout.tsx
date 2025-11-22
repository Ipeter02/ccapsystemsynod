
import React, { useState } from 'react';
import { User, UserRole, Notification } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Building,
  Image as ImageIcon,
  Info,
  FileText,
  User as UserIcon,
  CheckCheck,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  currentPage, 
  onNavigate, 
  children, 
  notifications, 
  onMarkRead,
  onMarkAllRead 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isPending = user.status === 'pending';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'newsletter', label: 'Newsletter', icon: FileText },
    { id: 'info', label: 'About', icon: Info },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  // Ensure Local Admins also see the panel link
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DISTRICT_ADMIN || user.role === UserRole.LOCAL_ADMIN) {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
          <div className="p-6 border-b border-indigo-800 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
               <div className="bg-indigo-500 p-1.5 rounded shadow-lg">
                 <span className="text-xl font-bold">✝</span>
               </div>
               <span className="text-lg font-bold tracking-wide">CCAP Synod</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-indigo-300 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${currentPage === item.id 
                    ? 'bg-indigo-700 text-white shadow-md' 
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'}
                `}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-indigo-800 shrink-0">
            <div 
              onClick={() => {
                onNavigate('profile');
                setIsSidebarOpen(false);
              }}
              className="flex items-center space-x-3 mb-4 px-4 cursor-pointer hover:bg-indigo-800 p-2 rounded-lg transition-colors group"
              title="Edit Profile"
            >
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-indigo-500 group-hover:border-indigo-300 transition-colors object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-indigo-100">{user.name}</p>
                <p className="text-xs text-indigo-300 truncate capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
              </div>
              <UserIcon size={16} className="text-indigo-400 group-hover:text-white" />
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-200 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Guest/Pending Banner */}
        {isPending && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-center text-sm font-medium text-amber-800 z-20 animate-fade-in">
             <AlertOctagon className="w-4 h-4 mr-2" />
             <span>Guest Mode: Your account is pending approval. Sensitive information is hidden.</span>
          </div>
        )}

        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700 mr-4"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-slate-800 capitalize hidden sm:block">
                {currentPage === 'profile' ? 'My Profile' : navItems.find(i => i.id === currentPage)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{unreadCount} unread</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={onMarkAllRead}
                            className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              onMarkRead(notif.id);
                              setIsNotifOpen(false);
                            }}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-indigo-50/50' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-medium ${!notif.read ? 'text-indigo-700' : 'text-slate-700'}`}>{notif.title}</h4>
                              <span className="text--[10px] text-slate-400">{new Date(notif.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
