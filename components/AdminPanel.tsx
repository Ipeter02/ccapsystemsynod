
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, Subscriber, NewsletterCampaign, ChurchLocation, Announcement, GalleryImage, ChatMessage } from '../types';
import { DISTRICTS, DEPARTMENTS } from '../constants';
import { db } from '../services/database';
import { client } from '../services/client';
import { Plus, Trash2, Shield, Lock, Key, Save, AlertCircle, Mail, Send, Users, Calendar, Activity, Edit, X, UserCheck, UserX, AlertTriangle, MapPin, Database, Download, Upload, RefreshCw, FileText, Clock, AlertOctagon, HelpCircle, Server, Code, Terminal, Copy, Check, Globe, Layers, ExternalLink, Wifi, WifiOff } from 'lucide-react';

interface AdminPanelProps {
  currentUser?: User;
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onDeleteAllUsers?: () => void; 
  onUpdateUser?: (user: User) => void;
  onApproveUser?: (userId: string, role: UserRole, district?: string) => void;
  onRejectUser?: (userId: string) => void;
  subscribers?: Subscriber[];
  campaigns?: NewsletterCampaign[];
  onSendNewsletter?: (subject: string, content: string) => void;
  locations?: ChurchLocation[];
  onAddLocation?: (location: ChurchLocation) => void;
  onDeleteLocation?: (id: string) => void;
  announcements?: Announcement[];
  gallery?: GalleryImage[];
  chats?: ChatMessage[];
  onDeleteAnnouncement?: (id: string) => void;
  onDeleteGalleryItem?: (id: string) => void;
  onDeleteSubscriber?: (id: string) => void;
  onDeleteCampaign?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onClearAnnouncements?: () => void;
  onClearGallery?: () => void;
  onClearChats?: () => void;
  onClearLocations?: () => void;
  onClearSubscribers?: () => void;
  onClearCampaigns?: () => void;
}

// Backend Code Templates
const BACKEND_CODE = {
  deploymentSteps: `1. CREATE SERVER
   - Use a free service like Render.com or Railway.app.
   - Deploy a Node.js Web Service.
   - Add the 'server.js' code (right) to your repo.
   - Add 'package.json' to your repo.

2. SETUP DATABASE
   - In your hosting (e.g. Render), create a PostgreSQL or MySQL database.
   - Or use a separate provider like Supabase or PlanetScale.
   - Run the 'schema.sql' queries to create tables.

3. LINK FRONTEND
   - Copy your new Server URL (e.g., https://my-api.onrender.com/api).
   - Paste it in the "Connection Settings" box below.
   - Click "Connect & Reload".
   - Now Device A and Device B will share data!`,
   
  packageJson: `{
  "name": "ccap-synod-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.5"
  }
}`,
  schemaSql: `CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'PASTOR',
  status VARCHAR(20) DEFAULT 'pending',
  district VARCHAR(100),
  location VARCHAR(100),
  phone VARCHAR(50),
  avatar VARCHAR(255),
  position VARCHAR(100),
  department VARCHAR(100),
  rejection_date DATETIME NULL,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  author VARCHAR(255),
  date DATE,
  department_id VARCHAR(50)
);

CREATE TABLE locations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  district VARCHAR(100),
  address TEXT,
  admin_id VARCHAR(36)
);`,
  serverJs: `const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// DB Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// --- USERS ---
app.get('/api/users', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users');
  res.json(rows);
});

app.post('/api/register', async (req, res) => {
  const { id, name, email, password, phone, role } = req.body;
  await pool.query(
    'INSERT INTO users (id, name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, password, phone, role || 'PASTOR', 'pending']
  );
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0 || rows[0].password !== password) return res.status(401).json({ error: 'Invalid' });
  res.json({ user: rows[0] });
});

app.put('/api/users/:id/approve', async (req, res) => {
  const { role, district } = req.body;
  await pool.query('UPDATE users SET status="active", role=?, district=? WHERE id=?', [role, district, req.params.id]);
  res.json({ success: true });
});

app.put('/api/users/:id/reject', async (req, res) => {
  await pool.query('UPDATE users SET status="rejected", rejection_date=NOW() WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

app.delete('/api/users/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// --- ANNOUNCEMENTS ---
app.get('/api/announcements', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM announcements ORDER BY date DESC');
  res.json(rows);
});

app.post('/api/announcements', async (req, res) => {
  const { id, title, message, author, date, departmentId } = req.body;
  await pool.query('INSERT INTO announcements VALUES (?,?,?,?,?,?)', [id, title, message, author, date, departmentId]);
  res.json({ success: true });
});

// --- LOCATIONS ---
app.get('/api/locations', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM locations');
  res.json(rows);
});

app.post('/api/locations', async (req, res) => {
  const { id, name, district, address, adminId } = req.body;
  await pool.query('INSERT INTO locations VALUES (?,?,?,?,?)', [id, name, district, address, adminId]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on port ' + PORT));`
};

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser,
  users, 
  onAddUser, 
  onDeleteUser, 
  onDeleteAllUsers,
  onUpdateUser,
  onApproveUser,
  onRejectUser,
  subscribers = [], 
  campaigns = [], 
  onSendNewsletter,
  locations = [],
  onAddLocation,
  onDeleteLocation,
  announcements,
  gallery,
  chats,
  onDeleteAnnouncement,
  onDeleteGalleryItem,
  onDeleteSubscriber,
  onDeleteCampaign,
  onDeleteChat,
  onClearAnnouncements,
  onClearGallery,
  onClearChats,
  onClearLocations,
  onClearSubscribers,
  onClearCampaigns
}) => {
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'newsletter' | 'pending' | 'rejected' | 'locations' | 'database' | 'server'>('users');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Server Settings
  const [apiUrl, setApiUrl] = useState(client.getConfig().apiUrl || '');
  
  // User Management State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: ''
  });
  
  // Rejection Confirmation
  const [rejectConfirm, setRejectConfirm] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: ''
  });

  // Location Management State
  const [deleteLocationConfirm, setDeleteLocationConfirm] = useState<{ isOpen: boolean; locationId: string | null; locationName: string }>({
    isOpen: false,
    locationId: null,
    locationName: ''
  });
  
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  // States for Bulk Operations in Explorer
  const [bulkDeleteState, setBulkDeleteState] = useState<{ isOpen: boolean; count: number }>({ isOpen: false, count: 0 });
  const [clearViewState, setClearViewState] = useState<{ isOpen: boolean; view: string; count: number }>({ isOpen: false, view: '', count: 0 });

  // State for Edit User Modal
  const [editUserState, setEditUserState] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false, 
    user: null
  });
  
  const [resetPasswordState, setResetPasswordState] = useState<{ isOpen: boolean; user: User | null; newPassword: string }>({
    isOpen: false,
    user: null,
    newPassword: ''
  });
  
  const [approvalState, setApprovalState] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [approvalForm, setApprovalForm] = useState<{ role: UserRole; district: string }>({ role: UserRole.PASTOR, district: '' });

  const [newUser, setNewUser] = useState({
    name: '', email: '', phone: '', role: UserRole.PASTOR, district: '', department: '', position: '', meetingTime: '', password: 'password123'
  });

  const [newLocation, setNewLocation] = useState({ name: '', district: '', address: '', adminId: '' });
  const [newsletterForm, setNewsletterForm] = useState({ subject: '', content: '' });
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inspectorView, setInspectorView] = useState('users');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Metrics
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === 'pending');
  const rejectedUsers = users.filter(u => u.status === 'rejected');
  const activeUsers = users.filter(u => u.status === 'active');
  
  const totalAdmins = activeUsers.filter(u => 
    u.role === UserRole.SUPER_ADMIN || 
    u.role === UserRole.DISTRICT_ADMIN || 
    u.role === UserRole.LOCAL_ADMIN
  ).length;
  
  const activeRecently = users.filter(u => u.lastLogin && (new Date().getTime() - new Date(u.lastLogin).getTime() < 24 * 60 * 60 * 1000)).length;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setVerified(true);
    } else {
      setError('Invalid security code');
    }
  };
  
  const handleSaveApiUrl = () => {
    if (!apiUrl) {
      if (confirm('Disable Remote Mode and revert to Local Storage?')) {
        client.setApiUrl(null);
      }
    } else {
      if (apiUrl.startsWith('http')) {
        client.setApiUrl(apiUrl);
      } else {
        alert("Invalid URL. Must start with http:// or https://");
      }
    }
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      phone: newUser.phone.trim(),
      department: newUser.department || undefined,
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`
    };
    
    onAddUser(user);
    setNewUser({ name: '', email: '', phone: '', role: UserRole.PASTOR, district: '', department: '', position: '', meetingTime: '', password: 'password123' });
    alert("User added and approved successfully.");
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddLocation) {
      onAddLocation({
        id: Date.now().toString(),
        name: newLocation.name,
        district: newLocation.district,
        address: newLocation.address,
        adminId: newLocation.adminId || 'system'
      });
      setNewLocation({ name: '', district: '', address: '', adminId: '' });
    }
  };

  const initiateDelete = (user: User) => {
    setDeleteConfirm({ isOpen: true, userId: user.id, userName: user.name });
  };

  const confirmDelete = () => {
    if (deleteConfirm.userId) {
      onDeleteUser(deleteConfirm.userId);
      setDeleteConfirm({ isOpen: false, userId: null, userName: '' });
    }
  };

  // Handle rejection process
  const initiateReject = (user: User) => {
    setRejectConfirm({ isOpen: true, userId: user.id, userName: user.name });
  };

  const confirmReject = () => {
    if (rejectConfirm.userId && onRejectUser) {
      onRejectUser(rejectConfirm.userId);
      setRejectConfirm({ isOpen: false, userId: null, userName: '' });
    }
  };

  const confirmDeleteAll = () => {
    if (onDeleteAllUsers) {
      onDeleteAllUsers();
      setDeleteAllConfirm(false);
      alert("All non-admin users have been removed from the system.");
    }
  };

  const initiateLocationDelete = (location: ChurchLocation) => {
    setDeleteLocationConfirm({ isOpen: true, locationId: location.id, locationName: location.name });
  };

  const confirmLocationDelete = () => {
    if (deleteLocationConfirm.locationId && onDeleteLocation) {
      onDeleteLocation(deleteLocationConfirm.locationId);
      setDeleteLocationConfirm({ isOpen: false, locationId: null, locationName: '' });
    }
  };

  const initiateEditUser = (user: User) => {
    setEditUserState({ isOpen: true, user: { ...user } });
  };

  const initiateResetPassword = (user: User) => {
    setResetPasswordState({ isOpen: true, user: { ...user }, newPassword: '' });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordState.user && onUpdateUser && resetPasswordState.newPassword) {
      const updatedUser = { ...resetPasswordState.user, password: resetPasswordState.newPassword };
      onUpdateUser(updatedUser);
      setResetPasswordState({ isOpen: false, user: null, newPassword: '' });
      alert(`Password for ${updatedUser.name} has been reset.`);
    }
  };

  const handleEditUserChange = (field: keyof User, value: any) => {
    if (editUserState.user) {
      setEditUserState(prev => ({
        ...prev,
        user: { ...prev.user!, [field]: value }
      }));
    }
  };

  const handleUpdateUserSubmit = () => {
    if (editUserState.user && onUpdateUser) {
      onUpdateUser(editUserState.user);
      setEditUserState({ isOpen: false, user: null });
    }
  };

  const initiateApproval = (user: User) => {
    setApprovalForm({ role: UserRole.PASTOR, district: '' });
    setApprovalState({ isOpen: true, user });
  };

  const handleApproveSubmit = () => {
    if (approvalState.user && onApproveUser) {
      onApproveUser(approvalState.user.id, approvalForm.role, approvalForm.district);
      setApprovalState({ isOpen: false, user: null });
    }
  };

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSendNewsletter) {
      setIsSending(true);
      setTimeout(() => {
        onSendNewsletter(newsletterForm.subject, newsletterForm.content);
        setNewsletterForm({ subject: '', content: '' });
        setIsSending(false);
        alert(`Newsletter sent successfully to ${subscribers.length} subscribers.`);
      }, 1500);
    }
  };

  // Database Operations
  const handleExportDB = () => {
    const json = db.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ccap_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = db.import(content);
      if (success) {
        alert("Database imported successfully. The system will now reload.");
        window.location.reload();
      } else {
        alert("Failed to import database. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetDB = () => {
    if (window.confirm("Are you sure you want to factory reset the system? All data will be lost.")) {
      db.reset();
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };
  
  useEffect(() => {
    setSelectedIds(new Set());
  }, [inspectorView]);

  // Helper to calculate hours remaining for rejected users
  const getRemainingHours = (rejectionDate?: string) => {
    if (!rejectionDate) return 0;
    const rejectedTime = new Date(rejectionDate).getTime();
    const now = new Date().getTime();
    const diffInHours = (now - rejectedTime) / (1000 * 60 * 60);
    return Math.max(0, 72 - diffInHours);
  };

  const getInspectorData = () => {
      switch(inspectorView) {
          case 'users': return users;
          case 'announcements': return announcements || [];
          case 'chats': return chats || [];
          case 'gallery': return gallery || [];
          case 'locations': return locations;
          case 'subscribers': return subscribers;
          case 'campaigns': return campaigns;
          default: return [];
      }
  };
  
  const inspectorData = getInspectorData();
  const inspectorOptions = [
    {id: 'users', label: 'Users'},
    {id: 'locations', label: 'Locations'},
    {id: 'announcements', label: 'Announcements'},
    {id: 'chats', label: 'Community Chats'},
    {id: 'gallery', label: 'Gallery Items'},
    {id: 'subscribers', label: 'Subscribers'},
    {id: 'campaigns', label: 'Campaigns'}
  ];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(new Set(inspectorData.map((item: any) => item.id)));
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSelectRow = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleBulkDeleteClick = () => {
      if (selectedIds.size === 0) return;
      setBulkDeleteState({ isOpen: true, count: selectedIds.size });
  };

  const confirmBulkDelete = () => {
      Array.from(selectedIds).forEach(id => {
          switch(inspectorView) {
              case 'users': onDeleteUser(id); break;
              case 'announcements': onDeleteAnnouncement?.(id); break;
              case 'chats': onDeleteChat?.(id); break;
              case 'gallery': onDeleteGalleryItem?.(id); break;
              case 'locations': onDeleteLocation?.(id); break;
              case 'subscribers': onDeleteSubscriber?.(id); break;
              case 'campaigns': onDeleteCampaign?.(id); break;
          }
      });
      setSelectedIds(new Set());
      setBulkDeleteState({ isOpen: false, count: 0 });
  };

  const handleClearViewClick = () => {
    if (inspectorData.length === 0) return;
    if (inspectorView === 'users') {
        setDeleteAllConfirm(true);
        return;
    }
    setClearViewState({ isOpen: true, view: inspectorView, count: inspectorData.length });
  };

  const confirmClearView = () => {
     switch(clearViewState.view) {
         case 'announcements': onClearAnnouncements?.(); break;
         case 'chats': onClearChats?.(); break;
         case 'gallery': onClearGallery?.(); break;
         case 'locations': onClearLocations?.(); break;
         case 'subscribers': onClearSubscribers?.(); break;
         case 'campaigns': onClearCampaigns?.(); break;
     }
     setClearViewState({ isOpen: false, view: '', count: 0 });
  };

  const canEditRoles = currentUser?.role === UserRole.SUPER_ADMIN;
  const isRemote = client.getConfig().isRemote;

  if (!verified) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Security Check</h2>
          <p className="text-slate-500 mb-6">Please re-enter your administrator credentials to access sensitive controls.</p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-left">
               <label className="text-xs font-bold text-slate-700 uppercase">Security Passcode</label>
               <div className="relative mt-1">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter code (admin123)"
                  />
               </div>
               {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors">
              Verify Identity
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Super System Administration</h2>
          <p className="text-sm text-slate-500">Manage users, permissions, and communications.</p>
        </div>
        <div className="flex items-center gap-4">
          {isRemote ? (
             <span className="flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                <Wifi className="w-3 h-3 mr-1.5" /> Live Sync Active
             </span>
          ) : (
             <span className="flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                <WifiOff className="w-3 h-3 mr-1.5" /> Local Mode
             </span>
          )}
          <button onClick={() => setVerified(false)} className="text-sm text-slate-500 hover:text-indigo-600 border border-slate-300 px-3 py-1 rounded-lg">Lock Panel</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Approved Users
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center ${activeTab === 'rejected' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Rejected Users
          {rejectedUsers.length > 0 && (
            <span className="ml-2 bg-slate-500 text-white text-[10px] px-2 py-0.5 rounded-full">{rejectedUsers.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'locations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Locations
        </button>
        <button 
          onClick={() => setActiveTab('newsletter')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'newsletter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Newsletter System
        </button>
        <button 
          onClick={() => setActiveTab('database')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center ${activeTab === 'database' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Database className="w-4 h-4 mr-2" /> Local Data
        </button>
        <button 
          onClick={() => setActiveTab('server')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center ${activeTab === 'server' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Server className="w-4 h-4 mr-2" /> Server & API
        </button>
      </div>

      {/* Server Deployment Tab */}
      {activeTab === 'server' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Connection Settings</h3>
                  <p className="text-slate-500">Connect this frontend to a live backend server to enable real-time sync.</p>
                </div>
              </div>
            </div>
            
            {/* CONNECTION INPUT */}
            <div className="bg-slate-50 border border-indigo-200 rounded-xl p-6 mb-8">
               <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Live Server Configuration</h4>
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                     <input 
                       type="text"
                       placeholder="e.g., https://my-api.onrender.com/api" 
                       value={apiUrl}
                       onChange={(e) => setApiUrl(e.target.value)}
                       className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                     />
                     <p className="text-xs text-slate-500 mt-1">
                       Enter the URL of your deployed Node.js server. Leave empty to use Local Storage.
                     </p>
                  </div>
                  <button 
                    onClick={handleSaveApiUrl}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap h-[46px]"
                  >
                    {apiUrl ? 'Connect & Reload' : 'Reset to Local'}
                  </button>
               </div>
               
               {isRemote && (
                 <div className="mt-4 flex items-center text-green-600 bg-green-50 p-3 rounded-lg text-sm border border-green-100">
                    <Check className="w-4 h-4 mr-2" /> 
                    <strong>Connected:</strong> Using remote server at {client.getConfig().apiUrl}
                 </div>
               )}
            </div>

            {/* Guide Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-900 flex items-center mb-2"><Database className="w-4 h-4 mr-2 text-indigo-500" /> 1. Create Backend</h4>
                 <p className="text-sm text-slate-600 mb-2">Use the code below to create a Node.js server. Deploy it to a free host like <strong>Render</strong> or <strong>Railway</strong>.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-900 flex items-center mb-2"><Globe className="w-4 h-4 mr-2 text-indigo-500" /> 2. Get URL</h4>
                 <p className="text-sm text-slate-600 mb-2">Once deployed, you will get a URL (e.g., my-app.onrender.com). Copy this URL.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-900 flex items-center mb-2"><Layers className="w-4 h-4 mr-2 text-indigo-500" /> 3. Connect</h4>
                 <p className="text-sm text-slate-600 mb-2">Paste the URL above. Your Netlify app will now talk to your Server, enabling Device A-to-B sync.</p>
              </div>
            </div>

            <div className="grid gap-8">
              {/* Deployment Guide */}
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                 <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center text-slate-300 text-sm font-mono">
                       <Terminal className="w-4 h-4 mr-2" /> Instructions
                    </div>
                 </div>
                 <div className="p-4 overflow-x-auto">
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{BACKEND_CODE.deploymentSteps}</pre>
                 </div>
              </div>

              {/* Schema.sql */}
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center text-slate-300 text-sm font-mono">
                    <Database className="w-4 h-4 mr-2" /> schema.sql (MySQL Database)
                  </div>
                  <button 
                    onClick={() => copyToClipboard(BACKEND_CODE.schemaSql, 'schema')}
                    className="text-xs flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {copySuccess === 'schema' ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <Copy className="w-4 h-4 mr-1" />}
                    Copy
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs text-blue-300 font-mono">{BACKEND_CODE.schemaSql}</pre>
                </div>
              </div>

              {/* Server.js */}
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center text-slate-300 text-sm font-mono">
                    <Code className="w-4 h-4 mr-2" /> server.js (Node.js Backend)
                  </div>
                  <button 
                    onClick={() => copyToClipboard(BACKEND_CODE.serverJs, 'server')}
                    className="text-xs flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {copySuccess === 'server' ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <Copy className="w-4 h-4 mr-1" />}
                    Copy
                  </button>
                </div>
                <div className="p-4 overflow-x-auto max-h-[500px]">
                  <pre className="text-xs text-purple-300 font-mono">{BACKEND_CODE.serverJs}</pre>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all flex items-center justify-center mx-auto">
                 <Download className="w-5 h-5 mr-2" /> Download Backend Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-8 animate-fade-in">
           <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
             <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-6 border border-amber-200">
                <AlertCircle className="w-3 h-3 mr-2" />
                USING BROWSER LOCAL STORAGE
             </div>
             <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Database className="w-8 h-8 text-indigo-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Local Data Management</h3>
             <p className="text-slate-600 max-w-lg mx-auto mb-8">
               Manage your system's internal data persistence. This data lives in your browser. Download backups to keep your records safe or restore from a previous state.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="p-6 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-slate-50">
                   <Download className="w-8 h-8 text-indigo-600 mb-4 mx-auto" />
                   <h4 className="font-bold text-slate-800 mb-2">Export Backup</h4>
                   <p className="text-xs text-slate-500 mb-4">Download all current records as a JSON file.</p>
                   <button 
                     onClick={handleExportDB}
                     className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                   >
                     Download Data
                   </button>
                </div>

                <div className="p-6 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-slate-50">
                   <Upload className="w-8 h-8 text-emerald-600 mb-4 mx-auto" />
                   <h4 className="font-bold text-slate-800 mb-2">Restore Data</h4>
                   <p className="text-xs text-slate-500 mb-4">Upload a previously exported JSON backup.</p>
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                   >
                     Select File
                   </button>
                   <input 
                     type="file" 
                     accept=".json" 
                     ref={fileInputRef} 
                     className="hidden"
                     onChange={handleImportDB}
                   />
                </div>

                <div className="p-6 border border-slate-200 rounded-xl hover:border-red-300 transition-colors bg-slate-50">
                   <RefreshCw className="w-8 h-8 text-red-600 mb-4 mx-auto" />
                   <h4 className="font-bold text-slate-800 mb-2">Factory Reset</h4>
                   <p className="text-xs text-slate-500 mb-4">Clear all data and restore default seed data.</p>
                   <button 
                     onClick={handleResetDB}
                     className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                   >
                     Reset System
                   </button>
                </div>
             </div>
             
             {/* System Records Explorer */}
             <div className="border-t border-slate-200 pt-10 text-left">
                 <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                     <div>
                       <h3 className="text-lg font-bold text-slate-800 flex items-center">
                           <FileText className="w-5 h-5 mr-2 text-slate-500" />
                           System Records Explorer
                       </h3>
                       <p className="text-xs text-slate-500 mt-1">Raw database view with bulk deletion capabilities.</p>
                     </div>
                     <div className="flex items-center gap-2">
                       {inspectorData.length > 0 && (
                           <button 
                             onClick={handleClearViewClick}
                             className="flex items-center bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                             title={`Clear all ${inspectorData.length} records in this view`}
                           >
                             <Trash2 className="w-3 h-3 mr-1.5" />
                             Delete All
                           </button>
                       )}

                       {selectedIds.size > 0 && (
                         <button 
                           onClick={handleBulkDeleteClick}
                           className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm animate-fade-in"
                         >
                           <Trash2 className="w-3 h-3 mr-1.5" />
                           Delete {selectedIds.size} Selected
                         </button>
                       )}
                       <select 
                          value={inspectorView}
                          onChange={(e) => setInspectorView(e.target.value)}
                          className="bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[150px]"
                       >
                          {inspectorOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                       </select>
                     </div>
                 </div>
                 
                 <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md">
                    <div className="px-4 py-2 bg-slate-800 flex justify-between items-center border-b border-slate-700">
                        <span className="text-xs font-mono text-slate-400">Viewing {inspectorData.length} records</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Raw Data View</span>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] custom-scrollbar p-4">
                        {inspectorData.length > 0 ? (
                            <table className="w-full text-left border-collapse text-xs font-mono text-slate-300">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-100">
                                        <th className="p-3 w-10 bg-slate-800/50 text-center">
                                          <div className="flex items-center justify-center">
                                            <input 
                                              type="checkbox" 
                                              onChange={handleSelectAll}
                                              checked={inspectorData.length > 0 && selectedIds.size === inspectorData.length}
                                              className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-offset-slate-800 cursor-pointer"
                                            />
                                          </div>
                                        </th>
                                        {Object.keys(inspectorData[0]).slice(0, 6).map(key => (
                                            <th key={key} className="p-3 font-semibold uppercase tracking-wider bg-slate-800/50 whitespace-nowrap">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {inspectorData.map((row: any, idx: number) => (
                                        <tr key={row.id || idx} className={`border-b border-slate-800/50 hover:bg-slate-800 transition-colors ${selectedIds.has(row.id) ? 'bg-indigo-900/20' : ''}`}>
                                            <td className="p-3 text-center">
                                              <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                                className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-offset-slate-800 cursor-pointer"
                                              />
                                            </td>
                                            {Object.keys(row).slice(0, 6).map(key => (
                                                <td key={`${idx}-${key}`} className="p-3 max-w-[200px] truncate cursor-pointer" onClick={() => handleSelectRow(row.id)}>
                                                    {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-slate-500 italic">
                                No records found in this collection.
                            </div>
                        )}
                    </div>
                 </div>
             </div>
           </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="font-bold text-indigo-900">Access Requests</h3>
              <span className="text-xs text-indigo-600 font-medium">{pendingUsers.length} Pending</span>
            </div>
            
            {pendingUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No pending registration requests.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingUsers.map(user => (
                  <div key={user.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg mr-4">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{user.name}</h4>
                        <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:gap-4">
                          <span>{user.email}</span>
                          <span>{user.phone}</span>
                        </div>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Awaiting Confirmation</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => initiateReject(user)}
                        className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <UserX size={16} className="mr-2" /> Reject
                      </button>
                      <button 
                        onClick={() => initiateApproval(user)}
                        className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center shadow-sm"
                      >
                        <UserCheck size={16} className="mr-2" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejected Users Tab */}
      {activeTab === 'rejected' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-700">Rejected Users (72h Grace Period)</h3>
                <p className="text-xs text-slate-500 mt-1">Users in this list have received a rejection notification.</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">{rejectedUsers.length} Rejected</span>
            </div>
            
            {rejectedUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <UserX className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No rejected users found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rejectedUsers.map(user => {
                  const hoursRemaining = getRemainingHours(user.rejectionDate);
                  const isExpired = hoursRemaining <= 0;
                  const percentageLeft = Math.max(0, Math.min(100, (hoursRemaining / 72) * 100));

                  return (
                    <div key={user.id} className="p-6 flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center opacity-90">
                          <div className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 flex items-center">
                              {user.name}
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 border border-green-200">
                                 <Mail size={10} className="mr-1" /> Notification Sent
                              </span>
                            </h4>
                            <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:gap-4">
                              <span>{user.email}</span>
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                          <button 
                            onClick={() => initiateDelete(user)}
                            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center justify-center"
                          >
                            <Trash2 size={16} className="mr-2" /> Delete Permanently
                          </button>
                          <button 
                            onClick={() => initiateApproval(user)}
                            className="flex-1 md:flex-none px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center justify-center shadow-sm"
                          >
                            <UserCheck size={16} className="mr-2" /> Re-Approve
                          </button>
                        </div>
                      </div>
                      
                      {/* Grace Period Countdown */}
                      <div className="pl-[4rem]">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center text-xs font-medium">
                            {isExpired ? (
                              <span className="text-red-600 flex items-center"><AlertOctagon size={12} className="mr-1" /> Grace period expired</span>
                            ) : (
                              <span className="text-amber-600 flex items-center"><Clock size={12} className="mr-1" /> Deletion in {Math.floor(hoursRemaining)}h {Math.floor((hoursRemaining % 1) * 60)}m</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">72h Window</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isExpired ? 'bg-slate-300' : 'bg-amber-500'}`}
                            style={{ width: `${percentageLeft}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Tab (Approved Users) */}
      {activeTab === 'users' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
              <div className="p-3 bg-indigo-50 rounded-lg mr-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Personnel</p>
                <h3 className="text-2xl font-bold text-slate-800">{activeUsers.length}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg mr-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Administrators</p>
                <h3 className="text-2xl font-bold text-slate-800">{totalAdmins}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
              <div className="p-3 bg-emerald-50 rounded-lg mr-4">
                <Activity className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Recent Sign-ins</p>
                <h3 className="text-2xl font-bold text-slate-800">{activeRecently}</h3>
                <p className="text-xs text-emerald-600">Active in last 24h</p>
              </div>
            </div>
          </div>

          {/* Manual Entry Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-indigo-600" />
              Add New Approved User
            </h3>
            <form onSubmit={handleSubmitUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Full Name" 
                required 
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
              />
              <input 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Email Address" 
                type="email"
                required 
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />
              <input 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Phone Number" 
                required 
                value={newUser.phone}
                onChange={e => setNewUser({...newUser, phone: e.target.value})}
              />
              <input 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Initial Password" 
                required 
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
              />
              <select 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={newUser.district}
                onChange={e => setNewUser({...newUser, district: e.target.value})}
              >
                <option value="">Select District (Optional)</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={newUser.department}
                onChange={e => setNewUser({...newUser, department: e.target.value})}
              >
                <option value="">Select Department (Optional)</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              
              <input 
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Position / Title" 
                value={newUser.position}
                onChange={e => setNewUser({...newUser, position: e.target.value})}
              />

              <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-medium transition-colors shadow-sm md:col-span-2">
                <Plus size={18} className="mr-2" /> Add & Approve User
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Approved Users List ({activeUsers.length})</h3>
              <div className="text-xs text-slate-400 flex items-center">
                <Save className="w-3 h-3 mr-1" /> Auto-saved
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-medium">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Role / Position</th>
                    <th className="px-6 py-3">Last Login</th>
                    <th className="px-6 py-3">Location/District</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full mr-3" />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{user.name}</span>
                            <span className="text-xs text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                            user.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {user.status === 'active' ? 'Approved' : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1
                            ${user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' : 
                              user.role === UserRole.PASTOR ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}
                          `}>
                            {user.role.replace('_', ' ')}
                          </span>
                          {user.position && <span className="text-xs text-slate-500">{user.position}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                      </td>
                      <td className="px-6 py-4">{user.district || user.location || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {canEditRoles && (
                            <>
                              <button
                                onClick={() => initiateResetPassword(user)}
                                className="text-slate-400 hover:text-amber-600 transition-colors p-1 rounded-full hover:bg-amber-50"
                                title="Reset Password"
                              >
                                <Key size={18} />
                              </button>
                              <button
                                onClick={() => initiateEditUser(user)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50"
                                title="Edit User"
                              >
                                <Edit size={18} />
                              </button>
                            </>
                          )}
                          
                          {user.role !== UserRole.SUPER_ADMIN && (
                            <button 
                              onClick={() => initiateDelete(user)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Remove User"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Danger Zone */}
          {canEditRoles && (
            <div className="border border-red-200 rounded-xl p-6 bg-red-50 mt-12">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-red-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                  <p className="text-red-600 text-sm mt-1">
                    Bulk actions that affect the entire system database. Proceed with caution.
                  </p>
                </div>
                <button 
                  onClick={() => setDeleteAllConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Non-Admin Users
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Deletion Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Deletion</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to remove <span className="font-semibold text-slate-900">{deleteConfirm.userName}</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Rejection Confirmation Modal */}
      {rejectConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Rejection</h3>
            <p className="text-slate-500 mb-4">
              Are you sure you want to reject <span className="font-semibold text-slate-900">{rejectConfirm.userName}</span>?
            </p>
            <p className="text-xs text-slate-400 mb-6">
              The user will be notified via email. They will remain in the Rejected list for 72 hours before permanent deletion.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setRejectConfirm({ isOpen: false, userId: null, userName: '' })}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Deletion Confirmation Modal */}
      {deleteLocationConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Location</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteLocationConfirm.locationName}</span>? This might affect users assigned to this location.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteLocationConfirm({ isOpen: false, locationId: null, locationName: '' })}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLocationDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Users Confirmation Modal */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in text-center border-2 border-red-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">System Clean Warning</h3>
            <p className="text-slate-600 mb-6">
              You are about to <span className="font-bold text-red-600">DELETE ALL NON-ADMIN USERS</span> from the system. 
              This action removes all pastors and staff, but preserves Super Admins and District/Local Admins. This action is irreversible.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteAllConfirm(false)}
                className="flex-1 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteAll}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                PRUNE USERS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Selected Records</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to permanently delete <span className="font-bold text-slate-900">{bulkDeleteState.count}</span> records? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setBulkDeleteState({ isOpen: false, count: 0 })}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBulkDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear View Confirmation Modal */}
      {clearViewState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center border-2 border-red-500">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Clear Entire Collection</h3>
            <p className="text-slate-500 mb-6">
              You are about to delete <span className="font-bold text-slate-900">ALL {clearViewState.count}</span> records from <span className="font-bold capitalize">{clearViewState.view}</span>. This is destructive and irreversible.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setClearViewState({ isOpen: false, view: '', count: 0 })}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmClearView}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                NUKE COLLECTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Approve User Access</h3>
              <button onClick={() => setApprovalState({ isOpen: false, user: null })} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg mb-4">
               <p className="text-sm font-bold">{approvalState.user?.name}</p>
               <p className="text-xs text-slate-500">{approvalState.user?.email}</p>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Assign a role and district to activate this account. The user will receive an approval notification.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign Role</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={approvalForm.role}
                  onChange={e => setApprovalForm({...approvalForm, role: e.target.value as UserRole})}
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District (Optional)</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={approvalForm.district}
                  onChange={e => setApprovalForm({...approvalForm, district: e.target.value})}
                >
                  <option value="">None</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleApproveSubmit}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Confirm Approval & Notify
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordState.isOpen && resetPasswordState.user && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
              <button onClick={() => setResetPasswordState({isOpen: false, user: null, newPassword: ''})} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="mb-6">
               <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4 flex items-start">
                  <Key className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Changing password for:</p>
                    <p className="text-sm text-amber-800">{resetPasswordState.user.name}</p>
                  </div>
               </div>
               <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
               <input 
                 type="text"
                 className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Enter new password"
                 value={resetPasswordState.newPassword}
                 onChange={e => setResetPasswordState(prev => ({ ...prev, newPassword: e.target.value }))}
                 autoFocus
               />
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setResetPasswordState({isOpen: false, user: null, newPassword: ''})}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetPasswordSubmit}
                disabled={!resetPasswordState.newPassword}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  !resetPasswordState.newPassword ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal (CRUD) */}
      {editUserState.isOpen && editUserState.user && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Edit User Details</h3>
              <button onClick={() => setEditUserState({isOpen: false, user: null})} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editUserState.user.name}
                  onChange={e => handleEditUserChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email (ID)</label>
                <input 
                  className="w-full p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 cursor-not-allowed"
                  value={editUserState.user.email}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Login</label>
                <input 
                  className="w-full p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 cursor-not-allowed"
                  value={editUserState.user.lastLogin ? new Date(editUserState.user.lastLogin).toLocaleString() : 'Never'}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
                <input 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editUserState.user.phone}
                  onChange={e => handleEditUserChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editUserState.user.role}
                  onChange={e => handleEditUserChange('role', e.target.value as UserRole)}
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
                 <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editUserState.user.district || ''}
                  onChange={e => handleEditUserChange('district', e.target.value)}
                >
                  <option value="">None</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                 <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editUserState.user.department || ''}
                  onChange={e => handleEditUserChange('department', e.target.value)}
                >
                  <option value="">None</option>
                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Position / Title</label>
                <input 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editUserState.user.position || ''}
                  onChange={e => handleEditUserChange('position', e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setEditUserState({isOpen: false, user: null})}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateUserSubmit}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
