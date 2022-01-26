
const firebase = require('firebase');
require('firebase/firestore');
require('firebase/storage');
require('firebase/messaging');
const admin = require('firebase-admin');

const secrets = require("../secrets/firestoreCredentials.json");

admin.initializeApp({
    credential: admin.credential.cert(secrets.adminCert),
    databaseURL: "https://washlesscare.firebaseio.com"
});

firebase.initializeApp(secrets.appInitConfig);

const storageRef = firebase.storage().ref();

function FirestoreDb({ collectionName }) {
    const ref = firebase.firestore().collection(collectionName);

    return Object.freeze({
        getById,
        create,
        set,
        update,
        getAll,
        where,
    })

    function snapshatParser(doc) {
        return {
            exists: doc.exists,
            id: doc.id,
            ...doc.data(), // why not '...await doc.data()' ?
        }
    }

    function snapshatSetParser(res) {
        let array = [];
        for (const doc of res.docs)
            array.push(snapshatParser(doc));
        return array;
    }

    async function getById(id) {
        return await ref.doc(id).get().then(snapshatParser);
    }
    async function create(obj) {
        let docRef;
        if (obj.id) {
            docRef = ref.doc(obj.id);
            delete obj.id;
        }
        else docRef = ref.doc();
        await docRef.set(obj);
        return docRef.id;
    }
    async function set(id, obj) {
        await ref.doc(id).set(obj)
    }
    async function update(id, obj) {
        await ref.doc(id).update(obj);
    }
    async function getAll(config) {
        let q = ref;
        if (config && config.orderBy) {
            if (config.descending)
                q = q.orderBy(config.orderBy, 'desc');
            else
                q = q.orderBy(config.orderBy);
        }
        if (config && config.limit)
            q = q.limit(config.limit);
        return await ref.get().then(snapshatSetParser);
    }

    async function where(property, operation, value, orderByProperty) {
        let q = ref.where(property, operation, value);
        if (orderByProperty)
            q = q.orderBy(orderByProperty);
        return await q.get().then(snapshatSetParser);
    }
}

function InitDb() {
    return Object.freeze({
        clients: FirestoreDb({ collectionName: 'Clients' }),
        requests: FirestoreDb({ collectionName: 'Requests' }),
        washers: FirestoreDb({ collectionName: 'Washers' }),

        services: (id) => FirestoreDb({ collectionName: `Washers/${id}/Services` }),

        cars: (uid) => FirestoreDb({ collectionName: `Clients/${uid}/Cars` }),
        news: (uid) => FirestoreDb({ collectionName: `Clients/${uid}/News` }),

        chats: (id) => FirestoreDb({ collectionName: `Requests/${id}/Chats` }),
        states: (id) => FirestoreDb({ collectionName: `Requests/${id}/States` }),

        languages: FirestoreDb({ collectionName: 'Languages' }),
        currencies: FirestoreDb({ collectionName: 'Currencies' }),

        increment: firebase.firestore.FieldValue.increment,
    })
}

module.exports.storageRef = storageRef
module.exports.db = InitDb();
module.exports.admin = admin;