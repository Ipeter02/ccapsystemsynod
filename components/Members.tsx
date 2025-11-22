
import React, { useState } from 'react';
import { Member, User } from '../types';
import { Search, Plus, UserPlus } from 'lucide-react';

interface MembersProps {
  members: Member[];
  onAdd: (member: Member) => void;
}

const Members: React.FC<MembersProps> = ({ members, onAdd }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Member>>({ baptismStatus: 'Not Baptized' });

  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      name: form.name!,
      phone: form.phone || '',
      address: form.address || '',
      baptismStatus: form.baptismStatus as any,
      district: form.district || 'Mzuzu',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Congregation Database</h2>
           <p className="text-slate-600">Manage member registry and sacraments.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
           <UserPlus size={18} className="mr-2" /> Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
         <div className="p-4 border-b border-slate-100 flex gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
               <input 
                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Search members..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                     <th className="p-4">Name</th>
                     <th className="p-4">Phone</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Location</th>
                     <th className="p-4">Joined</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filtered.map(m => (
                     <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{m.name}</td>
                        <td className="p-4 text-slate-500">{m.phone}</td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded-full text-xs ${m.baptismStatus === 'Baptized' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {m.baptismStatus}
                           </span>
                        </td>
                        <td className="p-4 text-slate-500">{m.district}</td>
                        <td className="p-4 text-slate-500">{m.joinedDate}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-slate-500">No members found.</div>}
         </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold mb-4">Register Member</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} required />
              <input className="w-full border p-2 rounded" placeholder="Phone" onChange={e => setForm({...form, phone: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Address" onChange={e => setForm({...form, address: e.target.value})} />
              <select className="w-full border p-2 rounded bg-white" onChange={e => setForm({...form, baptismStatus: e.target.value as any})}>
                 <option value="Not Baptized">Not Baptized</option>
                 <option value="Catechumen">Catechumen (Class)</option>
                 <option value="Baptized">Baptized Member</option>
              </select>
              <div className="flex gap-2 mt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 p-2 rounded">Cancel</button>
                 <button className="flex-1 bg-indigo-600 text-white p-2 rounded">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
