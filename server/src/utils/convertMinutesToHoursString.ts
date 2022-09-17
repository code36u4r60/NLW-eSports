// 18:00 -> 1080

export function convertMinutesToHoursString(minutesAmount: number) {
  const hours = String(Math.floor(minutesAmount / 60)).padStart(2, "0");
  const minutes = String(minutesAmount % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}
