
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { client } from '../services/client';
import { Lock, Mail, Phone, AlertCircle, User as UserIcon, Key, ShieldCheck, ArrowRight, Globe, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => Promise<void>;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, users }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
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
        return;
      }
      
      // Check status
      if (existingUser.status === 'pending') {
        setError('Your account is pending approval by the Synod Administrator. Please check back later.');
        setIsLoading(false);
        return;
      }

      if (existingUser.status === 'rejected') {
         setError('This account has been deactivated. Please contact the main office.');
         setIsLoading(false);
         return;
      }
      
      // Log in existing active user
      onLogin(existingUser);
    } else {
      // REGISTER NEW USER
      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: UserRole.PASTOR, // Default role
        status: 'pending', // MUST be pending
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
      };
      
      try {
        await onRegister(newUser);
        setRegistrationSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      }
    }
    setIsLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await client.users.login(email.trim(), password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
         <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Registration Successful</h2>
            <p className="text-slate-600 mb-8">
               Your request to access the CCAP Synod System has been sent. 
               Please wait for an Administrator to approve your account.
            </p>
            <button 
               onClick={() => {
                 setRegistrationSuccess(false);
                 setEmail('');
                 setName('');
                 setPhone('');
               }}
               className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
            >
               Return to Login
            </button>
         </div>
      </div>
    );
  }

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
                <p className="text-slate-600 text-sm">Login or Register to access.</p>
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
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="ml-2 w-4 h-4" /></>}
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
