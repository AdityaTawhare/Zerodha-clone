const User = require("../model/UserModel");
const { FundsModel } = require("../model/FundsModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.Signup = async (req, res, next) => {
    try {
        const { email, password, username, createdAt } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists" });
        }
        const user = await User.create({ email, password, username, createdAt });

        // Auto-create funds for new user with ₹1,00,000 starting balance
        const existingFunds = await FundsModel.findOne({ userId: user._id });
        if (!existingFunds) {
            await FundsModel.create({
                availableMargin: 100000,
                usedMargin: 0,
                availableCash: 100000,
                openingBalance: 100000,
                payin: 100000,
                payout: 0,
                span: 0,
                deliveryMargin: 0,
                exposure: 0,
                optionsPremium: 0,
                collateralLiquid: 0,
                collateralEquity: 0,
                totalCollateral: 0,
                userId: user._id,
            });
        }

        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res
            .status(201)
            .json({ message: "User signed in successfully", success: true, user });
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error connecting to DB" });
    }
};

module.exports.Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "Incorrect password or email" });
        }
        const auth = await bcrypt.compare(password, user.password);
        if (!auth) {
            return res.json({ message: "Incorrect password or email" });
        }
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });
        res
            .status(201)
            .json({ message: "User logged in successfully", success: true });
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error connecting to DB" });
    }
};

module.exports.Logout = (req, res) => {
    res.clearCookie("token", {
        withCredentials: true,
        httpOnly: false,
    });
    res.status(200).json({ message: "Logged out successfully", success: true });
};

module.exports.userVerification = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ status: false });
    }
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false });
        } else {
            const user = await User.findById(data.id);
            if (user) return res.json({ status: true, user: user.username });
            else return res.json({ status: false });
        }
    });
};
