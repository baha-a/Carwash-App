const { db } = require("../helper/data");
const { required, requiredEnum } = require("../helper/required");

function Washers({ washers, clients }) {

    const washerTypes = Object.freeze({
        shop: 'shop',
        delivery: 'delivery',
        all: 'all',
    });

    return Object.freeze({
        get,
        near,

        getAvailablesByType,
        getAll,

        setAvailable,
        setUnavailable,

        getFreetime,

        washerTypes,

        add,

        // convertToWasher,
    });

    async function add({
        uid = required('uid'),
        address = required('address'),
        openHour = required('openHour'),
        closeHour = required('closeHour'),
        name = required('name'),
        photo = required('photo'),
        workDays = required('workDays'),
        location = required('location'),
        type = washerTypes.all,
    } = {}) {

        requiredEnum(type, washerTypes);
        const c = await clients.getById(uid);
        if (!c || !c.exists) {
            throw Error('user not found');
        }
        // later - check if users exists in FirebaseAuth and not Clinets,

        const w = await washers.getById(uid);
        if (w && w.exists) {
            throw Error('washer already exist');
        }

        return await washers.create({
            id: uid,
            type,
            address,
            openHour,
            closeHour,
            name,
            photo,
            workDays,
            location,
        });
    }

    async function setAvailable({ id = required('id') }) {
        await washers.update(id, { isAvailable: true });
    }
    async function setUnavailable({ id = required('id') }) {
        await washers.update(id, { isAvailable: false });
    }

    async function getFreetime({ id = required('id') }) {
        return null;
    }
    async function get({ id = required('id') }) {
        return await washers.getById(id);
    }

    async function getAll() {
        return await washers.getAll();
    }

    async function getAvailablesByType({ type = washerTypes.all } = {}) {
        requiredEnum(type, washerTypes);
        const res = await washers.where('isAvailable', '==', true);
        if (type === washerTypes.all)
            return res;
        return res.filter(x => x.type === washerTypes.all || x.type === type);
    }

    async function near({ lat = 0, lng = 0, limit = 10, type = washerTypes.all } = {}) {
        requiredEnum(type, washerTypes);
        let res = await getAvailablesByType({ type });
        if (lat && lng)
            res = sortByDistanction(res, lat, lng);

        return res.slice(0, limit);
    }

    function sortByDistanction(list, lat, lng) {
        return list
            .filter(x => x.location)
            .map(x => ({ ...x, distance: distance(lat, lng, x.location.latitude, x.location.longitude) }))
            .sort((a, b) => a.distance - b.distance);

    }
    function distance(lat1, lng1, lat2, lng2) {
        return Math.sqrt(((lat1 - lat2) ** 2) + ((lng1 - lng2) ** 2));
    }
}

module.exports = Washers(db);