const { db } = require("../helper/data");
const admin = require('firebase-admin');
const { required, requiredEnum, utcNowTimestamp } = require("../helper/required");
const accounts = require("./accounts");


function Msg({ clients }) {
    const types = Object.freeze({
        chat: 'chat',
        operation: 'operation',
        ads: 'ads',
        //..etc

        includes: (txt) => Object.values(types).includes((txt || '').trim().toLowerCase()),
        indexOf: (txt) => Object.values(types).indexOf((txt || '').trim().toLowerCase()),
        same: (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase(),
        notSame: (a, b) => !types.same(a, b),
    });

    return Object.freeze({
        send,
        types,
    });

    async function send({ type, uid = required('uid'), title = required('title'), body = required('body'), data = {} }) {
        requiredEnum(type, types);


        const user = await clients.getById(uid);
        if (user && types.notSame(type, types.chat))
            await accounts.addNews({ uid, title, body, data });

        if (!user || !user.pushToken)
            return null;

        return await sendToToken({ token: user.pushToken, title, body, data: { ...data, type } });
    }

    async function sendToToken({ token = required('token'), title = required('title'), body = required('body'), data = {} }) {
        const res = await admin.messaging().sendToDevice(token, {
            notification: {
                title,
                body,
                icon: 'ic_notification',
            },
            data
        });
        if (res.results[0].error)
            throw res.results[0].error;
        return res;
    }
}

module.exports.msg = Msg(db);