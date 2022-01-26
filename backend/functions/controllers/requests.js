const { db, storageRef } = require("../helper/data");
const { msg } = require("./msg");
const { requiredEnum, required, utcNowTimestamp } = require("../helper/required");

function Requests({ requests, states, washers, clients, cars, chats, services }) {

    const requestStates = Object.freeze({
        //
        // order of these fieleds is importent,
        // please don't change it 
        //
        // payment > paid > rejected > scheduled > started > completed > canceled > rated > refunding > refunded
        //
        // maybe later convert this to a state machine or something
        //

        payment: 'payment',
        paid: 'paid',
        rejected: 'rejected',
        scheduled: 'scheduled',
        started: 'started',
        completed: 'completed',
        canceled: 'canceled',
        rated: 'rated',
        refunding: 'refunding',
        refunded: 'refunded',


        includes: (txt) => Object.values(requestStates).includes((txt || '').trim().toLowerCase()),
        indexOf: (txt) => Object.values(requestStates).indexOf((txt || '').trim().toLowerCase()),
    });

    const msgContentTypes = Object.freeze({
        text: 'text',
        image: 'image',
    });

    return Object.freeze({
        create,
        get,
        getMine,
        getForMe,
        getStates,
        getChats,
        addMessageToChat,

        requestStates,
        msgContentTypes,

        markAsPaid,
        reject,
        accept,
        start,
        complete,
        cancel,
        refund,
        markAsRefunded,

        setPaymentId,
        getFast,
        getAll,
    });

    function isPaid(r) {
        return requestStates.indexOf(r.latestState) >= requestStates.paid;
    }

    async function getFast({ id = required('id') }) {
        let r = await requests.getById(id);
        r.isPaid = isPaid(r);
        return r;
    }
    async function getFastAll() {
        let res = await requests.getAll();
        return res.map(r => ({ ...r, isPaid: isPaid(r) }))
    }
    async function setPaymentId({ id = required('id'), paymentId = required('paymentId'), }) {
        return await requests.update(id, { paymentId });
    }


    async function markAsPaid({ id = required('id'), }) {
        await changeState({
            id,
            newState: requestStates.paid
        });
    }
    async function reject({ id = required('id'), uid = required('uid'), note }) {
        await changeState({
            id,
            newState: requestStates.rejected,
            uid,
            payload: { note }
        });
    }
    async function accept({ id = required('id'), uid = required('uid') }) {
        await changeState({
            id,
            newState: requestStates.scheduled,
            uid
        });
    }
    async function start({ id = required('id'), uid = required('uid'), imgs = required('imgs'), note }) {
        if (imgs.length < 3)
            throw Error('at least 3 images required');

        const imgUrls = await storeImages(id, 'before', imgs);
        await changeState({
            id,
            newState: requestStates.started,
            uid,
            payload: { imgUrls, note }
        });
    }
    async function complete({ id = required('id'), uid = required('uid'), imgs = required('imgs'), note }) {
        if (imgs.length < 3)
            throw Error('at least 3 images required');
        const imgUrls = await storeImages(id, 'after', imgs);

        await changeState({
            id,
            newState: requestStates.completed,
            uid,
            payload: { imgUrls, note }
        });
    }

    async function cancel({ id = required('id'), uid = required('uid'), note = required('note') }) {
        await changeState({
            id,
            newState: requestStates.canceled,
            uid,
            payload: { note }
        });
    }

    async function refund({ id = required('id'), payload }) {
        await changeState({
            id,
            newState: requestStates.refunding,
            payload,
        });
    }


    async function markAsRefunded({ id = required('id'), payload }) {
        await changeState({
            id,
            newState: requestStates.refunded,
            payload,
        });
    }


    async function changeState({ id = required('id'), newState = required('newState'), uid = '', payload = {} }) {
        requiredEnum(newState, requestStates);

        const r = await get({ id });

        if (r.latestState && requestStates.indexOf(newState) < requestStates.indexOf(r.latestState))
            throw Error('requestState "' + newState + '" not allowed');

        if (requestStates.indexOf(newState) !== requestStates.indexOf(r.latestState)) {
            await states(id).create({
                createdBy: uid,
                state: newState,
                createTime: utcNowTimestamp(),
                id: String(utcNowTimestamp()),
                payload,
            });
            await requests.update(id, { latestState: newState });
        }

        await msg.send({
            type: msg.types.operation,
            uid: r.client.id,
            title: 'Request State',
            body: 'Your request state is "' + newState + '"',
            data: {
                requestId: id,
            },
        });

        if (newState === requestStates.paid) {
            await msg.send({
                type: msg.types.operation,
                uid: r.washer.id,
                title: 'New Request',
                body: 'You have new request',
                data: {
                    requestId: id,
                },
            });
        }

        if (newState === requestStates.canceled) {
            await msg.send({
                type: msg.types.operation,
                uid: r.washer.id,
                title: 'Request canceled',
                body: 'Some request had canceled',
                data: {
                    requestId: id,
                },
            });
        }
    }

    async function fetchAllRequestById(list) {
        return await Promise.all(list.map(get));
    }
    async function getMine({ uid = required('uid') }) {
        return await fetchAllRequestById(await requests.where('client', '==', uid, 'createTime'));
    }
    async function getForMe({ uid = required('uid') }) {
        return await fetchAllRequestById(await requests.where('washer', '==', uid, 'createTime'));
    }
    async function getChats({ id = required('id'), limit = 100 }) {
        return await chats(id).getAll({
            orderBy: 'createTime',
            descending: true,
            limit
        });
    }

    async function addMessageToChat({
        id = required('id'),
        uid = required('uid'),
        content = required('content'),
        contentType = msgContentTypes.text
    }) {
        requiredEnum(contentType, msgContentTypes);
        const req = await get({ id });
        if (uid !== req.client.id && uid !== req.washer.id)
            throw Error('msg sender must be client or washer of the request');

        const to = req.client === uid ? req.washer : req.client;
        const from = req.client === uid ? req.client : req.washer;

        await chats(id).create({
            id: String(utcNowTimestamp()),
            createdBy: from.id,
            content: contentType === msgContentTypes.text ? content : await storeImage(id, 'chat', content),
            contentType,
            createTime: utcNowTimestamp(),
        });

        await msg.send({
            type: msg.types.chat,
            uid: to.id,
            title: 'Message from ' + (from.name || (from.firstname + ' ' + from.lastname)),
            body: contentType === msgContentTypes.text ? content : 'Image',
            data: {
                requestId: id,
            }
        });
    }

    async function getStates({ id = required('id') }) {
        return await states(id).getAll({ orderBy: 'createTime', descending: true });
    }

    async function get({ id = required('id') }) {
        let res = await getRequestByIdWithCarsAndServices(id);

        res.washer = await washers.getById(res.washer);
        res.client = await clients.getById(res.client);
        delete res.client.pushToken;
        res.states = await states(id).getAll({ orderBy: 'createTime', descending: true });
        return res;
    }
    async function getAll() {
        return await getFastAll();
    }
    async function getRequestByIdWithCarsAndServices(id) {
        let res = await getFast({ id });
        res.cars = (await cars(res.client).getAll()).filter(x => res.cars.includes(x.id));
        res.services = (await services(res.washer).getAll()).filter(x => res.services.includes(x.id));
        return res;
    }

    async function create(request) {
        const {
            client = required('client'),
            washer = required('washer'),
            address = required('address'),
            myLocation = required('myLocation'),
            time = required('time'),
            cars = required('cars'),
            services = required('services'),
            note,
        } = request;

        const { cost, duration } = await calculateCostAndDuration(request);

        const id = await requests.create({
            address,
            client,
            washer,
            note,
            myLocation,
            time,
            cars,
            services,
            paymentId: null,
            cost,
            duration,
            createTime: utcNowTimestamp(),
        });
        await changeState({
            id,
            uid: client,
            newState: requestStates.payment,
        });
        return id;
    }

    async function calculateCostAndDuration(request) {
        const allCars = await cars(request.client).getAll();
        const allServices = await services(request.washer).getAll();

        const selectedCars = allCars.filter(x => request.cars.includes(x.id));
        const selectedServices = allServices.filter(x => request.services.includes(x.id));

        let cost = 0, duration = 0;
        for (const s of selectedServices) {
            for (const c of selectedCars) {
                cost += s.price[c.size];
                duration += s.duration;
            }
        }
        return { cost, duration };
    }

    async function storeImages(requestId, folderName, imgs) {
        let i = 1;
        return await Promise.all(imgs.map(img => storeImage(requestId, folderName, img, i++)))
            .then(res => res.filter(x => x));
    }

    async function storeImage(requestId, folderName, img, filenamePrefix = '') {
        const index = img.name.lastIndexOf('.');
        const fileExtension = index === -1 ? '' : img.name.substr(index);
        const filename = filenamePrefix + '_' + utcNowTimestamp() + fileExtension;

        const ref = storageRef.child('requests').child(requestId).child(folderName).child(filename);
        const res = await ref.put(new Uint8Array(img.data));
        if (res.state === 'success')
            return await ref.getDownloadURL();
        return null;
    }
}

module.exports = Requests(db);