
import React, { useState } from 'react';
import { CHURCH_INFO } from '../constants';
import { Heart, Target, BookOpen, HelpCircle, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export const InfoPage: React.FC = () => (
  <div className="space-y-8 max-w-4xl mx-auto">
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">About CCAP Synod of Livingstonia</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">{CHURCH_INFO.about}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-indigo-600 text-white rounded-xl p-8 shadow-lg">
        <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Our Vision</h3>
        <p className="text-indigo-100">{CHURCH_INFO.vision}</p>
      </div>

      <div className="bg-emerald-600 text-white rounded-xl p-8 shadow-lg">
        <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Our Mission</h3>
        <p className="text-emerald-100">{CHURCH_INFO.mission}</p>
      </div>
    </div>

    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center mb-6">
        <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
        <h3 className="text-xl font-bold text-slate-800">Statement of Faith & Objectives</h3>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-900 mb-2">We Believe</h4>
          <p className="text-slate-600">{CHURCH_INFO.beliefs}</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 mb-2">Core Objectives</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHURCH_INFO.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-center text-slate-600 text-sm">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 shrink-0"></span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export const SupportPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
         <h2 className="text-2xl font-bold text-slate-800">Contact & Support</h2>
         <p className="text-slate-600 text-sm">Reach out to the main office for inquiries, support, or technical assistance.</p>
         
         <div className="space-y-4">
           <div className="flex items-start">
             <MapPin className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
             <div className="text-sm text-slate-600">
               <p className="font-medium text-slate-900">Headquarters</p>
               <p>P.O. Box 112</p>
               <p>Mzuzu, Malawi</p>
             </div>
           </div>
           <div className="flex items-center">
             <Phone className="w-5 h-5 text-indigo-600 mr-3" />
             <span className="text-sm text-slate-600">+265 999 123 456</span>
           </div>
           <div className="flex items-center">
             <Mail className="w-5 h-5 text-indigo-600 mr-3" />
             <span className="text-sm text-slate-600">support@ccap.org</span>
           </div>
         </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" />
            Send us a message
          </h3>
          
          {sent ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
              <p className="font-bold">Message Sent!</p>
              <p className="text-sm">Thank you. We will respond shortly.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-xs underline">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                  <input required className="w-full border rounded p-2 text-sm" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input required type="email" className="w-full border rounded p-2 text-sm" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select className="w-full border rounded p-2 text-sm">
                   <option>General Inquiry</option>
                   <option>Technical Support</option>
                   <option>Pastoral Care</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                <textarea required className="w-full border rounded p-2 text-sm h-32" placeholder="How can we help you?"></textarea>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center hover:bg-indigo-700">
                <Send className="w-4 h-4 mr-2" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

interface NewsletterProps {
  onSubscribe?: (email: string) => void;
}

export const Newsletter: React.FC<NewsletterProps> = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      if (onSubscribe) {
        onSubscribe(email);
      }
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200 px-6 animate-fade-in">
       <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
         <Mail className="w-8 h-8 text-indigo-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 mb-2">Subscribe to our Newsletter</h2>
       <p className="text-slate-500 mb-8">Stay updated with the latest news, events, and spiritual nourishment from the Synod.</p>
       
       {status === 'success' ? (
          <div className="flex flex-col items-center justify-center text-green-600 p-4 bg-green-50 rounded-lg animate-fade-in">
            <CheckCircle className="w-8 h-8 mb-2" />
            <p className="font-bold">Successfully Subscribed!</p>
            <p className="text-sm">Thank you for joining our community.</p>
          </div>
       ) : (
         <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto">
           <input 
             type="email" 
             placeholder="Enter your email address" 
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="flex-1 border border-slate-300 rounded-l-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
             required
           />
           <button type="submit" className="bg-indigo-900 text-white px-6 py-3 rounded-r-lg font-medium hover:bg-indigo-800 transition-colors">
             Subscribe
           </button>
         </form>
       )}
       <p className="text-xs text-slate-400 mt-4">We respect your privacy. Unsubscribe at any time.</p>
    </div>
  );
};
