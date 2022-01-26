const router = require('express').Router();

const services = require('../controllers/services');
const washers = require('../controllers/washers');
const { onlyAuth, onlyAdmin } = require('../helper/auth');

router.get('/:id', async (req, res) => {
    res.status(200).json(await washers.get({ id: req.params.id }));
});

router.post('/:id/available', onlyAuth, async (req, res) => {
    await washers.setAvailable({ id: req.params.id });
    res.sendStatus(200);
});

router.post('/:id/unavailable', onlyAuth, async (req, res) => {
    await washers.setUnavailable({ id: req.params.id });
    res.sendStatus(200);
});

router.get('/available/:type?', async (req, res) => {
    const results = await washers.getAvailablesByType({
        type: req.params.type,
    });
    res.status(200).json(results);
});

router.get('/near/:type/:lat/:lng/:limit?', async (req, res) => {
    res.status(200).json(await washers.near({
        type: req.params.type,

        lat: req.params.lat,
        lng: req.params.lng,
        limit: req.params.limit || 10,
    }));
});

router.get('/:id/freetime', async (req, res) => {
    res.status(200).json(await washers.getFreetime({
        id: req.params.id,
    }));
});

router.get('/:id/services', async (req, res) => {
    res.status(200).json(await services.get({
        washerId: req.params.id
    }));
});

router.post('/:id/services', onlyAdmin, async (req, res) => {
    const newService = await services.add({
        washerId: req.params.id,

        title: req.body.title,
        desc: req.body.desc,
        duration: req.body.duration,
        type: req.body.type,
        order: req.body.order,
        price: req.body.price,
        enabled: req.body.enabled === true,
    });

    res.status(200).json(newService);
});


router.post('/:id/services/:serviceId', onlyAdmin, async (req, res) => {
    const newService = await services.update({
        washerId: req.params.id,
        serviceId: req.params.serviceId,

        title: req.body.title,
        desc: req.body.desc,
        duration: req.body.duration,
        type: req.body.type,
        order: req.body.order,
        price: req.body.price,
        enabled: req.body.enabled === true,
    });

    res.status(200).json(newService);
});

router.get('/', onlyAdmin, async (req, res) => {
    res.status(200).json(await washers.getAll());
});

router.post('/', onlyAdmin, async (req, res) => {
    const {
        address,
        openHour,
        closeHour,
        name,
        photo,
        workDays,
        location,
        type,
        uid
    } = req.body;

    await washers.add({
        uid,
        address,
        openHour,
        closeHour,
        name,
        photo,
        workDays,
        location,
        type,
    })
    res.status(200).json();
});

module.exports = router;
