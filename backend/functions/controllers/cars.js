const { db } = require("../helper/data");
const { required, utcNowTimestamp } = require("../helper/required");

const carTypes = require('../data/carsTypes.json');
const { storageRef } = require("../helper/data");

function Cars({ cars }) {

    return Object.freeze({
        get,
        unarchivedCars,
        archivedCars,
        allCars,

        archive,
        unarchive,

        getBrands,
        getModels,
        getTypes,
        getSize,

        add,
    })

    function isEqules(a, b) {
        return a.trim().toUpperCase() === b.trim().toUpperCase();
    }

    function getBrands() {
        return carTypes.map(x => x.brand);
    }
    function getModels(brand) {
        return carTypes.find(x => isEqules(x.brand, brand))
            .child.map(x => x.model);
    }
    function getTypes(brand, model) {
        return carTypes.find(x => isEqules(x.brand, brand))
            .child.find(x => isEqules(x.model, model))
            .child;
    }
    function getSize(brand, model, type) {
        return getTypes(brand, model).find(x => isEqules(x.type, type)).size;
    }

    async function get({ uid = required('uid'), id = required('id') }) {
        return await cars(uid).getById(id);
    }

    async function unarchivedCars({ uid = required('uid') }) {
        let result = await allCars({ uid });
        return result.filter(x => !x.archived);
    }
    async function archivedCars({ uid = required('uid') }) {
        let result = await allCars({ uid });
        return result.filter(x => x.archived);
    }

    async function allCars({ uid = required('uid') }) {
        return await cars(uid).getAll();
    }

    async function archive({ uid = requried('uid'), id = required('id') }) {
        await cars(uid).update(id, { archived: true });
    }
    async function unarchive({ uid = requried('uid'), id = required('id') }) {
        await cars(uid).update(id, { archived: false });
    }

    async function add({
        uid = required('uid'),
        brand = required('brand'),
        model = required('model'),
        type = required('type'),
        number = required('number'),
        color = required('color'),
        image
    }) {
        const imageUrl = await storeImage(uid, image);
        return await cars(uid).create({
            brand,
            model,
            type,
            number,
            color,
            image: imageUrl,
            size: getSize(brand, model, type),
            archived: false,
            createTime: utcNowTimestamp(),
        })
    }

    async function storeImage(uid, img) {
        if (img) {
            const fileExtension = img.name.substr(img.name.lastIndexOf('.'));
            const imageRef = storageRef.child('images').child(uid).child(utcNowTimestamp() + fileExtension);
            const imageResponse = await imageRef.put(new Uint8Array(img.data));
            if (imageResponse.state === 'success')
                return await imageRef.getDownloadURL();
        }
        return await storageRef.child('public').child('car.jpg').getDownloadURL();
    }
}

module.exports = Cars(db);