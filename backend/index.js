require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');

const { HoldingsModel } = require('./model/HoldingsModel');
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { FundsModel } = require("./model/FundsModel");
const { getOrders, newOrder } = require("./controllers/OrderController");
const priceEngine = require('./priceEngine');

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

const cookieParser = require("cookie-parser");
const authRoute = require("./routes/AuthRoute");
const { userVerification } = require("./middlewares/AuthMiddleware");

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/", authRoute);

app.get('/addHoldings', (req, res) => {
    let tempHoldings = [
        {
            name: "BHARTIARTL",
            qty: 2,
            avg: 538.05,
            price: 541.15,
            net: "+0.58%",
            day: "+2.99%",
        },
        {
            name: "HDFCBANK",
            qty: 2,
            avg: 1383.4,
            price: 1522.35,
            net: "+10.04%",
            day: "+0.11%",
        },
        {
            name: "HINDUNILVR",
            qty: 1,
            avg: 2335.85,
            price: 2417.4,
            net: "+3.49%",
            day: "+0.21%",
        },
        {
            name: "INFY",
            qty: 1,
            avg: 1350.5,
            price: 1555.45,
            net: "+15.18%",
            day: "-1.60%",
            isLoss: true,
        },
        {
            name: "ITC",
            qty: 5,
            avg: 202.0,
            price: 207.9,
            net: "+2.92%",
            day: "+0.80%",
        },
        {
            name: "KPITTECH",
            qty: 5,
            avg: 250.3,
            price: 266.45,
            net: "+6.45%",
            day: "+3.54%",
        },
        {
            name: "M&M",
            qty: 2,
            avg: 809.9,
            price: 779.8,
            net: "-3.72%",
            day: "-0.01%",
            isLoss: true,
        },
        {
            name: "RELIANCE",
            qty: 1,
            avg: 2193.7,
            price: 2112.4,
            net: "-3.71%",
            day: "+1.44%",
            isLoss: true,
        },
        {
            name: "SBIN",
            qty: 4,
            avg: 324.35,
            price: 430.2,
            net: "+32.63%",
            day: "-0.34%",
            isLoss: true,
        },
        {
            name: "SGBMAY29",
            qty: 2,
            avg: 4727.0,
            price: 4719.0,
            net: "-0.17%",
            day: "+0.15%",
        },
        {
            name: "TATAPOWER",
            qty: 5,
            avg: 104.2,
            price: 124.15,
            net: "+19.15%",
            day: "-0.24%",
            isLoss: true,
        },
        {
            name: "TCS",
            qty: 1,
            avg: 3041.7,
            price: 3194.8,
            net: "+5.03%",
            day: "-0.25%",
            isLoss: true,
        },
        {
            name: "WIPRO",
            qty: 4,
            avg: 489.3,
            price: 577.75,
            net: "+18.08%",
            day: "+0.32%",
        },
    ];

    tempHoldings.forEach((item) => {
        let newHolding = new HoldingsModel({
            name: item.name,
            qty: item.qty,
            avg: item.avg,
            price: item.price,
            net: item.net,
            day: item.day,
        });

        newHolding.save();
    });
    res.send("Done");
});

app.get("/addPositions", async (req, res) => {
    let tempPositions = [
        {
            product: "CNC",
            name: "EVEREADY",
            qty: 2,
            avg: 316.27,
            price: 312.35,
            net: "+0.58%",
            day: "-1.24%",
            isLoss: true,
        },
        {
            product: "CNC",
            name: "JUBLFOOD",
            qty: 1,
            avg: 3124.75,
            price: 3082.65,
            net: "+10.04%",
            day: "-1.35%",
            isLoss: true,
        },
    ];

    tempPositions.forEach((item) => {
        let newPosition = new PositionsModel({
            product: item.product,
            name: item.name,
            qty: item.qty,
            avg: item.avg,
            price: item.price,
            net: item.net,
            day: item.day,
            isLoss: item.isLoss,
        });

        newPosition.save();
    });
    res.send("Done!");
});

app.post("/updateFunds", userVerification, async (req, res) => {
    const { type, amount } = req.body;
    let funds = await FundsModel.findOne({ userId: req.user._id });

    // Auto-create if not exists
    if (!funds) {
        funds = new FundsModel({
            availableMargin: 0,
            usedMargin: 0,
            availableCash: 0,
            openingBalance: 0,
            payin: 0,
            payout: 0,
            span: 0,
            deliveryMargin: 0,
            exposure: 0,
            optionsPremium: 0,
            collateralLiquid: 0,
            collateralEquity: 0,
            totalCollateral: 0,
            userId: req.user._id,
        });
    }

    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    if (type === "ADD") {
        funds.availableMargin += val;
        funds.availableCash += val;
        funds.payin += val;
    } else if (type === "WITHDRAW") {
        if (funds.availableCash < val) {
            return res.status(400).json({ message: "Insufficient cash" });
        }
        funds.availableMargin -= val;
        funds.availableCash -= val;
        funds.payout += val;
    }

    await funds.save();
    res.json(funds);
});

app.get("/addFunds", async (req, res) => {
    const existingFunds = await FundsModel.findOne({});
    if (!existingFunds) {
        const newFunds = new FundsModel({
            availableMargin: 100000, // 1 Lakh initial
            usedMargin: 0,
            availableCash: 100000,
            openingBalance: 100000,
            payin: 0,
            payout: 0,
            span: 0,
            deliveryMargin: 0,
            exposure: 0,
            optionsPremium: 0,
            collateralLiquid: 0,
            collateralEquity: 0,
            totalCollateral: 0,
        });
        await newFunds.save();
        res.send("Funds initialized!");
    } else {
        res.send("Funds already exist!");
    }
});

app.get("/allHoldings", userVerification, async (req, res) => {
    let allHoldings = await HoldingsModel.find({ userId: req.user._id });
    res.json(allHoldings);
});

app.get("/allPositions", userVerification, async (req, res) => {
    let allPositions = await PositionsModel.find({ userId: req.user._id });
    res.json(allPositions);
});

app.get("/getFunds", userVerification, async (req, res) => {
    let funds = await FundsModel.findOne({ userId: req.user._id });
    if (!funds) {
        // Just return a default structure if not initialized to prevent frontend crash
        res.json({ availableMargin: 0, usedMargin: 0, availableCash: 0, openingBalance: 0 });
    } else {
        res.json(funds);
    }
});

app.get("/allOrders", userVerification, getOrders);
app.post("/newOrder", userVerification, newOrder);

// REST fallback: get all current stock prices
app.get("/stockPrices", (req, res) => {
    res.json(priceEngine.getAllPrices());
});

// GET real historical stock market data
app.get("/historicalData", async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    // Map to Yahoo ticker using the overrides or .NS suffix
    const overrides = {
        'HUL': 'HINDUNILVR.NS',
        'QUICKHEAL': 'QUICKHEAL.NS',
        'EVEREADY': 'EVEREADY.NS',
        'JUBLFOOD': 'JUBLFOOD.NS',
        'SGBMAY29': null,
    };
    const ticker = symbol in overrides ? overrides[symbol] : `${symbol}.NS`;
    
    if (!ticker) {
        // Return dummy historical data for symbols without a ticker
        const dummyData = [];
        const basePrice = 100;
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dummyData.push({
                date: date.toISOString().split('T')[0],
                close: basePrice + Math.sin(i * 0.5) * 5 + Math.random() * 2,
            });
        }
        return res.json(dummyData);
    }

    try {
        const yahooFinance = require('yahoo-finance2').default;
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 45); // last 45 calendar days, yielding ~30 trading days

        const queryOptions = {
            period1: start,
            period2: today,
            interval: '1d'
        };

        const result = await yahooFinance.historical(ticker, queryOptions);
        const formatted = result.map(quote => ({
            date: quote.date,
            close: quote.close
        }));
        res.json(formatted);
    } catch (err) {
        console.error(`[Backend] Historical fetch error for ${symbol}:`, err.message);
        // Fallback dummy data
        const dummyData = [];
        const basePrice = 100;
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dummyData.push({
                date: date.toISOString().split('T')[0],
                close: basePrice + Math.sin(i * 0.5) * 5 + Math.random() * 2,
            });
        }
        res.json(dummyData);
    }
});

// Create HTTP server from express app
const server = http.createServer(app);

// Create WebSocket server on the same port
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    priceEngine.addClient(ws);
});

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    mongoose.connect(uri).then(async () => {
        console.log("MongoDB connected successfully");
        // Start price engine after DB is ready
        await priceEngine.start();
    }).catch(err => {
        console.error("MongoDB connection failed:", err.message);
    });
});