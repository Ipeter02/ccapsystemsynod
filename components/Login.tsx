
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { client } from '../services/client';
import { Lock, Mail, Phone, AlertCircle, User as UserIcon, Key, ShieldCheck, ArrowRight, Globe, ArrowLeft, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, users }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');

  const handlePublicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email) {
      setError('Please enter your name and email to continue.');
      setIsLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      // SECURITY CHECK: Smart Admin Detection
      // If the email belongs to an admin, automatically switch to secure login mode
      if (existingUser.role === UserRole.SUPER_ADMIN || existingUser.role === UserRole.DISTRICT_ADMIN || existingUser.role === UserRole.LOCAL_ADMIN) {
        setIsAdminMode(true);
        setError('Administrator account recognized. Please enter your password to proceed.');
        setIsLoading(false);
        // We keep the email filled, user just needs to enter password
        return;
      }
      
      // Log in existing standard user
      onLogin(existingUser);
    } else {
      // Create and log in new user immediately with PENDING status (Guest Mode)
      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: UserRole.PASTOR, // Default standard role
        status: 'pending', // Changed to pending for security
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
      };
      
      // Use the parent handler which wraps client.users.register
      await onRegister(newUser);
      // Note: onRegister in parent might be async, but we also need to trigger login state
      // Usually onRegister updates the user list, but we might need to manually trigger login if we want immediate session
      // However, typically we want them to wait for approval.
      // But for "Guest Mode" if status is pending, we can still log them in as restricted.
      onLogin(newUser);
    }
    setIsLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await client.users.login(email.trim(), password);
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DISTRICT_ADMIN || user.role === UserRole.LOCAL_ADMIN) {
        onLogin(user);
      } else {
        setError('Access denied. This account does not have administrative privileges.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-800 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-800 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className={`p-8 text-center transition-colors duration-500 ${isAdminMode ? 'bg-slate-800' : 'bg-indigo-600'}`}>
          <div 
            className="mx-auto bg-white/10 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
            onClick={() => {
              // Manual toggle logic
              setIsAdminMode(!isAdminMode);
              setError('');
            }}
            title={isAdminMode ? "Switch to Public Login" : "Switch to Admin Login"}
          >
            {isAdminMode ? <ShieldCheck className="w-8 h-8 text-white" /> : <Globe className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isAdminMode ? 'Admin Portal' : 'CCAP System'}
          </h2>
          <p className="text-indigo-100 mt-2 text-sm">
            {isAdminMode ? 'Secure System Administration' : 'Synod of Livingstonia Management'}
          </p>
          {client.getConfig().isRemote && (
             <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-[10px] font-bold uppercase tracking-wide">
                Live Mode
             </div>
          )}
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start mb-6 rounded-r-lg animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!isAdminMode ? (
            /* PUBLIC ACCESS FORM */
            <form onSubmit={handlePublicLogin} className="space-y-5 animate-fade-in">
              <div className="text-center mb-2">
                <p className="text-slate-600 text-sm">Enter your details to access the system.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 block w-full border border-slate-300 rounded-lg py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Rev. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border border-slate-300 rounded-lg py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="john@ccap.org"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 block w-full border border-slate-300 rounded-lg py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="+265..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 disabled:bg-indigo-400 disabled:transform-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enter System <ArrowRight className="ml-2 w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
               <div className="text-center mb-2">
                <p className="text-slate-600 text-sm">Please authenticate to access the admin panel.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border border-slate-300 rounded-lg py-3 px-4 focus:ring-slate-500 outline-none"
                    placeholder="admin@ccap.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full border border-slate-300 rounded-lg py-3 px-4 focus:ring-slate-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors disabled:bg-slate-600"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(false);
                  setError('');
                }}
                className="w-full flex justify-center items-center py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Public Login
              </button>
            </form>
          )}
          
          {/* Footer text */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-[10px] text-slate-400">
               © 2025 CCAP Synod of Livingstonia. All rights reserved.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
