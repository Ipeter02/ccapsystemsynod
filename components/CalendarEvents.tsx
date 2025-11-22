
import React, { useState } from 'react';
import { CalendarEvent, User, UserRole } from '../types';
import { Calendar, MapPin, Clock, Plus, X, Trash2 } from 'lucide-react';

interface CalendarEventsProps {
  user: User;
  events: CalendarEvent[];
  onAdd: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

const CalendarEvents: React.FC<CalendarEventsProps> = ({ user, events, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<CalendarEvent>>({ type: 'Meeting' });

  const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DISTRICT_ADMIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    onAdd({
      id: Date.now().toString(),
      title: form.title,
      date: form.date,
      time: form.time || '08:00',
      location: form.location || 'Main Hall',
      type: form.type as any,
      description: form.description || ''
    });
    setIsModalOpen(false);
    setForm({ type: 'Meeting' });
  };

  // Group events by month for list view
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Event Calendar</h2>
          <p className="text-slate-600">Upcoming synod gatherings, meetings, and services.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-indigo-700"
          >
            <Plus size={20} className="mr-2" /> Schedule Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event List */}
        <div className="lg:col-span-2 space-y-4">
          {sortedEvents.length === 0 && <p className="text-slate-500 italic">No upcoming events scheduled.</p>}
          {sortedEvents.map(evt => (
            <div key={evt.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 hover:border-indigo-300 transition-colors">
               <div className="flex-shrink-0 flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg w-20 h-20">
                  <span className="text-xs font-bold uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-bold">{new Date(evt.date).getDate()}</span>
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-800">{evt.title}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-500">{evt.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center"><Clock size={14} className="mr-1" /> {evt.time}</span>
                    <span className="flex items-center"><MapPin size={14} className="mr-1" /> {evt.location}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{evt.description}</p>
               </div>
               {isAdmin && (
                 <button onClick={() => onDelete(evt.id)} className="self-start text-slate-300 hover:text-red-500">
                   <Trash2 size={18} />
                 </button>
               )}
            </div>
          ))}
        </div>

        {/* Mini Calendar Widget (Visual Only for Prototype) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">November 2023</h3>
             <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 font-bold text-slate-400">
               <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
             </div>
             <div className="grid grid-cols-7 gap-2 text-center text-sm">
               {/* Mock Days */}
               {[...Array(30)].map((_, i) => (
                 <div key={i} className={`p-2 rounded-full hover:bg-indigo-50 cursor-pointer ${i === 14 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}`}>
                   {i + 1}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Event</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full p-2 border rounded" placeholder="Event Title" required onChange={e => setForm({...form, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <input type="date" className="w-full p-2 border rounded" required onChange={e => setForm({...form, date: e.target.value})} />
                   <input type="time" className="w-full p-2 border rounded" required onChange={e => setForm({...form, time: e.target.value})} />
                </div>
                <input className="w-full p-2 border rounded" placeholder="Location" required onChange={e => setForm({...form, location: e.target.value})} />
                <select className="w-full p-2 border rounded bg-white" onChange={e => setForm({...form, type: e.target.value as any})}>
                   <option value="Meeting">Meeting</option>
                   <option value="Service">Service</option>
                   <option value="Wedding">Wedding</option>
                   <option value="Funeral">Funeral</option>
                   <option value="Other">Other</option>
                </select>
                <textarea className="w-full p-2 border rounded h-24" placeholder="Details..." onChange={e => setForm({...form, description: e.target.value})} />
                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Save Event</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarEvents;
