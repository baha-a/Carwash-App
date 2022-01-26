const { db } = require("../helper/data"); es
const { required } = require("./required");

function Currency({ currencies, clients }) {
    return Object.freeze({
        getMine,
        updateMine,
        getAll,
        updateRate,
    })

    async function getAll() {
        const data = await currencies.getAll().then(x => x.map(y => ({ ...y, code: y.id })));
        data.sort((a, b) => a.order - b.order);
        return data;
    }
    async function updateRate({ code = required('code'), rate = required('rate') }) {
        await currencies.update(code, { rate });
    }

    async function getMine({ uid = required('uid') }) {
        const cust = await clients.getById(uid);
        return cust.exists ? (cust.preferredCurrency || '') : '';
    }
    async function updateMine({ uid = required('uid'), code = required('code') }) {
        await clients.update(uid, { preferredCurrency: code });
    }
}

module.exports = Currency(db);