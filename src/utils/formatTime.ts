export function formatTo12Hour(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function isDaytime(time24: string): boolean {
  if (!time24) return true;
  const [hours] = time24.split(':').map(Number);
  // Define daytime as 6 AM to 9 PM (21:00)
  return hours >= 6 && hours <= 21;
}
