'use strict';

const express = require('express');
require('express-async-errors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const functions = require('firebase-functions');
global.XMLHttpRequest = require('xhr2');

const app = express();

app.use(cookieParser());
app.use(cors({ credentials: true, origin: '*' }));
app.use(express.json({
    verify: (req, res, buf) => {
        if (req.originalUrl.endsWith('/webhook'))
            req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true }));

app.use('/clients/', require('./routes/clients'));
app.use('/washers/', require('./routes/washers'));
app.use('/requests/', require('./routes/requests'));
app.use('/payments/', require('./routes/payments'));
app.use('/settings/', require('./routes/settings'));

app.use((req, res, next) => {
    res.status(404).json({ error: 'route not found' });
});

app.use((err, req, res, next) => {
    console.log('error: ', err);
    res.status(400).json({ error: err.message });
});

module.exports.api = functions
    .region('europe-west1')
    .https
    .onRequest(app);
