const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.userVerification = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ status: false, message: "No token provided" });
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false, message: "Token verification failed" });
        } else {
            const user = await User.findById(data.id);
            if (user) {
                req.user = user; // Attach user to request object
                next();
            } else {
                return res.json({ status: false, message: "User not found" });
            }
        }
    });
};
