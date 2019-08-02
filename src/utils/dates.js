export function timeSinceBlock(date=false, interval) {
  var second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
  let date1 = date ? new Date(date*1000) : new Date();
  let date2 = new Date();
  var timediff = date2 - date1;
  if (isNaN(timediff)) return NaN;
  switch (interval) {
  case 'years': return date2.getFullYear() - date1.getFullYear();
  case 'months': return (
    ((date2.getFullYear() * 12) + date2.getMonth())      -
      ((date1.getFullYear() * 12) + date1.getMonth())
  );
  case 'weeks': return Math.floor(timediff / week)
  case 'days': return Math.floor(timediff / day)
  case 'hours': return Math.floor(timediff / hour)
  case 'minutes': return Math.floor(timediff / minute)
  case 'seconds': return Math.floor(timediff / second)
  default: return undefined
  }
}

export function getDateCreated(daysSince) {
  const d = new Date();
  d.setDate(d.getDate() - daysSince);
  return `${d.getMonth()}/${d.getDate()}/${d.getFullYear()}`
}

export const convertToHours = seconds => Number(seconds) / 60 / 60
