
import React, { useState } from 'react';
import { Department, User, Announcement, UserRole, ChatMessage } from '../types';
import { Building, Calendar, MessageSquare, ArrowLeft, Clock, Users, Plus, X, Send, Mail, Phone, User as UserIcon, Trash2, Edit, Save, AlertCircle } from 'lucide-react';
import Community from './Community';

interface DepartmentsProps {
  user: User;
  users: User[];
  departments: Department[];
  announcements: Announcement[];
  onAddAnnouncement: (ann: Announcement) => void;
  onUpdateAnnouncement?: (ann: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  chats: ChatMessage[];
  onAddChat: (msg: ChatMessage) => void;
}

const Departments: React.FC<DepartmentsProps> = ({ user, users, departments, announcements, onAddAnnouncement, onUpdateAnnouncement, onDeleteAnnouncement, chats, onAddChat }) => {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'discussion'>('overview');
  
  const [isPosting, setIsPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState({ title: '', message: '', meetingTime: '' });
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    if (editingId && onUpdateAnnouncement) {
      // Update existing
      const original = announcements.find(a => a.id === editingId);
      if (original) {
        onUpdateAnnouncement({
          ...original,
          title: postForm.title,
          message: postForm.message,
          meetingTime: postForm.meetingTime || undefined
        });
      }
    } else {
      // Create new
      const announcement: Announcement = {
        id: Date.now().toString(),
        departmentId: selectedDept.id,
        title: postForm.title,
        message: postForm.message,
        meetingTime: postForm.meetingTime || undefined,
        author: user.name, 
        date: new Date().toISOString().split('T')[0]
      };
      onAddAnnouncement(announcement);
    }

    // Reset
    setPostForm({ title: '', message: '', meetingTime: '' });
    setIsPosting(false);
    setEditingId(null);
  };

  const startEdit = (ann: Announcement) => {
    setPostForm({
      title: ann.title,
      message: ann.message,
      meetingTime: ann.meetingTime || ''
    });
    setEditingId(ann.id);
    setIsPosting(true);
  };

  const cancelPost = () => {
    setIsPosting(false);
    setEditingId(null);
    setPostForm({ title: '', message: '', meetingTime: '' });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteAnnouncement(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Helper to find department head in user list
  const findDeptHead = (headName: string) => {
    return users.find(u => u.name === headName);
  };

  // Sub-component for Department Detail
  if (selectedDept) {
    const deptAnnouncements = announcements.filter(a => a.departmentId === selectedDept.id);
    const deptHeadUser = findDeptHead(selectedDept.head);
    
    // Authorization Check
    const isDepartmentMember = user.department === selectedDept.id;
    const isDepartmentHead = user.name === selectedDept.head;
    const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DISTRICT_ADMIN;
    
    const canPost = isAdmin || isDepartmentHead || isDepartmentMember;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setSelectedDept(null)}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedDept.name} Department</h2>
            <p className="text-slate-500 text-sm">Coordinated by {selectedDept.head}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'overview' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview & Leadership
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'discussion' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Department Discussion
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Column */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">About</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedDept.description}</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Department Staff & Members</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Office: Mon-Fri, 8am - 5pm</span>
                    </div>
                  </div>
               </div>

               {/* Department Head Card */}
               <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                 <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wide mb-4">Department Head</h3>
                 <div className="flex items-center space-x-4 mb-4">
                   <img 
                     src={deptHeadUser?.avatar || `https://ui-avatars.com/api/?name=${selectedDept.head}`} 
                     alt={selectedDept.head} 
                     className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover"
                   />
                   <div>
                     <p className="font-bold text-slate-900">{selectedDept.head}</p>
                     <p className="text-xs text-indigo-600">{deptHeadUser?.position || 'Director'}</p>
                   </div>
                 </div>
                 
                 {deptHeadUser ? (
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center text-slate-600">
                       <Mail className="w-4 h-4 mr-2 text-indigo-400" />
                       <a href={`mailto:${deptHeadUser.email}`} className="hover:text-indigo-700 hover:underline">{deptHeadUser.email}</a>
                     </div>
                     <div className="flex items-center text-slate-600">
                       <Phone className="w-4 h-4 mr-2 text-indigo-400" />
                       <a href={`tel:${deptHeadUser.phone}`} className="hover:text-indigo-700 hover:underline">{deptHeadUser.phone}</a>
                     </div>
                     {deptHeadUser.location && (
                        <div className="flex items-center text-slate-600">
                           <UserIcon className="w-4 h-4 mr-2 text-indigo-400" />
                           <span>Based at {deptHeadUser.location}</span>
                        </div>
                     )}
                   </div>
                 ) : (
                   <p className="text-xs text-slate-400 italic">Contact details not available in public directory.</p>
                 )}
               </div>
            </div>

            {/* Announcements */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                    Meeting Times & Announcements
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{deptAnnouncements.length} Active</span>
                    {canPost && !isPosting && (
                      <button 
                        onClick={() => { setEditingId(null); setPostForm({title:'', message:'', meetingTime:''}); setIsPosting(true); }}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center text-xs font-medium px-2.5"
                      >
                        <Plus size={14} className="mr-1" /> Post New
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Form */}
                {isPosting && (
                  <div className="p-4 bg-indigo-50 border-b border-indigo-100 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-indigo-900">{editingId ? 'Edit Announcement' : 'New Department Announcement'}</h4>
                      <button onClick={cancelPost} className="text-indigo-400 hover:text-indigo-600">
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={handlePostSubmit} className="space-y-3">
                      <input 
                        className="w-full p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Announcement Title"
                        value={postForm.title}
                        onChange={e => setPostForm({...postForm, title: e.target.value})}
                        required
                      />
                      <textarea 
                        className="w-full p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                        placeholder="Write your message here..."
                        value={postForm.message}
                        onChange={e => setPostForm({...postForm, message: e.target.value})}
                        required
                      />
                      <div className="flex items-center gap-2">
                        <input 
                          className="flex-1 p-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Meeting Time (Optional, e.g., Friday 2 PM)"
                          value={postForm.meetingTime}
                          onChange={e => setPostForm({...postForm, meetingTime: e.target.value})}
                        />
                        <button 
                          type="submit"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                        >
                          {editingId ? <Save size={14} className="mr-2" /> : <Send size={14} className="mr-2" />} 
                          {editingId ? 'Update' : 'Post'}
                        </button>
                      </div>
                      <p className="text-xs text-indigo-400">Posting as: <span className="font-semibold">{user.name}</span></p>
                    </form>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {deptAnnouncements.length > 0 ? deptAnnouncements.map(ann => {
                    const author = users.find(u => u.name === ann.author);
                    return (
                    <div key={ann.id} className="p-6 hover:bg-slate-50 transition-colors group relative">
                       <div className="flex justify-between items-start mb-2">
                         <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                         <div className="flex items-center space-x-2">
                           <span className="text-xs text-slate-400">{ann.date}</span>
                           {(canPost || ann.author === user.name) && (
                             <>
                               <button 
                                  onClick={() => startEdit(ann)}
                                  className="p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                  title="Edit Announcement"
                               >
                                  <Edit size={14} />
                               </button>
                               <button 
                                 onClick={() => handleDeleteClick(ann.id)}
                                 className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                 title="Delete Announcement"
                               >
                                 <Trash2 size={14} />
                               </button>
                             </>
                           )}
                         </div>
                       </div>
                       <p className="text-slate-600 text-sm mb-3">{ann.message}</p>
                       {ann.meetingTime && (
                         <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100 mb-3">
                           <Clock className="w-3 h-3 mr-1.5" />
                           Meeting: {ann.meetingTime}
                         </div>
                       )}
                       
                       <div className="flex items-center mt-2 pt-3 border-t border-slate-100">
                          <img 
                             src={author?.avatar || `https://ui-avatars.com/api/?name=${ann.author}&background=random`}
                             alt={ann.author}
                             className="w-8 h-8 rounded-full mr-3 object-cover border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold text-slate-700 truncate">{ann.author}</p>
                             {author ? (
                               <p className="text-[10px] text-slate-500 truncate">{author.position || author.role.replace('_', ' ')}</p>
                             ) : (
                               <p className="text-[10px] text-slate-400 italic">Member</p>
                             )}
                          </div>
                          {author && (
                             <a href={`mailto:${author.email}`} className="text-slate-300 hover:text-indigo-600 transition-colors p-1" title={`Email ${author.email}`}>
                                <Mail size={14} />
                             </a>
                          )}
                       </div>
                    </div>
                  )}) : (
                    <div className="p-8 text-center text-slate-500">No current announcements.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px]">
             <Community currentUser={user} messages={chats} onSendMessage={onAddChat} />
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Announcement</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this announcement? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
        <p className="text-sm text-slate-500 hidden sm:block">Select a department to view schedules and discussions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div 
            key={dept.id} 
            onClick={() => setSelectedDept(dept)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <Building className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{dept.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs text-slate-500">
                 <span className="block font-medium text-slate-700">Head</span>
                 {dept.head}
              </div>
              <div className="bg-slate-100 p-2 rounded-full text-slate-400 group-hover:text-indigo-600 transition-colors">
                 <MessageSquare size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
