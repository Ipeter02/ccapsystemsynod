
import React, { useState } from 'react';
import { FinancialRecord, User } from '../types';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FinanceProps {
  user: User;
  records: FinancialRecord[];
  onAdd: (record: FinancialRecord) => void;
}

const Finance: React.FC<FinanceProps> = ({ user, records, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<FinancialRecord>>({ type: 'Tithe', method: 'Cash' });

  const totalIncome = records.filter(r => r.type !== 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = records.filter(r => r.type === 'Expense').reduce((acc, curr) => Math.abs(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Tithes', value: records.filter(r => r.type === 'Tithe').reduce((acc, curr) => acc + curr.amount, 0) },
    { name: 'Donations', value: records.filter(r => r.type === 'Donation').reduce((acc, curr) => acc + curr.amount, 0) },
    { name: 'Projects', value: records.filter(r => r.type === 'Project').reduce((acc, curr) => acc + curr.amount, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    
    const finalAmount = form.type === 'Expense' ? -Math.abs(Number(form.amount)) : Number(form.amount);

    onAdd({
      id: Date.now().toString(),
      type: form.type as any,
      amount: finalAmount,
      date: form.date || new Date().toISOString().split('T')[0],
      description: form.description || '',
      congregation: user.location || 'Main Office',
      method: form.method as any
    });
    setIsModalOpen(false);
    setForm({ type: 'Tithe', method: 'Cash' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Management</h2>
          <p className="text-slate-600">Track tithes, donations, and mobile money transactions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 flex items-center"
        >
          <DollarSign size={18} className="mr-1" /> Record Transaction
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-bold text-slate-400 uppercase">Total Income</span>
               <TrendingUp className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">MWK {totalIncome.toLocaleString()}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-bold text-slate-400 uppercase">Expenses</span>
               <TrendingDown className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">MWK {totalExpense.toLocaleString()}</p>
         </div>
         <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-bold text-indigo-200 uppercase">Net Balance</span>
               <CreditCard className="text-white" />
            </div>
            <p className="text-2xl font-bold">MWK {balance.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">Recent Transactions</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Method</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody>
                    {records.slice().reverse().map(rec => (
                      <tr key={rec.id} className="border-t border-slate-100 hover:bg-slate-50">
                         <td className="p-4 text-slate-500">{rec.date}</td>
                         <td className="p-4 font-medium text-slate-800">{rec.description}</td>
                         <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">{rec.type}</span></td>
                         <td className="p-4 text-slate-500">{rec.method}</td>
                         <td className={`p-4 text-right font-bold ${rec.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                           {rec.amount > 0 ? '+' : ''}{rec.amount.toLocaleString()}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
         </div>

         <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><PieChartIcon size={18} className="mr-2"/> Income Sources</h3>
            <div className="w-full h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
               {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center text-xs">
                     <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                     {entry.name}
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Modal Omitted for brevity, follows pattern */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="font-bold mb-4">Record Transaction</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                 <select className="w-full border p-2 rounded" onChange={e => setForm({...form, type: e.target.value as any})}>
                    <option value="Tithe">Tithe</option>
                    <option value="Donation">Donation</option>
                    <option value="Project">Project Fund</option>
                    <option value="Expense">Expense</option>
                 </select>
                 <input type="number" placeholder="Amount (MWK)" className="w-full border p-2 rounded" onChange={e => setForm({...form, amount: Number(e.target.value)})} required />
                 <input placeholder="Description" className="w-full border p-2 rounded" onChange={e => setForm({...form, description: e.target.value})} required />
                 <select className="w-full border p-2 rounded" onChange={e => setForm({...form, method: e.target.value as any})}>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Mpamba">Mpamba (TNM)</option>
                 </select>
                 <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 p-2 rounded">Cancel</button>
                    <button className="flex-1 bg-emerald-600 text-white p-2 rounded">Save</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
