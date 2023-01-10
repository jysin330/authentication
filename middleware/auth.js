const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {

    const token = req.cookies.token || req.body.token || req.header("authorization").replace("bearer ", "");

    if (!token) {
        return res.status(401).send("token is missing");

    }
    try {

        const decode = jwt.verify(token, process.env.SECRET_KEY)
        console.log(decode);
        req.user = decode;
        // bring in info from DB
    } catch (error) {
        console.log("invalid token")
    }
    return next();
}
module.exports = auth;