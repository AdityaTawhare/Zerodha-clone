const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
    name: String,
    qty: Number,
    price: Number,
    triggerPrice: Number,
    stopLoss: Number,
    target: Number,
    mode: String, // BUY / SELL
    product: String, // CNC / MIS / NRML
    orderType: String, // LIMIT / MARKET / SL / SL-M
    status: String, // PENDING / EXECUTED / REJECTED
    validity: String, // DAY / IOC
    date: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: String,
        required: true,
    },
});

module.exports = { OrdersSchema };