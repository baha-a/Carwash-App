const config = require('../secrets/stripe.test.json');
const { required } = require('../helper/required');
const stripe = require("stripe")(config.secretKey);
const requestControler = require('./requests');

function Payments() {
    return Object.freeze({
        getPublicKey,
        createIntent,
        extractWebhookEvent,

        sendRefundRequest,

        handelPaymentSuccessed,
        handelPaymentFailed,
        handelRefundSuccessed,
        handelRefundFailed,

        // getMyCards,
        fakePayment,
    });

    function getPublicKey() {
        return config.publishableKey;
    }

    async function sendRefundRequest({ requestId = required('requestId') }) {
        const r = await requestControler.getFast({ id: requestId });

        if (r.paymentId) {
            const refund = await stripe.refunds.create({
                payment_intent: r.paymentId,
                // amount: 100 * 10 // to refund part of the charged money
            })

            await requestControler.refund({
                id: r.id,
                payload: {
                    refundId: refund.id,
                    amount: refund.amount,
                    currency: refund.currency,
                }
            });
        }
    }
    async function createIntent({ requestId = required('requestId') }) {
        const r = await requestControler.getFast({ id: requestId });
        if (!r || !r.exists)
            return { error: true, message: 'request not found' };
        if (r.isPaid === true)
            return { isPaid: true };

        const amount = Math.round(r.cost * 100);
        let paymentId = r.paymentId;

        if (!paymentId) {
            const pay = await stripe.paymentIntents.create({
                amount,
                currency: 'eur',
                metadata: { requestId: requestId }
            });
            paymentId = pay.client_secret;
            await requestControler.setPaymentId({ id: requestId, paymentId });
        }

        return {
            isPaid: false,
            paymentId,
            currency: 'eur',
            amount: amount / 100,
        }
    }

    function extractWebhookEvent({ rawBody = required('rawBody'), signature = required('signature') }) {
        return stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);
    }

    async function handelPaymentSuccessed({ metadata, charges }) {
        console.log("💰 Payment received! Fulfill any orders, e-mail receipts, etc");

        let requestId, receipt_url;
        try {
            requestId = metadata.requestId;
            receipt_url = charges.data[0].receipt_url;
        } catch (ex) { console.log('error webhook'); }

        if (!requestId)
            requestId = charges.data[0].metadata.requestId;

        await requestControler.markAsPaid({ id: requestId, payload: { receipt_url: receipt_url } });
    }

    async function handelPaymentFailed(data) {
    }
    async function handelRefundSuccessed(data) {
        // await requestControler.markAsRefunded({ }) //????
    }
    async function handelRefundFailed(data) {

    }


    async function fakePayment({ requestId = required('requestId') }) {
        await requestControler.markAsPaid({ id: requestId });
    }
}

module.exports = Payments()