const { db } = require("../helper/data");
const { required } = require("./required");

function Languages({ languages, clients }) {
    return Object.freeze({
        getMine,
        updateMine,
        getAll,
    })

    async function getAll() {
        const data = await languages.getAll().then(x => x.map(y => ({ ...y, code: y.id })));
        data.sort((a, b) => a.order - b.order);
        return data;
    }

    async function getMine({ uid = required('uid') }) {
        const cust = await clients.getById(uid);
        return cust.exists ? (cust.preferredLanguage || '') : '';
    }
    async function updateMine({ uid = required('uid'), code = required('code') }) {
        await clients.update(uid, { preferredLanguage: code });
    }
}

module.exports = Languages(db);