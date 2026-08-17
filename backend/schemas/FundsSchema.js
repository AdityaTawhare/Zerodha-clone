const { Schema } = require("mongoose");

const FundsSchema = new Schema({
    availableMargin: Number,
    usedMargin: Number,
    availableCash: Number,
    openingBalance: Number,
    payin: Number,
    payout: Number,
    span: Number,
    deliveryMargin: Number,
    exposure: Number,
    optionsPremium: Number,
    collateralLiquid: Number,
    collateralEquity: Number,
    collateralEquity: Number,
    totalCollateral: Number,
    userId: {
        type: String,
        required: true,
        unique: true, // One fund account per user
    },
});

module.exports = { FundsSchema };
