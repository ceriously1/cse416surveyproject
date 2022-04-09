const jwt = require('jsonwebtoken');

// Add authentification to routes by doing:
// const checkAuth = require("path_to_this_file");
// router.method("path", checkAuth, etc);

module.exports = (req, res, next) => {
    try {
        // notice that the client has to include the encoded token as a header
        // we include it as a header because the body won't necessarily be parsed before this module is called
        // format in header is "Bearer {token}" ! it is the responsibility of the client to arrange this
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "super_secret_omega_key");
        // creating new field in req so we can access the decoded token (which gives identifying information)
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Authentification failed"
        });
    }
};