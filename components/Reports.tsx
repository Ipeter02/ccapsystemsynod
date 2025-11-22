
import React, { useState } from 'react';
import { MonthlyReport, User } from '../types';
import { FileText, CheckCircle, Clock } from 'lucide-react';

interface ReportsProps {
  user: User;
  reports: MonthlyReport[];
  onSubmit: (report: MonthlyReport) => void;
}

const Reports: React.FC<ReportsProps> = ({ user, reports, onSubmit }) => {
  const [form, setForm] = useState<Partial<MonthlyReport>>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: Date.now().toString(),
      month: 'November', // Simplified for demo
      year: 2023,
      pastorId: user.id,
      district: user.district || 'Unknown',
      attendanceAvg: Number(form.attendanceAvg),
      converts: Number(form.converts),
      baptisms: Number(form.baptisms),
      titheTotal: Number(form.titheTotal),
      status: 'Submitted'
    });
    setForm({});
    alert("Report Submitted to Synod Headquarters");
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Digital Reporting</h2>
             <p className="text-slate-600">Submit monthly statistics and parish updates.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">Submit Monthly Report</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Avg. Attendance</label>
                      <input type="number" className="w-full border p-2 rounded" onChange={e => setForm({...form, attendanceAvg: Number(e.target.value)})} required />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">New Converts</label>
                      <input type="number" className="w-full border p-2 rounded" onChange={e => setForm({...form, converts: Number(e.target.value)})} />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Baptisms</label>
                      <input type="number" className="w-full border p-2 rounded" onChange={e => setForm({...form, baptisms: Number(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Total Offerings</label>
                      <input type="number" className="w-full border p-2 rounded" onChange={e => setForm({...form, titheTotal: Number(e.target.value)})} />
                   </div>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">Submit Report</button>
             </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Submission History</div>
             <div className="divide-y divide-slate-100">
                {reports.length === 0 && <div className="p-6 text-center text-slate-500">No reports submitted.</div>}
                {reports.map(r => (
                   <div key={r.id} className="p-4 flex justify-between items-center">
                      <div>
                         <p className="font-bold text-slate-800">{r.month} {r.year}</p>
                         <p className="text-xs text-slate-500">Attend: {r.attendanceAvg} | Tithe: {r.titheTotal}</p>
                      </div>
                      <div className="flex items-center text-xs font-bold text-green-600">
                         <CheckCircle size={14} className="mr-1" /> {r.status}
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Reports;
