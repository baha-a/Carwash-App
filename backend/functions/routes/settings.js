const router = require('express').Router();
const { onlyAuth } = require('../helper/auth');
const { extractMultipartFormData } = require('../helper/multipart');

// router.get('/languages', async (req, res) => {
//     const data = await languages.getAll();
//     res.status(200).json(data);
// });

// router.get('/currencies', async (req, res) => {
//     const data = await currency.getAll();
//     res.status(200).json(data);
// });

// router.post('/currencies/:code/:rate', onlyAdmin, async (req, res) => {
//     await currency.updateRate(req.params);
//     res.status(200).json({ success: true });
// });

module.exports = router;