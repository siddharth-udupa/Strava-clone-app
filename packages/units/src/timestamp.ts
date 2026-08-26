export function toTimestamp(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}

export function toDateAndTime(Timestamp: Date | string | number | null | undefined): string {
  if (!Timestamp) return ""
  const dateObj = Timestamp instanceof Date ? Timestamp : new Date(Timestamp)
  if (isNaN(dateObj.getTime())) return ""
  const timestamp = dateObj.toISOString().split('T')
  const date = timestamp[0]
  const time = timestamp[1] ? timestamp[1].slice(0, 5) : ""

  return `${date} ${time}`
}

export function formatDateAndTime(timestamp: Date | string | number | null | undefined, timeFormat?: "12h" | "24h" | string): { date: string, time: string } {
  if (!timestamp) return { date: "", time: "" }
  const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(dateObj.getTime())) return { date: "", time: "" };
  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  });

  return { date: formattedDate, time: formattedTime };
}