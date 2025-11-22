
import React, { useState, useEffect } from 'react';
import { User, UserRole, Notification, GalleryImage, Subscriber, NewsletterCampaign, Announcement, ChurchLocation, ChatMessage, Department } from './types';
import { MOCK_NOTIFICATIONS } from './constants';
import { db } from './services/database';
import { client } from './services/client';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import Community from './components/Community';
import AdminPanel from './components/AdminPanel';
import Departments from './components/Departments';
import Locations from './components/Locations';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import { InfoPage, SupportPage, Newsletter } from './components/InfoPages';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>(db.departments.getAll());
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>(db.gallery.getAll());
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [locations, setLocations] = useState<ChurchLocation[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(db.subscribers.getAll());
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>(db.campaigns.getAll());
  const [chats, setChats] = useState<ChatMessage[]>(db.chats.getAll());

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Load Data Effect (Hybrid: Local or Remote)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, annData, locData] = await Promise.all([
        client.users.getAll(),
        client.announcements.getAll(),
        client.locations.getAll()
      ]);
      
      setAllUsers(usersData);
      setAnnouncements(annData);
      setLocations(locData);

      // Restore Session
      const storedUser = db.session.get();
      if (storedUser) {
        // Verify against the fresh data source (Local or Remote)
        const sourceUser = usersData.find(u => u.id === storedUser.id);
        if (sourceUser && (sourceUser.status === 'active' || sourceUser.status === 'pending')) {
          // Only auto-login if active, or if pending (Guest Mode allowed temporarily or denied in Login component)
          if (sourceUser.status === 'active') {
             setCurrentUser(sourceUser);
          } else {
             // If pending, we force them to login screen to see status message
             db.session.set(null);
             setCurrentUser(null);
          }
        } else {
          db.session.set(null);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error("Failed to load system data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Persistence Effects (Only for LocalStorage parts that aren't fully hybrid yet)
  useEffect(() => { db.departments.save(departments); }, [departments]);
  useEffect(() => { db.gallery.save(galleryItems); }, [galleryItems]);
  useEffect(() => { db.subscribers.save(subscribers); }, [subscribers]);
  useEffect(() => { db.campaigns.save(campaigns); }, [campaigns]);
  useEffect(() => { db.chats.save(chats); }, [chats]);

  // Handlers
  const handleLogin = (user: User) => {
    // User object comes from the Login component which now uses client.users.login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setCurrentUser(updatedUser);
    db.session.set(updatedUser);

    // Auto-redirect Admins to the Admin Panel
    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.LOCAL_ADMIN].includes(user.role);
    if (isAdmin) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    db.session.set(null);
    setCurrentPage('dashboard');
  };

  const handleRegister = async (newUser: User) => {
    try {
      await client.users.register(newUser);
      // Refresh data
      const users = await client.users.getAll();
      setAllUsers(users);
      // We do NOT auto-login here anymore. Login component handles success message.
    } catch (e: any) {
      throw e; // Pass error back to Login component
    }
  };

  const handleApproveUser = async (userId: string, assignedRole: UserRole, district?: string) => {
    try {
      await client.users.approve(userId, assignedRole, district);
      
      // Refresh local state
      const users = await client.users.getAll();
      setAllUsers(users);

      const newNotif: Notification = {
        id: Date.now().toString(),
        title: "Account Approved",
        message: "User account has been approved.",
        date: new Date().toISOString(),
        read: false,
        type: 'info'
      };
      setNotifications(prev => [newNotif, ...prev]);
      alert("User approved successfully. They can now log in.");
    } catch (e: any) {
      alert("Failed to approve user: " + e.message);
    }
  };
  
  const handleRejectUser = async (userId: string) => {
    try {
      await client.users.reject(userId);
      const users = await client.users.getAll();
      setAllUsers(users);
      alert("User rejected.");
    } catch (e: any) {
      alert("Failed to reject user: " + e.message);
    }
  };

  // CRUD Handlers
  const handleAddUser = async (newUser: User) => {
     try {
       await client.users.register(newUser);
       await client.users.approve(newUser.id, newUser.role, newUser.district);
       const users = await client.users.getAll();
       setAllUsers(users);
     } catch (e: any) {
       alert("Error adding user: " + e.message);
     }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await client.users.delete(userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      alert("Error deleting user: " + e.message);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!currentUser) return;
    // Only Local implementation for bulk delete in this demo to avoid accidental server wipes
    const remainingUsers = allUsers.filter(u => 
      u.id === currentUser.id || 
      u.role === UserRole.SUPER_ADMIN
    );
    setAllUsers(remainingUsers);
    db.users.save(remainingUsers); 
    alert("Bulk delete is currently limited to Local Storage cleanup for safety.");
  };

  const handleUpdateUser = (updatedUser: User) => {
    // Sync update for profile changes (usually strictly local unless we add update endpoint)
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      db.session.set(updatedUser);
    }
    // If local, save
    if (!client.getConfig().isRemote) {
       db.users.save(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  // Feature CRUDs
  const handleAddAnnouncement = async (ann: Announcement) => {
    await client.announcements.create(ann);
    setAnnouncements(prev => [ann, ...prev]);
  };
  
  const handleUpdateAnnouncement = (updated: Announcement) => setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
  
  const handleDeleteAnnouncement = async (id: string) => {
    await client.announcements.delete(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };
  const handleClearAnnouncements = () => setAnnouncements([]);

  const handleAddLocation = async (loc: ChurchLocation) => {
    await client.locations.create(loc);
    setLocations(prev => [...prev, loc]);
  };
  const handleDeleteLocation = (id: string) => setLocations(prev => prev.filter(l => l.id !== id));
  const handleClearLocations = () => setLocations([]);

  const handleSaveGalleryItem = (item: GalleryImage) => setGalleryItems(prev => {
    const exists = prev.find(i => i.id === item.id);
    return exists ? prev.map(i => i.id === item.id ? item : i) : [...prev, item];
  });
  const handleDeleteGalleryItem = (id: string) => setGalleryItems(prev => prev.filter(i => i.id !== id));
  const handleClearGallery = () => setGalleryItems([]);

  const handleAddChat = (msg: ChatMessage) => setChats(prev => [...prev, msg]);
  const handleDeleteChat = (id: string) => setChats(prev => prev.filter(c => c.id !== id));
  const handleClearChats = () => setChats([]);

  const handleSubscribe = (email: string) => {
    if (!subscribers.some(s => s.email === email)) {
      setSubscribers(prev => [{ id: Date.now().toString(), email, dateJoined: new Date().toISOString().split('T')[0] }, ...prev]);
    }
  };
  const handleDeleteSubscriber = (id: string) => setSubscribers(prev => prev.filter(s => s.id !== id));
  const handleClearSubscribers = () => setSubscribers([]);

  const handleSendNewsletter = (subject: string, content: string) => {
    setCampaigns(prev => [{ id: Date.now().toString(), subject, content, sentDate: new Date().toISOString().split('T')[0], recipientCount: subscribers.length, status: 'Sent' }, ...prev]);
  };
  const handleDeleteCampaign = (id: string) => setCampaigns(prev => prev.filter(c => c.id !== id));
  const handleClearCampaigns = () => setCampaigns([]);

  const markNotificationRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-700">Loading System Data...</h2>
        <p className="text-sm text-slate-500">Connecting to {client.getConfig().isRemote ? 'Remote Server' : 'Local Database'}</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={allUsers} onRegister={handleRegister} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard users={allUsers} departments={departments} />;
      case 'directory': return <Directory users={allUsers} currentUser={currentUser} />;
      case 'community': return <Community currentUser={currentUser} messages={chats} onSendMessage={handleAddChat} />;
      case 'departments': return <Departments 
        user={currentUser} 
        users={allUsers}
        departments={departments}
        announcements={announcements} 
        onAddAnnouncement={handleAddAnnouncement} 
        onUpdateAnnouncement={handleUpdateAnnouncement} 
        onDeleteAnnouncement={handleDeleteAnnouncement} 
        chats={chats}
        onAddChat={handleAddChat}
      />;
      case 'locations': return <Locations locations={locations} />;
      case 'gallery': return <Gallery user={currentUser} items={galleryItems} onSave={handleSaveGalleryItem} onDelete={handleDeleteGalleryItem} />;
      case 'profile': return <Profile user={currentUser} onUpdate={handleUpdateUser} onNavigate={setCurrentPage} />;
      case 'info': return <InfoPage />;
      case 'support': return <SupportPage />;
      case 'newsletter': return <Newsletter onSubscribe={handleSubscribe} />;
      
      case 'admin': 
        if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.DISTRICT_ADMIN || currentUser.role === UserRole.LOCAL_ADMIN) {
          return (
            <AdminPanel 
              currentUser={currentUser}
              users={allUsers} 
              onAddUser={handleAddUser} 
              onDeleteUser={handleDeleteUser} 
              onDeleteAllUsers={handleDeleteAllUsers}
              onUpdateUser={handleUpdateUser}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              subscribers={subscribers}
              campaigns={campaigns}
              onSendNewsletter={handleSendNewsletter}
              locations={locations}
              onAddLocation={handleAddLocation}
              onDeleteLocation={handleDeleteLocation}
              announcements={announcements}
              gallery={galleryItems}
              chats={chats}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onDeleteGalleryItem={handleDeleteGalleryItem}
              onDeleteSubscriber={handleDeleteSubscriber}
              onDeleteCampaign={handleDeleteCampaign}
              onDeleteChat={handleDeleteChat}
              onClearAnnouncements={handleClearAnnouncements}
              onClearGallery={handleClearGallery}
              onClearChats={handleClearChats}
              onClearLocations={handleClearLocations}
              onClearSubscribers={handleClearSubscribers}
              onClearCampaigns={handleClearCampaigns}
            />
          );
        }
        return <Dashboard users={allUsers} departments={departments} />;
      default: return <Dashboard users={allUsers} departments={departments} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      notifications={notifications}
      onMarkRead={markNotificationRead}
      onMarkAllRead={handleMarkAllRead}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
