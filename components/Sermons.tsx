
import React from 'react';
import { Sermon } from '../types';
import { FileText, PlayCircle, Download } from 'lucide-react';

interface SermonsProps {
  sermons: Sermon[];
}

const Sermons: React.FC<SermonsProps> = ({ sermons }) => {
  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold text-slate-800">Sermon Archive</h2>
          <p className="text-slate-600">Resources, notes, and recordings for spiritual growth.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermons.map(s => (
             <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{s.date}</span>
                   <FileText className="text-slate-400" size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500 mb-4">By {s.preacher} • {s.scripture}</p>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4 bg-slate-50 p-3 rounded-lg italic">"{s.notes}"</p>
                <div className="flex gap-2">
                   <button className="flex-1 flex items-center justify-center py-2 border border-slate-200 rounded text-sm hover:bg-slate-50">
                      <Download size={14} className="mr-2" /> Notes
                   </button>
                   <button className="flex-1 flex items-center justify-center py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                      <PlayCircle size={14} className="mr-2" /> Listen
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default Sermons;
