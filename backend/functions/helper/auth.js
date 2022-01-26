const { admin, db } = require("./data");

const extractToken = ({ cookies, headers }) => {
    if (cookies.token) {
        return cookies.token;
    }

    if (headers.authorization) {
        const tokens = headers.authorization.split(' ');
        if (tokens.length > 1 && tokens[0] === "Bearer")
            return tokens[1];
    }
    return null;
}

const onlyAuth = function (req, res, next) {
    const token = extractToken(req);
    if (!token)
        return res.status(401).send({ message: "no access token" });

    return admin.auth().verifyIdToken(token).then((decodedToken) => {
        req.user = decodedToken;
        return next();
    }).catch(() => res.status(401).send({ message: "Could not authorize" }));
}

const onlyAdmin = function (req, res, next) {
    onlyAuth(req, res, async () => {
        try {
            if (req.user) {
                const user = await db.clients.getById(req.user.uid);
                if (user.role === 'admin') {
                    req.user.isAdmin = true;
                    return next();
                }
            }
        } catch (err) {
            console.log(err)
        }

        return res.send({ message: "Unauthorized access" }).status(403)
    });
}

module.exports.onlyAuth = onlyAuth;
module.exports.onlyAdmin = onlyAdmin;
module.exports.extractToken = extractToken;
