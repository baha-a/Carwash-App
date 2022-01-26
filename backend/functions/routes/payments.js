const router = require('express').Router();

const { onlyAuth } = require('../helper/auth');
const paymentControler = require('../controllers/payments');


router.get("/public-key", (req, res) => {
    res.status(200).send({ publicKey: paymentControler.getPublicKey() });
});

router.post("/create-payment-intent/:id", onlyAuth, async (req, res) => {
    const result = await paymentControler.createIntent({ requestId: req.params.id });
    if (result.error)
        res.status(400).json({ success: false, message: result.message });
    else if (result.isPaid)
        res.status(200).json({ isPaid: true });
    else
        res.status(200).json(result);
});

router.post("/fake-payment/:id", onlyAuth, async (req, res) => {
    await paymentControler.fakePayment({ requestId: req.params.id });
    res.sendStatus(200);
});

router.post('/webhook', async (req, res) => {
    const event = paymentControler.extractWebhookEvent(req.rawBody, req.headers["stripe-signature"]);

    if (event.type === "payment_intent.succeeded") {
        paymentControler.handelPaymentSuccessed(event.data.object);
        console.log("Payment successed");
    }

    else if (event.type === "payment_intent.payment_failed") {
        paymentControler.handelPaymentFailed(event.data.object);
        console.log("Payment failed. Notify the customer that their order was not fulfilled");
    }
    else if (event.type === "charge.refunded") {
        paymentControler.handelRefundSuccessed(event.data.object);
        console.log("Payment refunded.");
    }
    else if (event.type === "charge.refund.updated") {
        paymentControler.handelRefundFailed(event.data.object);
        console.log("Payment refund failed for some reason!.");
    } else {
        console.log('🤔 unkowen webhook')
        console.log(event.type);
        console.log(event)
    }


    res.sendStatus(200);
});

module.exports = router;
