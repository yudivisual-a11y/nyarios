import React, { useState, useMemo } from 'react';
import { ChatCanvas } from '../chat/ChatCanvas';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Edit, Search, Camera } from 'lucide-react';

export const DMView: React.FC = () => {
  const { currentUser, contacts, activeChat, activeChatId, setActiveChatId, setActiveNavTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // In NYARIOS social context, 'contacts' acts as followed/known accounts.
  // We'll merge them with cloud directory users for the mockup inbox.
  const allAccounts = useMemo(() => {
    const map = new Map();
    contacts.forEach(c => map.set(c.id, c));

    map.delete(currentUser.id); // Remove self
    return Array.from(map.values());
  }, [contacts, currentUser.id]);

  const filteredAccounts = allAccounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (acc.username && acc.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 w-full h-full flex bg-white dark:bg-[#0B141A] overflow-hidden">
      {/* Left List (Inbox) */}
      <div className={`w-full md:w-[350px] lg:w-[400px] h-full shrink-0 border-r border-slate-200 dark:border-white/10 ${activeChatId ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
         
         {/* Inbox Header */}
         <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white/95 dark:bg-[#0B141A]/95 z-10 backdrop-blur-md">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveNavTab('profile')}>
               <span className="font-bold text-lg text-slate-900 dark:text-white truncate max-w-[200px]">
                  {currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '')}
               </span>
               <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <button className="text-slate-800 dark:text-white hover:text-emerald-500 transition">
               <Edit className="w-6 h-6" />
            </button>
         </div>

         {/* Search & Inbox Content */}
         <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="px-4 py-3">
               <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                     type="text" 
                     placeholder="Cari akun..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
               </div>
            </div>

            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
               <h3 className="font-semibold text-slate-900 dark:text-white">Pesan</h3>
               <button className="text-sm font-medium text-slate-500 hover:text-slate-300">Permintaan</button>
            </div>

            {/* Account List */}
            <div className="flex flex-col pb-20">
               {filteredAccounts.map(acc => {
                 const isActive = activeChatId === acc.id;
                 return (
                   <button 
                     key={acc.id}
                     onClick={() => setActiveChatId(acc.id)}
                     className={`w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition ${isActive ? 'bg-slate-50 dark:bg-white/5' : ''}`}
                   >
                     <div className="relative shrink-0">
                        <img 
                          src={acc.avatar || `https://ui-avatars.com/api/?name=${acc.name}&background=10B981&color=fff`} 
                          className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 object-cover" 
                        />
                        {/* Mock active dot */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0B141A]"></div>
                     </div>
                     <div className="ml-3 flex-1 flex flex-col items-start overflow-hidden">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate w-full text-left">{acc.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm truncate w-full text-left">
                           {acc.username || 'Aktif sekarang'}
                        </span>
                     </div>
                     <div className="shrink-0 ml-2">
                        <Camera className="w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition" />
                     </div>
                   </button>
                 );
               })}

               {filteredAccounts.length === 0 && (
                 <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    Akun tidak ditemukan.
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Right Conversation */}
      <div className={`flex-1 h-full ${!activeChatId ? 'hidden md:flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#111B21]' : 'flex flex-col'}`}>
         {activeChatId ? (
           <ChatCanvas 
             onBackMobile={() => setActiveChatId(null)} 
             onOpenQuickAsk={() => {}} 
             onOpenPollModal={() => {}} 
             onOpenScheduleModal={() => {}} 
             onOpenTaskModal={() => {}} 
             onToggleGroupInfo={() => {}} 
           />
         ) : (
           <div className="text-center max-w-sm px-6">
              <div className="w-24 h-24 border-2 border-slate-800 dark:border-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                 <MessageCircle className="w-12 h-12 text-slate-800 dark:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pesan Anda</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Kirim foto dan pesan pribadi ke teman atau grup.</p>
              <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/20">
                 Kirim Pesan
              </button>
           </div>
         )}
      </div>
    </div>
  );
};
