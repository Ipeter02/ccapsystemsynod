
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { Send, User as UserIcon, MessageSquare, Lock } from 'lucide-react';

interface CommunityProps {
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
}

const Community: React.FC<CommunityProps> = ({ currentUser, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: inputText,
      timestamp: Date.now(),
      role: currentUser.role
    };

    onSendMessage(newUserMsg);
    setInputText('');
  };

  // SECURITY CHECK
  if (currentUser.status === 'pending') {
      return (
          <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-center p-8">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Restricted Communication</h2>
              <p className="text-slate-600 max-w-md">
                  Internal discussion forums are reserved for verified Synod members. 
                  Please wait for an administrator to approve your account.
              </p>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-indigo-50/50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <MessageSquare className="w-4 h-4 text-indigo-600 mr-2" />
            Pastors & Admins Forum
          </h2>
          <p className="text-xs text-slate-500">Secure internal communication for Synod leadership.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.userId === currentUser.id;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`
                  flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                  ${isMe ? 'ml-2 bg-indigo-100 text-indigo-600' : 'mr-2 bg-slate-100 text-slate-600'}
                `}>
                  <UserIcon size={14} />
                </div>

                <div className={`
                  rounded-2xl px-4 py-3
                  ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}
                `}>
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <span className={`text-xs font-bold ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {msg.userName}
                    </span>
                    <span className={`text-[10px] opacity-70`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;
