const { OrdersModel } = require("../model/OrdersModel");
const { HoldingsModel } = require("../model/HoldingsModel");
const { PositionsModel } = require("../model/PositionsModel");
const { FundsModel } = require("../model/FundsModel");

module.exports.getOrders = async (req, res) => {
    const userId = req.user._id;
    const allOrders = await OrdersModel.find({ userId }).sort({ date: -1 });
    res.json(allOrders);
};


module.exports.newOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            name,
            qty,
            price,
            mode, // "BUY" or "SELL"
            product, // "CNC", "MIS", "NRML"
            orderType, // "MARKET", "LIMIT", "SL", "SL-M"
            validity, // "DAY", "IOC"
            triggerPrice,
            stopLoss, // percentage e.g. 2
            target // percentage e.g. 5
        } = req.body;

        const priceEngine = require("../priceEngine");
        const livePrice = priceEngine.getAllPrices().stocks[name]?.price || price;

        // Fetch Funds
        const funds = await FundsModel.findOne({ userId });
        if (!funds) {
            return res.status(400).json({ message: "Funds not initialized. Please contact support." });
        }

        let status = "EXECUTED";
        let executionPrice = price;

        if (orderType === "MARKET") {
            executionPrice = livePrice;
        } else if (orderType === "LIMIT") {
            if (mode === "BUY" && price < livePrice) {
                status = "PENDING";
            } else if (mode === "SELL" && price > livePrice) {
                status = "PENDING";
            } else {
                executionPrice = price;
            }
        } else if (orderType === "SL" || orderType === "SL-M") {
            status = "PENDING";
        }

        const requiredAmount = qty * executionPrice;

        // Validate Funds on Order Entry
        if (mode === "BUY") {
            const entryCost = qty * (orderType === "MARKET" ? livePrice : (orderType === "SL" || orderType === "SL-M" ? triggerPrice : price));
            if (funds.availableMargin < entryCost) {
                return res.status(400).json({ message: "Insufficient funds" });
            }
        }

        // Create Order Log
        const newOrder = new OrdersModel({
            name,
            qty,
            price: orderType === "MARKET" ? livePrice : price,
            triggerPrice: (orderType === "SL" || orderType === "SL-M") ? triggerPrice : undefined,
            stopLoss: stopLoss ? Number(stopLoss) : undefined,
            target: target ? Number(target) : undefined,
            mode,
            product,
            orderType,
            status,
            validity,
            userId,
        });
        await newOrder.save();

        // Strategy Execution based on Product Type
        if (status === "EXECUTED") {
            if (product === "CNC") {
                await handleCNCTrade(mode, name, qty, executionPrice, userId);
            } else if (product === "MIS" || product === "NRML") {
                await handleMISTrade(mode, name, qty, executionPrice, product, userId);
            }

            // Update Funds
            if (mode === "BUY") {
                funds.availableMargin -= requiredAmount;
                funds.availableCash -= requiredAmount;
                funds.usedMargin += requiredAmount;
                await funds.save();
            } else if (mode === "SELL") {
                funds.availableMargin += requiredAmount;
                funds.availableCash += requiredAmount;
                funds.usedMargin -= requiredAmount;
                if (funds.usedMargin < 0) funds.usedMargin = 0;
                await funds.save();
            }

            // Create GTT Target & Stoploss Counter Orders
            if (stopLoss) {
                const slTrigger = mode === "BUY"
                    ? executionPrice * (1 - Number(stopLoss) / 100)
                    : executionPrice * (1 + Number(stopLoss) / 100);
                const slOrder = new OrdersModel({
                    name,
                    qty,
                    price: parseFloat(slTrigger.toFixed(2)),
                    triggerPrice: parseFloat(slTrigger.toFixed(2)),
                    mode: mode === "BUY" ? "SELL" : "BUY",
                    product,
                    orderType: "SL",
                    status: "PENDING",
                    validity: "DAY",
                    userId,
                });
                await slOrder.save();
            }

            if (target) {
                const targetLimit = mode === "BUY"
                    ? executionPrice * (1 + Number(target) / 100)
                    : executionPrice * (1 - Number(target) / 100);
                const targetOrder = new OrdersModel({
                    name,
                    qty,
                    price: parseFloat(targetLimit.toFixed(2)),
                    mode: mode === "BUY" ? "SELL" : "BUY",
                    product,
                    orderType: "LIMIT",
                    status: "PENDING",
                    validity: "DAY",
                    userId,
                });
                await targetOrder.save();
            }
        } else {
            // Block funds immediately for pending buy orders
            if (mode === "BUY") {
                const blockedAmount = qty * (orderType === "SL" || orderType === "SL-M" ? triggerPrice : price);
                funds.availableMargin -= blockedAmount;
                funds.availableCash -= blockedAmount;
                funds.usedMargin += blockedAmount;
                await funds.save();
            }
        }

        res.json({ message: "Order Saved!", orderId: newOrder._id });
    } catch (error) {
        console.error("Error creating order:", error);
        if (error.message && (error.message.includes("Cannot sell") || error.message.includes("Insufficient"))) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Error creating order" });
    }
};

// Helper: Handle Delivery (CNC) Logic (Holdings)
async function handleCNCTrade(mode, name, qty, price, userId) {
    const existingHolding = await HoldingsModel.findOne({ name, userId });

    if (mode === "BUY") {
        if (existingHolding) {
            const newQty = existingHolding.qty + qty;
            const newAvg = ((existingHolding.avg * existingHolding.qty) + (price * qty)) / newQty;
            existingHolding.qty = newQty;
            existingHolding.avg = newAvg;
            await existingHolding.save();
        } else {
            const newHolding = new HoldingsModel({
                name,
                qty,
                avg: price,
                price, // LTP
                net: "0.00%",
                day: "0.00%",
                userId,
            });
            await newHolding.save();
        }
    } else if (mode === "SELL") {
        if (!existingHolding) {
            throw new Error(`Cannot sell ${name}: You don't own this stock.`);
        }
        if (qty > existingHolding.qty) {
            throw new Error(`Cannot sell ${qty} shares of ${name}: You only own ${existingHolding.qty}.`);
        }

        const newQty = existingHolding.qty - qty;
        if (newQty <= 0) {
            await HoldingsModel.deleteOne({ name, userId });
        } else {
            existingHolding.qty = newQty;
            await existingHolding.save();
        }
    }
}

// Helper: Handle Intraday (MIS/NRML) Logic (Positions)
async function handleMISTrade(mode, name, qty, price, product, userId) {
    let existingPosition = await PositionsModel.findOne({ name, product, userId });

    if (!existingPosition) {
        if (mode === "BUY") {
            const newPosition = new PositionsModel({
                product,
                name,
                qty,
                avg: price,
                price,
                net: "0.00%",
                day: "0.00%",
                isLoss: false,
                userId,
            });
            await newPosition.save();
        } else {
            // Shorting logic (selling without owning position first)
            const newPosition = new PositionsModel({
                product,
                name,
                qty: qty,
                avg: price,
                price,
                net: "0.00%",
                day: "0.00%",
                isLoss: false,
                userId,
            });
            await newPosition.save();
        }
        return;
    }

    if (mode === "BUY") {
        const newQty = existingPosition.qty + qty;
        const newAvg = ((existingPosition.avg * existingPosition.qty) + (price * qty)) / newQty;
        existingPosition.qty = newQty;
        existingPosition.avg = newAvg;
        await existingPosition.save();
    } else {
        // SELL
        const newQty = existingPosition.qty - qty;
        if (newQty <= 0) {
            await PositionsModel.deleteOne({ name, product, userId });
        } else {
            existingPosition.qty = newQty;
            await existingPosition.save();
        }
    }
}
