
import React, { useState } from 'react';
import { Devotion, User, UserRole } from '../types';
import { BookOpen, Send, Trash2, Calendar } from 'lucide-react';
import { getDailyDevotionTip, getRandomVerse } from '../services/scriptureService';

interface DevotionsProps {
  user: User;
  devotions: Devotion[];
  onAdd: (devotion: Devotion) => void;
  onDelete: (id: string) => void;
}

const Devotions: React.FC<DevotionsProps> = ({ user, devotions, onAdd, onDelete }) => {
  const [form, setForm] = useState({ title: '', content: '', scripture: '' });
  const [randomVerse, setRandomVerse] = useState(getRandomVerse());

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      ...form,
      author: user.name,
      date: new Date().toISOString().split('T')[0]
    });
    setForm({ title: '', content: '', scripture: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily Devotions & Scripture</h2>
          <p className="text-slate-600">Spiritual nourishment for the Synod community.</p>
        </div>
        <button 
          onClick={() => setRandomVerse(getRandomVerse())}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          New Inspiration
        </button>
      </div>

      {/* Inspiration Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-indigo-200 opacity-50" />
        <h3 className="text-xl font-serif italic mb-2">"{randomVerse.text}"</h3>
        <p className="text-indigo-200 font-bold tracking-wide">— {randomVerse.ref}</p>
        <span className="inline-block mt-4 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-100 border border-white/20">
          {randomVerse.category}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          {devotions.map(dev => (
             <div key={dev.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="text-lg font-bold text-slate-800">{dev.title}</h3>
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">{dev.scripture}</p>
                   </div>
                   {isSuperAdmin && (
                     <button onClick={() => onDelete(dev.id)} className="text-slate-300 hover:text-red-500">
                       <Trash2 size={18} />
                     </button>
                   )}
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{dev.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-400">
                   <span className="flex items-center"><Calendar size={14} className="mr-2" /> {dev.date}</span>
                   <span>By {dev.author}</span>
                </div>
             </div>
          ))}
        </div>

        {/* Admin Post Box */}
        {isSuperAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
              <h3 className="font-bold text-slate-800 mb-4">Post New Devotion</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Title"
                  required
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
                <input 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Scripture Reference (e.g. John 3:16)"
                  required
                  value={form.scripture}
                  onChange={e => setForm({...form, scripture: e.target.value})}
                />
                <textarea 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none"
                  placeholder="Devotional content..."
                  required
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                />
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center">
                  <Send size={18} className="mr-2" /> Publish
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Devotions;
