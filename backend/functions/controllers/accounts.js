const { db } = require("../helper/data");
const { requiredEnum, required, utcNowTimestamp } = require("../helper/required");

function Accounts({ clients, news }) {
    const roles = Object.freeze({
        normal: 'normal',
        staff: 'staff',
        admin: 'admin',
    });

    return Object.freeze({
        get,
        updateInfo,

        roles,
        changeRole,
        updatePushToken,
        removePushToken,

        getNews,
        addNews,
        getUnreadedNews,
        markAsReaded,
        markAllAsReaded,
    });

    async function addNews({ uid = required('uid'), title = required('title'), body = required('body'), data }) {
        await news(uid).create({
            title, body, data,
            createTime: utcNowTimestamp(),
            readed: false,
        });
    }
    async function getNews({ uid = required('uid') }) {
        return await news(uid).getAll({ orderBy: 'createTime', descending: true });
    }
    async function getUnreadedNews({ uid = required('uid') }) {
        return await news(uid).where('readed', '==', false, 'createTime');
    }


    async function markAllAsReaded({ ids = required('ids'), uid = required('uid') }) {
        const newser = news(uid);
        await Promise.all(ids.map(id => newser.update(id, { readed: true })));
    }

    async function markAsReaded({ id = required('id'), uid = required('uid') }) {
        await news(uid).update(id, { readed: true });
    }

    async function get({ uid = required('uid') }) {
        let customer = await clients.getById(uid);
        if (!customer.exists) {
            await clients.set(uid, { role: roles.normal });
            return {
                uid,
                role: roles.normal,
            };
        }

        return {
            uid,
            email: customer.email,
            role: customer.role || roles.normal,
            pushToken: customer.pushToken,
        }
    }

    async function updateInfo({ uid = required('uid'), info = required('info') }) {
        delete info.role;
        delete info.pushToken;
        await clients.update(uid, { ...info });
    }

    async function changeRole({ uid = required('uid'), role = required('role') }) {
        requiredEnum(role, roles)
        await clients.update(uid, { role });
    }

    async function updatePushToken({ uid = required('uid'), pushToken = required('pushToken') }) {
        await clients.update(uid, { pushToken });
    }
    async function removePushToken({ uid = required('uid') }) {
        await clients.update(uid, { pushToken: null });
    }

}

module.exports = Accounts(db);