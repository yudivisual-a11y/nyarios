import { Message } from '../types';

export interface SummaryResult {
  hasContent: boolean;
  mainTopics: string[];
  importantNotes: string[];
  decisions: string[];
  schedules: string[];
  tasks: string[];
  rawMessageCount: number;
}

export function summarizeConversation(messages: Message[]): SummaryResult {
  const activeMessages = messages.filter(m => !m.isDeleted && m.type !== 'system');
  
  if (activeMessages.length === 0) {
    return {
      hasContent: false,
      mainTopics: [],
      importantNotes: [],
      decisions: [],
      schedules: [],
      tasks: [],
      rawMessageCount: 0,
    };
  }

  const mainTopics: string[] = [];
  const importantNotes: string[] = [];
  const decisions: string[] = [];
  const schedules: string[] = [];
  const tasks: string[] = [];

  // Categorize information based on message contents
  activeMessages.forEach((msg) => {
    const text = msg.content.trim();
    if (!text && msg.attachment) {
      importantNotes.push(`Lampiran dibagikan oleh ${msg.senderName}: ${msg.attachment.name}`);
      return;
    }
    if (msg.quickAsk) {
      mainTopics.push(`Polling Cepat: "${msg.quickAsk.question}"`);
    }
    if (msg.poll) {
      mainTopics.push(`Jajak Pendapat: "${msg.poll.question}"`);
    }
    if (msg.taskData) {
      tasks.push(`${msg.taskData.title} (PJ: ${msg.taskData.assignee}, Deadline: ${msg.taskData.deadline || 'Belum diatur'})`);
    }
    if (msg.scheduleData) {
      schedules.push(`${msg.scheduleData.title} pada ${msg.scheduleData.date} ${msg.scheduleData.startTime}`);
    }

    const lower = text.toLowerCase();
    
    // Keyword heuristics in Indonesian
    if (lower.includes('jadwal') || lower.includes('jam') || lower.includes('tanggal') || lower.includes('hari') || lower.includes('rapat') || lower.includes('pertemuan')) {
      schedules.push(`[${msg.senderName}] ${text}`);
    } else if (lower.includes('sepakat') || lower.includes('setuju') || lower.includes('putuskan') || lower.includes('fix') || lower.includes('deal') || lower.includes('keputusan')) {
      decisions.push(`[${msg.senderName}] ${text}`);
    } else if (lower.includes('tolong') || lower.includes('tugas') || lower.includes('siapkan') || lower.includes('kerjakan') || lower.includes('kirimkan') || lower.includes('buatkan') || lower.includes('deadline')) {
      tasks.push(`[${msg.senderName}] ${text}`);
    } else if (text.length > 25) {
      importantNotes.push(`[${msg.senderName}] ${text}`);
    } else if (text.length > 5 && mainTopics.length < 4) {
      mainTopics.push(text);
    }
  });

  // If some categories are empty but messages exist, fill meaningful context
  if (mainTopics.length === 0 && activeMessages.length > 0) {
    mainTopics.push(`Diskusi bersama mengenai ${activeMessages[0].content.slice(0, 40)}...`);
  }
  if (importantNotes.length === 0 && activeMessages.length > 0) {
    importantNotes.push(`Terdapat ${activeMessages.length} pesan terkirim dalam percakapan.`);
  }

  return {
    hasContent: true,
    mainTopics: Array.from(new Set(mainTopics)).slice(0, 4),
    importantNotes: Array.from(new Set(importantNotes)).slice(0, 5),
    decisions: Array.from(new Set(decisions)).slice(0, 4),
    schedules: Array.from(new Set(schedules)).slice(0, 4),
    tasks: Array.from(new Set(tasks)).slice(0, 5),
    rawMessageCount: activeMessages.length,
  };
}
