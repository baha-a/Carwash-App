const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');

const extractMultipartFormData = (req) => {
    return new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            return reject(Error(405));
        } else {
            const busboy = new Busboy({ headers: req.headers });
            const tmpdir = os.tmpdir();
            const fields = {};
            const fileWrites = [];
            const uploads = {};

            busboy.on('field', (fieldname, val, _, __, ___, mimetype) => {
                if (val === 'undefined')
                    fields[fieldname] = undefined;
                else
                    fields[fieldname] = val;
            });

            busboy.on('file', (fieldname, file, filename) => {
                const filepath = path.join(tmpdir, filename);
                const writeStream = fs.createWriteStream(filepath);

                uploads[fieldname] = { path: filepath, originalName: filename };

                file.pipe(writeStream);

                const promise = new Promise((resolve, reject) => {
                    file.on('end', () => {
                        writeStream.end();
                    });
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                fileWrites.push(promise);
            });

            busboy.on('finish', async () => {
                const result = { fields, uploads: {} };

                await Promise.all(fileWrites);

                for (const file in uploads) {
                    const { path, originalName } = uploads[file];

                    result.uploads[file] = { name: originalName, data: fs.readFileSync(path) };
                    fs.unlinkSync(path);
                }

                resolve(result);
            });

            busboy.on('error', reject);

            if (req.rawBody) {
                busboy.end(req.rawBody);
            } else {
                req.pipe(busboy);
            }

            return null;
        }
    });
};

module.exports.extractMultipartFormData = extractMultipartFormData;