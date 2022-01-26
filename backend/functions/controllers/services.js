const { db } = require("../helper/data");
const { required, superClean } = require("../helper/required");

function Services({ services }) {
    return Object.freeze({
        get,
        add,

        update,

        disable,
        enable,
    });


    async function get({ washerId = required('washerId'), includeDisabled = false }) {
        if (includeDisabled)
            return await services(washerId).getAll();
        return await services(washerId).where('enabled', '==', true);
    }

    async function add({
        washerId = required('washerId'),
        title = required('title'),
        desc,
        type,
        order = 0,
        duration = required('duration'),
        price = required('price'),
        enabled = true,
    }) {
        const info = superClean({ title, desc, type, order, duration, price });
        if (info)
            return await services(washerId).create({
                ...info,
                enabled: enabled === true,
            });
        return null;
    }

    async function update({
        washerId = required('washerId'),
        serviceId = required('serviceId'),
        title,
        desc,
        type,
        order,
        duration,
        price,
    }) {
        const info = superClean({ title, desc, type, order, duration, price });
        if (info) {
            await services(washerId).update(serviceId, info);
        }
    }

    async function disable({ washerId = required('washerId'), serviceId = required('serviceId') }) {
        await setEnable(washerId, serviceId, false);
    }
    async function enable({ washerId = required('washerId'), serviceId = required('serviceId') }) {
        await setEnable(washerId, serviceId, true);
    }

    async function setEnable(washerId, serviceId, value) {
        await services(washerId).update(serviceId, { enabled: value });
    }
}

module.exports = Services(db);