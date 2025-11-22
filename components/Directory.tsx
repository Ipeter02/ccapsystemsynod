
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { DISTRICTS } from '../constants';
import { Search, Filter, Mail, Phone, BadgeCheck, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

interface DirectoryProps {
  users: User[];
  currentUser: User;
}

const Directory: React.FC<DirectoryProps> = ({ users, currentUser }) => {
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // SECURITY CHECK: Guest/Pending users cannot see the directory
  if (currentUser.status === 'pending') {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <div className="bg-slate-200 p-4 rounded-full mb-4">
                  <Lock className="w-12 h-12 text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Restricted Access</h2>
              <p className="text-slate-600 max-w-md mb-6">
                  The Staff Directory contains sensitive contact information. 
                  As a guest user, you must wait for Administrator approval to view this data.
              </p>
          </div>
      );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistrict = filterDistrict === 'All' || user.district === filterDistrict;
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesDistrict && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDistrict, filterRole]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Staff Directory <span className="text-sm text-slate-400 font-normal ml-2">({users.length} Total)</span></h2>
        <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text"
            placeholder="Search name, location..."
            className="bg-transparent outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <select 
          className="bg-white border border-slate-300 rounded-md text-sm px-3 py-2 outline-none focus:border-indigo-500"
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
        >
          <option value="All">All Districts</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select 
          className="bg-white border border-slate-300 rounded-md text-sm px-3 py-2 outline-none focus:border-indigo-500"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value={UserRole.PASTOR}>Pastors</option>
          <option value={UserRole.DISTRICT_ADMIN}>District Admins</option>
          <option value={UserRole.LOCAL_ADMIN}>Local Admins</option>
          <option value={UserRole.SUPER_ADMIN}>Super Admins</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start space-x-4 hover:shadow-md transition-shadow">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-slate-900 truncate">{user.name}</h3>
                {user.role === UserRole.SUPER_ADMIN && <BadgeCheck className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-indigo-600 text-sm font-medium mb-1">
                {user.position || (user.role === UserRole.PASTOR ? 'Reverend' : user.role.replace('_', ' '))}
              </p>
              <p className="text-slate-500 text-sm mb-3 truncate">{user.location || user.district || 'Main Office'}</p>
              
              <div className="flex space-x-2">
                <a href={`mailto:${user.email}`} className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <Mail size={16} />
                </a>
                <a href={`tel:${user.phone}`} className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Phone size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          No personnel found matching your criteria.
        </div>
      )}

      {/* Pagination Controls */}
      {filteredUsers.length > itemsPerPage && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-full border ${currentPage === 1 ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-slate-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full border ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Directory;
