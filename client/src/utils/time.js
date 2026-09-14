export const formatTimeLeft = (endDate) => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';

  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const isEndingToday = (endDate) =>
  new Date(endDate).toDateString() === new Date().toDateString();
