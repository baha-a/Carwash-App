const router = require('express').Router();
const payments = require('../controllers/payments');
const requests = require('../controllers/requests');

const { onlyAuth, onlyAdmin } = require('../helper/auth');
const { extractMultipartFormData } = require('../helper/multipart');

router.get('/mine/', onlyAuth, async (req, res) => {
    res.status(200).json(await requests.getMine({ uid: req.user.uid }));
});
router.get('/forme/', onlyAuth, async (req, res) => {
    res.status(200).json(await requests.getForMe({ uid: req.user.uid }));
});

router.get('/:id', onlyAuth, async (req, res) => {
    res.status(200).json(await requests.get({ id: req.params.id }));
});
router.get('/:id/states', onlyAuth, async (req, res) => {
    res.status(200).json(await requests.getStates({ id: req.params.id }));
});
router.get('/:id/chats/:limit?', onlyAuth, async (req, res) => {
    res.status(200).json(await requests.getChats({
        id: req.params.id,
        limit: req.params.limit
    }));
});

router.post('/:id/reject', onlyAuth, async (req, res) => {
    await requests.reject({
        id: req.params.id,
        uid: req.user.uid,
        note: req.body.note,
    });
    await payments.sendRefundRequest({ requestId: req.params.id });
    res.sendStatus(200);
});

router.post('/:id/accept', onlyAuth, async (req, res) => {
    await requests.accept({
        id: req.params.id,
        uid: req.user.uid,
    })
    res.sendStatus(200);
});

router.post('/:id/cancel', onlyAuth, async (req, res) => {
    await requests.cancel({
        id: req.params.id,
        uid: req.user.uid,
        note: req.body.note,
    });
    await payments.sendRefundRequest({ requestId: req.params.id });
    res.sendStatus(200);
});

router.post('/', onlyAuth, async (req, res) => {
    await requests.create({
        washer: req.body.washer,
        address: req.body.address,
        myLocation: req.body.myLocation,
        time: req.body.time,
        cars: req.body.cars,
        services: req.body.services,
        note: req.body.note,

        client: req.user.uid,
    });
    res.sendStatus(200);
});


router.post('/:id/chats/txt', onlyAuth, async (req, res) => {
    await requests.addMessageToChat({
        id: req.params.id,
        uid: req.user.uid,
        content: req.body.content,
        contentType: requests.msgContentTypes.text,
    })
    res.sendStatus(200);
});
router.post('/:id/chats/img', onlyAuth, async (req, res) => {
    const { uploads } = await extractMultipartFormData(req);
    await requests.addMessageToChat({
        id: req.params.id,
        uid: req.user.uid,
        content: uploads.img,
        contentType: requests.msgContentTypes.image,
    })
    res.sendStatus(200);
});

router.post('/:id/start', onlyAuth, async (req, res) => {
    const { fields, uploads } = await extractMultipartFormData(req);

    await requests.start({
        id: req.params.id,
        uid: req.user.uid,
        note: fields.note,
        imgs: [uploads.img1, uploads.img2, uploads.img3],
    })
    res.sendStatus(200);
});
router.post('/:id/complete', onlyAuth, async (req, res) => {
    const { fields, uploads } = await extractMultipartFormData(req);

    await requests.complete({
        id: req.params.id,
        uid: req.user.uid,
        note: fields.note,
        imgs: [uploads.img1, uploads.img2, uploads.img3],
    })
    res.sendStatus(200);
});


router.get('/', onlyAdmin, async (req, res) => {
    res.status(200).json(await requests.getAll());
});


module.exports = router;
