const router = require('express').Router();

const { onlyAuth } = require('../helper/auth');
const { extractMultipartFormData } = require('../helper/multipart');

const accounts = require('../controllers/accounts');
const cars = require('../controllers/cars');
const { clean } = require('../helper/required');


router.get('/info', onlyAuth, async (req, res) => {
    res.status(200).json(await accounts.get({ uid: req.user.uid }));
});

router.post('/info', onlyAuth, async (req, res) => {
    await accounts.updateInfo({
        uid: req.user.uid,
        info: clean(req.body),
    });
    res.sendStatus(200);
});


router.post('/pushToken/remove', onlyAuth, async (req, res) => {
    await accounts.removePushToken({ uid: req.user.uid });
    res.sendStatus(200);
});

router.post('/pushToken', onlyAuth, async (req, res) => {
    await accounts.updatePushToken({
        uid: req.user.uid,
        pushToken: req.body.token,
    });
    res.sendStatus(200);
});


router.get('/news/unreaded', onlyAuth, async (req, res) => {
    const news = req.query.onlyNew === 'true'
        ? await accounts.getUnreadedNews({ uid: req.user.uid })
        : await accounts.getNews({ uid: req.user.uid });

    await accounts.markAllAsReaded({
        uid: req.user.uid,
        ids: news.filter(x => !x.readed).map(x => x.id),
    });
    res.status(200).json(news);
});

router.post('/news/readed/:id', onlyAuth, async (req, res) => {
    await accounts.markAsReaded({
        uid: req.user.uid,
        id: req.params.id
    });
    res.sendStatus(200);
});

router.get('/cars', onlyAuth, async (req, res) => {
    res.status(200).json(await cars.allCars({ uid: req.user.uid }));
});

router.get('/cars/archived', onlyAuth, async (req, res) => {
    res.status(200).json(await cars.archivedCars({ uid: req.user.uid }));
});

router.get('/cars/unarchived', onlyAuth, async (req, res) => {
    res.status(200).json(await cars.unarchivedCars({ uid: req.user.uid }));
});

router.post('/cars/:id/archive', onlyAuth, async (req, res) => {
    await cars.archive({
        uid: req.user.uid,
        id: req.params.id
    });
    res.sendStatus(200);
});

router.post('/cars/:id/unarchive', onlyAuth, async (req, res) => {
    await cars.unarchive({
        uid: req.user.uid,
        id: req.params.id
    });
    res.sendStatus(200);
});

router.post('/cars/', onlyAuth, async (req, res) => {
    const { fields, uploads } = await extractMultipartFormData(req);

    await cars.add({
        uid: req.user.uid,
        brand: fields.brand,
        model: fields.model,
        type: fields.type,
        color: fields.color,
        number: fields.number,
        image: uploads.image,
    });
    res.sendStatus(200);
});

router.get('/cars/brands', async (req, res) => {
    res.status(200).json(await cars.getBrands());
});

router.get('/cars/brands/:brand/models', async (req, res) => {
    res.status(200).json(await cars.getModels(req.params.brand));
});

router.get('/cars/brands/:brand/models/:model/types', async (req, res) => {
    res.status(200).json(await cars.getTypes(req.params.brand, req.params.model));
});


module.exports = router;