export function timeFormatter(date?: Date): string {
  if (!date) date = new Date();
  const _hour = `0${date.getUTCHours()}`;
  const _minutes = `0${date.getUTCMinutes()}`;
  const _day = `0${date.getUTCDate()}`;
  const _month = `0${date.getUTCMonth() + 1}`;
  const _seconds = `0${date.getUTCSeconds()}`;
  const year = date.getUTCFullYear();

  const hour = _hour.slice(-2);
  const minutes = _minutes.slice(-2);
  const day = _day.slice(-2);
  const month = _month.slice(-2);
  const seconds = _seconds.slice(-2);
  return `${hour}:${minutes}:${seconds} ${day}/${month}/${year} UTC`;
}

export function getDuration (duration: number): string {
  const data = [];
  duration /= 1000;

  const hour = Math.floor(duration / 60 / 60 % 24);
  const min = Math.floor(duration / 60 % 60);
  const sec = Math.floor(duration % 60);
  if (sec >= 1) data.push(`**${sec}** second${sec > 1 ? "s" : ""}`);
  if (min >= 1) data.push(`**${min}** minute${min > 1 ? "s" : ""}`);
  if (hour >= 1) data.push(`**${hour}** hour${hour > 1 ? "s" : ""}`);

  duration /= 60 * 60 * 24;

  const days = Math.floor(duration % 365 % 30 % 7);
  const week = Math.floor(duration % 365 % 30 / 7);
  if (days >= 1) data.push(`**${days}** day${days > 1 ? "s" : ""}`);
  if (week >= 1) data.push(`**${week}** week${week > 1 ? "s" : ""}`);

  if (duration >= 27) {
    if (duration < 46) return "a month";
    else if (duration < 320) return `${Math.round(duration / 30)} months`;
    else if (duration < 548) return "a year";
    return `${Math.round(duration / 365)} years`;
  }
  if (data.length === 0) return "**0** seconds";
  return `${data.reverse().slice(0, 2).join(" and ")}`;
}