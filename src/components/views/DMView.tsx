import React, { useState } from 'react';
import { ContactsView } from './ContactsView';
import { ChatCanvas } from '../chat/ChatCanvas';
import { useApp } from '../../context/AppContext';
import { MessageCircle } from 'lucide-react';

export const DMView: React.FC = () => {
  const { activeChat } = useApp();

  return (
    <div className="flex-1 w-full h-full flex bg-[#F8FAFC] dark:bg-[#0B141A] overflow-hidden">
      {/* Left List (Hidden on mobile if a chat is active) */}
      <div className={`w-full md:w-[350px] lg:w-[400px] h-full shrink-0 border-r border-slate-200 dark:border-white/10 ${activeChat ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
         <ContactsView />
      </div>

      {/* Right Conversation (Hidden on mobile if no chat is active) */}
      <div className={`flex-1 h-full ${!activeChat ? 'hidden md:flex md:flex-col md:items-center md:justify-center md:bg-white md:dark:bg-[#111B21]' : 'flex flex-col'}`}>
         {activeChat ? (
           <ChatCanvas onBackMobile={() => {}} onOpenQuickAsk={() => {}} onOpenPollModal={() => {}} onOpenScheduleModal={() => {}} onOpenTaskModal={() => {}} onToggleGroupInfo={() => {}} />
         ) : (
           <div className="text-center">
              <div className="w-24 h-24 border-2 border-slate-800 dark:border-white rounded-full flex items-center justify-center mx-auto mb-4">
                 <MessageCircle className="w-12 h-12 text-slate-800 dark:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pesan Anda</h2>
              <p className="text-slate-500 dark:text-slate-400">Kirim pesan privat, foto, atau video ke teman.</p>
           </div>
         )}
      </div>
    </div>
  );
};
