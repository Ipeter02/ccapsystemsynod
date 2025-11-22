
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, Mail, Phone, MapPin, Briefcase, Camera, Save, Shield, CheckCircle, Home, LogOut, ArrowLeft } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onNavigate?: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onNavigate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
           <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
           {onNavigate && (
             <button 
               onClick={() => onNavigate('dashboard')}
               className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors border border-slate-200"
             >
               <Home className="w-4 h-4 mr-2" /> Exit to Overview
             </button>
           )}
        </div>
        
        {successMsg && (
          <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
            <CheckCircle className="w-4 h-4 mr-2" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header / Cover */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500 relative">
           <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                <img 
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 border-2 border-white shadow-sm transition-colors"
                >
                  <Camera size={14} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange}
              />
            </div>
            
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            ) : (
               <div className="flex space-x-2">
                 {onNavigate && (
                   <button 
                    onClick={() => onNavigate('dashboard')}
                    className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center"
                   >
                     <ArrowLeft size={16} className="mr-2" /> Dashboard
                   </button>
                 )}
                 <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(user); // Reset
                  }}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                >
                  <Save size={16} className="mr-2" /> Save Changes
                </button>
               </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Personal Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Personal Details</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true} // Usually email is immutable without verification
                      className="w-full pl-10 p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      title="Contact admin to change email"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">Email cannot be changed directly.</p>
                </div>
              </div>

              {/* Role & Location */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Role & Assignment</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Position / Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      name="position"
                      value={formData.position || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="e.g. Senior Pastor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / Church</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                 <div className="pt-4">
                   <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-indigo-900">System Role: {user.role.replace('_', ' ')}</p>
                        <p className="text-xs text-indigo-700 mt-1">
                          Your permissions are managed by the Synod Super Administrator.
                        </p>
                      </div>
                   </div>
                 </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
