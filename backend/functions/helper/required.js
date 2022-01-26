function required(paramName) {
    if (paramName)
        throw Error('missing required parameters, param "' + paramName + '"');
    throw Error('missing required parameters');
}

function requiredEnum(v, Enum) {
    if (!Object.values(Enum).includes((v || '').trim().toLowerCase()))
        throw Error('invalid value "' + v + '", choose one of : [' + Object.values(Enum).join(',') + ']');
}

function clean(dirtyObject) {
    let cleanObject = {};
    Object.keys(dirtyObject)
        .forEach(key =>
            (dirtyObject[key] === undefined || dirtyObject[key] === null)
                ? null
                : cleanObject[key] = dirtyObject[key]
        );
    return cleanObject;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function superClean(obj) {
    let cleaned = clean(obj);
    return isEmpty(cleaned) ? null : cleaned;
}

function dateToUTC(date) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
    );
}

function utcNowTimestamp() {
    return dateToUTC(new Date()).getTime();
}


module.exports = {
    required,
    requiredEnum,
    clean,
    isEmpty,
    superClean,
    utcNowTimestamp,
}