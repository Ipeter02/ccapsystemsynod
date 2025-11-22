
import React, { useEffect, useState } from 'react';
import { MAIN_OFFICE_ADDRESS, DISTRICTS, SCRIPTURE_LIBRARY } from '../constants';
import { UserRole, User, Department } from '../types';
import { MapPin, Users, Building2, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface DashboardProps {
  users: User[];
  departments: Department[];
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2073",
  "https://images.unsplash.com/photo-1548625361-e88c60eb6539?auto=format&fit=crop&q=80&w=2069",
  "https://images.unsplash.com/photo-1601142634808-38923eb7c560?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=2071"
];

const Dashboard: React.FC<DashboardProps> = ({ users, departments }) => {
  const [stats, setStats] = useState({
    totalPastors: 0,
    totalAdmins: 0,
    districts: DISTRICTS.length,
    departments: departments.length
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVerse, setCurrentVerse] = useState(SCRIPTURE_LIBRARY[0]);
  const [verseFade, setVerseFade] = useState(true);

  useEffect(() => {
    // Stats Calculation
    const pastors = users.filter(u => u.role === UserRole.PASTOR).length;
    const admins = users.filter(u => u.role !== UserRole.PASTOR && u.role !== UserRole.STAFF).length;

    setStats({
      totalPastors: pastors,
      totalAdmins: admins,
      districts: DISTRICTS.length,
      departments: departments.length
    });

    // Image Slider Logic
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [users, departments]);

  // Automatic Scripture Rotator Logic
  useEffect(() => {
    const verseInterval = setInterval(() => {
      setVerseFade(false); // Fade out
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * SCRIPTURE_LIBRARY.length);
        setCurrentVerse(SCRIPTURE_LIBRARY[randomIndex]);
        setVerseFade(true); // Fade in
      }, 500);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(verseInterval);
  }, []);

  const chartData = DISTRICTS.map(d => ({
    name: d,
    pastors: users.filter(u => u.district === d && u.role === UserRole.PASTOR).length
  }));

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#4f46e5'];

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Hero Section with Moving Background */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
        {/* Image Carousel */}
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Church Life" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[10s]" />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-900/60 to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center text-white max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium mb-6 w-fit shadow-sm">
            <Activity className="w-3 h-3 mr-2 text-emerald-400 animate-pulse" />
            <span className="text-emerald-100">System Online & Syncing</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-lg tracking-tight">
            Serving the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-100 to-white">
              Synod of Livingstonia
            </span>
          </h1>

          <p className="text-lg text-indigo-100 mb-6 leading-relaxed max-w-xl opacity-90 font-light">
            "To be a spiritually vibrant, united, self-reliant, and holistic ministry church."
          </p>

          {/* Automatic Scripture Inspiration Layer */}
          <div className="mb-8 max-w-xl">
             <div className={`transition-opacity duration-500 ease-in-out ${verseFade ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-sm font-serif italic text-indigo-200 border-l-2 border-indigo-400 pl-4">
                  "{currentVerse.text}" <span className="text-white font-bold not-italic text-xs ml-2">— {currentVerse.ref}</span>
                </p>
             </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-12 flex space-x-2 z-20">
          {HERO_IMAGES.map((_, idx) => (
             <button
               key={idx}
               onClick={() => setCurrentImageIndex(idx)}
               className={`h-1 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
             />
          ))}
        </div>
      </div>

      {/* Floating Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 relative z-10 px-2 sm:px-4">
        {[
          { label: 'Total Pastors', value: stats.totalPastors, icon: Users, color: 'text-blue-600', bg: 'bg-white' },
          { label: 'Districts', value: stats.districts, icon: MapPin, color: 'text-purple-600', bg: 'bg-white' },
          { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-amber-600', bg: 'bg-white' },
          { label: 'Active Admins', value: stats.totalAdmins, icon: Activity, color: 'text-emerald-600', bg: 'bg-white' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 flex items-center space-x-4 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl`}>
            <div className={`p-4 rounded-xl bg-slate-50 shadow-inner`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 sm:px-4">
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Pastoral Distribution</h3>
                <p className="text-slate-500 text-sm mt-1">Real-time personnel allocation across districts</p>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded-xl">
                 <TrendingUp className="text-indigo-600 w-5 h-5" />
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#64748b', fontSize: 12}}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <Bar dataKey="pastors" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Side Info Column */}
         <div className="lg:col-span-1 space-y-6">
            {/* Dark HQ Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg tracking-wide">Headquarters</h3>
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                      <MapPin className="text-indigo-300 w-5 h-5" />
                    </div>
                 </div>
                 <div className="space-y-5">
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Address</p>
                       <p className="font-medium text-lg">{MAIN_OFFICE_ADDRESS.city}</p>
                       <p className="text-sm text-slate-300">{MAIN_OFFICE_ADDRESS.poBox}, {MAIN_OFFICE_ADDRESS.region}</p>
                    </div>
                    <div>
                       <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Office Hours</p>
                       <p className="font-medium">Mon - Fri: 08:00 - 17:00</p>
                    </div>
                    <div className="pt-4">
                      <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        View on Map <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                 </div>
               </div>
               {/* Background Decorations */}
               <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
            </div>

            {/* Quick Links */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                  Departments
                </h3>
                <div className="space-y-2">
                   {departments.slice(0, 3).map((dept, i) => (
                     <div key={dept.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                        <div className="flex items-center">
                           <span className="text-xs font-bold text-slate-300 mr-3 w-4">0{i+1}</span>
                           <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{dept.name}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                     </div>
                   ))}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
