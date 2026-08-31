export function formatRelativeTime(rawTimestamp: number): string {
  if (!rawTimestamp) return '';
  const now = Date.now();
  const diffSec = Math.floor((now - rawTimestamp) / 1000);

  if (diffSec < 60) {
    return 'Baru saja';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} mnt lalu`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    const d = new Date(rawTimestamp);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) {
    return 'Kemarin';
  }
  if (diffDay < 7) {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[new Date(rawTimestamp).getDay()];
  }

  const d = new Date(rawTimestamp);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function formatMessageTime(rawTimestamp: number): string {
  if (!rawTimestamp) return '';
  const d = new Date(rawTimestamp);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatFullDate(rawTimestamp: number): string {
  if (!rawTimestamp) return '';
  const d = new Date(rawTimestamp);
  return d.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
