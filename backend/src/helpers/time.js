export const utcToLocal = date => new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
export const utcNowTimestamp = () => utcNow().getTime()
export const utcNow = () => dateToUTC(new Date())
export const dateToUTC = date => new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
)
export const isFuture = utcTimestamp => utcTimestamp > utcNowTimestamp();
export const isPast = utcTimestamp => !isFuture(utcTimestamp);
export const since = (utcTimestamp) => {
    if (!utcTimestamp || typeof utcTimestamp !== 'number')
        return 'Unkowen';

    let prefix = '';
    if (isFuture(utcTimestamp))
        prefix = 'in';
    let postfix = '';
    if (isPast(utcTimestamp))
        prefix = 'ago';
    var seconds = Math.floor(Math.abs(utcNowTimestamp() - utcTimestamp) / 1000);
    var interval = seconds / 31536000;
    if (interval > 1)
        return prefix + ' ' + Math.floor(interval) + ' ' + 'years' + ' ' + postfix;
    interval = seconds / 2592000;
    if (interval > 1)
        return prefix + ' ' + Math.floor(interval) + ' ' + 'months' + ' ' + postfix;
    interval = seconds / 86400;
    if (interval > 1)
        return prefix + ' ' + Math.floor(interval) + ' ' + 'days' + ' ' + postfix;
    interval = seconds / 3600;
    if (interval > 1)
        return prefix + ' ' + Math.floor(interval) + ' ' + 'hours' + ' ' + postfix;
    interval = seconds / 60;
    if (interval > 1)
        return prefix + ' ' + Math.floor(interval) + ' ' + 'minutes' + ' ' + postfix;
    return prefix + ' ' + Math.floor(seconds) + ' ' + 'seconds' + ' ' + postfix;
}