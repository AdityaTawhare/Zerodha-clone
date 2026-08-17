/**
 * Price Engine — Zerodha Clone
 *
 * Strategy:
 * 1. On startup, fetch REAL current prices from Yahoo Finance (.NS suffix = NSE)
 * 2. Every 2 seconds: apply a realistic random walk to simulate live ticks
 * 3. Every 5 minutes: re-fetch real prices from Yahoo Finance to stay anchored
 * 4. Broadcast all price updates to connected WebSocket clients
 *
 * 100% free — no API key required.
 */

const yahooFinance = require('yahoo-finance2').default;
const { OrdersModel } = require("./model/OrdersModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { FundsModel } = require("./model/FundsModel");

// All stocks tracked across watchlist + common holdings
const STOCK_SYMBOLS = [
    'INFY', 'ONGC', 'TCS', 'KPITTECH', 'QUICKHEAL',
    'WIPRO', 'RELIANCE', 'HDFCBANK', 'ITC',
    'BHARTIARTL', 'HINDUNILVR', 'SBIN', 'TATAPOWER',
    'EVEREADY', 'JUBLFOOD', 'HUL', 'SGBMAY29',
];

// In-memory price store: { SYMBOL: { price, change, changePercent, prevClose, isDown } }
let priceStore = {};
let indexStore = { NIFTY: null, SENSEX: null };

// Connected WebSocket clients set
let clients = new Set();

/**
 * Map local symbol names to Yahoo Finance tickers
 */
function toYahooTicker(symbol) {
    const overrides = {
        'HUL': 'HINDUNILVR.NS',
        'QUICKHEAL': 'QUICKHEAL.NS',
        'EVEREADY': 'EVEREADY.NS',
        'JUBLFOOD': 'JUBLFOOD.NS',
        'SGBMAY29': null, // Sovereign Gold Bond - no public Yahoo ticker
    };
    if (symbol in overrides) return overrides[symbol];
    return `${symbol}.NS`;
}

/**
 * Fetch real prices from Yahoo Finance for all tracked symbols
 */
async function fetchRealPrices() {
    console.log('[PriceEngine] Fetching real prices from Yahoo Finance...');

    const fallbackPrices = {
        'INFY': 1555.45, 'ONGC': 116.8, 'TCS': 3194.8, 'KPITTECH': 266.45,
        'QUICKHEAL': 308.55, 'WIPRO': 577.75, 'RELIANCE': 2112.4,
        'HDFCBANK': 1522.35, 'ITC': 207.9, 'BHARTIARTL': 541.15,
        'HINDUNILVR': 2417.4, 'SBIN': 430.2, 'TATAPOWER': 124.15,
        'EVEREADY': 312.35, 'JUBLFOOD': 3082.65, 'HUL': 512.4, 'SGBMAY29': 4719.0,
    };

    await Promise.allSettled(
        STOCK_SYMBOLS.map(async (symbol) => {
            const ticker = toYahooTicker(symbol);
            if (!ticker) {
                // Use fallback for no-ticker symbols
                if (!priceStore[symbol] && fallbackPrices[symbol]) {
                    const price = fallbackPrices[symbol];
                    priceStore[symbol] = { price, prevClose: price, change: 0, changePercent: 0, isDown: false };
                }
                return;
            }

            try {
                const quote = await yahooFinance.quote(ticker);
                if (quote && quote.regularMarketPrice) {
                    const price = quote.regularMarketPrice;
                    const prevClose = quote.regularMarketPreviousClose || price;
                    const change = quote.regularMarketChange || 0;
                    const changePercent = quote.regularMarketChangePercent || 0;

                    priceStore[symbol] = {
                        price: parseFloat(price.toFixed(2)),
                        prevClose: parseFloat(prevClose.toFixed(2)),
                        change: parseFloat(change.toFixed(2)),
                        changePercent: parseFloat(changePercent.toFixed(2)),
                        isDown: change < 0,
                    };
                }
            } catch (err) {
                console.warn(`[PriceEngine] Could not fetch ${symbol} (${ticker}): ${err.message}`);
                // Use fallback if this symbol hasn't been seeded yet
                if (!priceStore[symbol] && fallbackPrices[symbol]) {
                    const price = fallbackPrices[symbol];
                    priceStore[symbol] = { price, prevClose: price, change: 0, changePercent: 0, isDown: false };
                }
            }
        })
    );

    const fetched = Object.keys(priceStore).length;
    console.log(`[PriceEngine] Price store has ${fetched} symbols.`);
}

/**
 * Fetch index data (NIFTY 50 & SENSEX)
 */
async function fetchIndexPrices() {
    try {
        const niftyQuote = await yahooFinance.quote('^NSEI');
        if (niftyQuote && niftyQuote.regularMarketPrice) {
            indexStore.NIFTY = {
                price: niftyQuote.regularMarketPrice,
                prevClose: niftyQuote.regularMarketPreviousClose || niftyQuote.regularMarketPrice,
                change: niftyQuote.regularMarketChange || 0,
                changePercent: niftyQuote.regularMarketChangePercent || 0,
                isDown: (niftyQuote.regularMarketChange || 0) < 0,
            };
        }
    } catch (e) {
        console.warn('[PriceEngine] Could not fetch NIFTY:', e.message);
    }

    if (!indexStore.NIFTY) {
        // Fallback seed
        indexStore.NIFTY = {
            price: 22045.15,
            prevClose: 22030.00,
            change: 15.15,
            changePercent: 0.07,
            isDown: false
        };
    }

    try {
        const sensexQuote = await yahooFinance.quote('^BSESN');
        if (sensexQuote && sensexQuote.regularMarketPrice) {
            indexStore.SENSEX = {
                price: sensexQuote.regularMarketPrice,
                prevClose: sensexQuote.regularMarketPreviousClose || sensexQuote.regularMarketPrice,
                change: sensexQuote.regularMarketChange || 0,
                changePercent: sensexQuote.regularMarketChangePercent || 0,
                isDown: (sensexQuote.regularMarketChange || 0) < 0,
            };
        }
    } catch (e) {
        console.warn('[PriceEngine] Could not fetch SENSEX:', e.message);
    }

    if (!indexStore.SENSEX) {
        // Fallback seed
        indexStore.SENSEX = {
            price: 72568.20,
            prevClose: 72580.65,
            change: -12.45,
            changePercent: -0.02,
            isDown: true
        };
    }
}

/**
 * Check if Indian market is currently open (9:15 AM - 3:30 PM IST, Mon-Fri)
 */
function isMarketOpen() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + istOffset);

    const day = ist.getUTCDay(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) return false;

    const hours = ist.getUTCHours();
    const minutes = ist.getUTCMinutes();
    const timeInMinutes = hours * 60 + minutes;

    return timeInMinutes >= (9 * 60 + 15) && timeInMinutes <= (15 * 60 + 30);
}

/**
 * Apply realistic random walk to simulate live market ticks.
 * Volatility: ±0.05% to ±0.30% per tick (2 seconds) when market is open.
 * Includes mean-reversion to prevent runaway prices.
 */
function applyPriceTick() {
    const marketOpen = isMarketOpen();
    if (!marketOpen) return; // Keep prices static when the market is closed

    Object.keys(priceStore).forEach(symbol => {
        const stock = priceStore[symbol];

        const maxVolatility = marketOpen ? 0.003 : 0.0003;
        const minVolatility = marketOpen ? 0.0005 : 0.00005;

        // Mean-reversion: gently pull price back toward prevClose
        const deviation = (stock.price - stock.prevClose) / stock.prevClose;
        const meanReversion = -deviation * 0.01;

        const volatility = minVolatility + Math.random() * (maxVolatility - minVolatility);
        const direction = Math.random() > 0.5 ? 1 : -1;
        const tickPercent = direction * volatility + meanReversion;

        const newPrice = Math.max(0.01, stock.price * (1 + tickPercent));
        const change = newPrice - stock.prevClose;
        const changePercent = (change / stock.prevClose) * 100;

        priceStore[symbol] = {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            isDown: change < 0,
        };
    });

    // Tick NIFTY 50
    if (indexStore.NIFTY) {
        const index = indexStore.NIFTY;
        const maxVolatility = marketOpen ? 0.0008 : 0.00008;
        const minVolatility = marketOpen ? 0.0001 : 0.00001;
        const deviation = (index.price - index.prevClose) / index.prevClose;
        const meanReversion = -deviation * 0.01;
        const volatility = minVolatility + Math.random() * (maxVolatility - minVolatility);
        const direction = Math.random() > 0.5 ? 1 : -1;
        const tickPercent = direction * volatility + meanReversion;
        const newPrice = Math.max(10, index.price * (1 + tickPercent));
        const change = newPrice - index.prevClose;
        const changePercent = (change / index.prevClose) * 100;
        indexStore.NIFTY = {
            ...index,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            isDown: change < 0,
        };
    }

    // Tick SENSEX
    if (indexStore.SENSEX) {
        const index = indexStore.SENSEX;
        const maxVolatility = marketOpen ? 0.0008 : 0.00008;
        const minVolatility = marketOpen ? 0.0001 : 0.00001;
        const deviation = (index.price - index.prevClose) / index.prevClose;
        const meanReversion = -deviation * 0.01;
        const volatility = minVolatility + Math.random() * (maxVolatility - minVolatility);
        const direction = Math.random() > 0.5 ? 1 : -1;
        const tickPercent = direction * volatility + meanReversion;
        const newPrice = Math.max(10, index.price * (1 + tickPercent));
        const change = newPrice - index.prevClose;
        const changePercent = (change / index.prevClose) * 100;
        indexStore.SENSEX = {
            ...index,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            isDown: change < 0,
        };
    }

    // Check and execute pending GTT/SL/Limit orders
    checkPendingOrders(priceStore);
}

/**
 * Check and execute pending orders based on live prices
 */
async function checkPendingOrders(stocks) {
    try {
        const pendingOrders = await OrdersModel.find({ status: "PENDING" });
        if (pendingOrders.length === 0) return;

        for (const order of pendingOrders) {
            const stockPriceData = stocks[order.name];
            if (!stockPriceData) continue;
            
            const livePrice = stockPriceData.price;
            let shouldExecute = false;

            if (order.mode === "BUY") {
                if (order.orderType === "LIMIT" && livePrice <= order.price) {
                    shouldExecute = true;
                } else if ((order.orderType === "SL" || order.orderType === "SL-M") && livePrice >= order.triggerPrice) {
                    shouldExecute = true;
                }
            } else if (order.mode === "SELL") {
                if (order.orderType === "LIMIT" && livePrice >= order.price) {
                    shouldExecute = true;
                } else if ((order.orderType === "SL" || order.orderType === "SL-M") && livePrice <= order.triggerPrice) {
                    shouldExecute = true;
                }
            }

            if (shouldExecute) {
                console.log(`[PendingOrders] Executing pending order: ${order.mode} ${order.qty} ${order.name} at ${livePrice}`);
                order.status = "EXECUTED";
                order.price = livePrice;
                await order.save();

                const funds = await FundsModel.findOne({ userId: order.userId });
                const requiredAmount = order.qty * livePrice;

                if (order.product === "CNC") {
                    const existingHolding = await HoldingsModel.findOne({ name: order.name, userId: order.userId });
                    if (order.mode === "BUY") {
                        if (existingHolding) {
                            const newQty = existingHolding.qty + order.qty;
                            existingHolding.avg = ((existingHolding.avg * existingHolding.qty) + (livePrice * order.qty)) / newQty;
                            existingHolding.qty = newQty;
                            await existingHolding.save();
                        } else {
                            const newHolding = new HoldingsModel({
                                name: order.name,
                                qty: order.qty,
                                avg: livePrice,
                                price: livePrice,
                                net: "0.00%",
                                day: "0.00%",
                                userId: order.userId,
                            });
                            await newHolding.save();
                        }
                    } else if (order.mode === "SELL") {
                        if (existingHolding) {
                            const newQty = existingHolding.qty - order.qty;
                            if (newQty <= 0) {
                                await HoldingsModel.deleteOne({ name: order.name, userId: order.userId });
                            } else {
                                existingHolding.qty = newQty;
                                await existingHolding.save();
                            }
                        }
                    }
                } else {
                    const existingPosition = await PositionsModel.findOne({ name: order.name, product: order.product, userId: order.userId });
                    if (!existingPosition) {
                        const newPosition = new PositionsModel({
                            product: order.product,
                            name: order.name,
                            qty: order.mode === "BUY" ? order.qty : -order.qty,
                            avg: livePrice,
                            price: livePrice,
                            net: "0.00%",
                            day: "0.00%",
                            userId: order.userId,
                        });
                        await newPosition.save();
                    } else {
                        if (order.mode === "BUY") {
                            const newQty = existingPosition.qty + order.qty;
                            if (newQty === 0) {
                                await PositionsModel.deleteOne({ name: order.name, product: order.product, userId: order.userId });
                            } else {
                                existingPosition.avg = ((existingPosition.avg * existingPosition.qty) + (livePrice * order.qty)) / newQty;
                                existingPosition.qty = newQty;
                                await existingPosition.save();
                            }
                        } else {
                            const newQty = existingPosition.qty - order.qty;
                            if (newQty === 0) {
                                await PositionsModel.deleteOne({ name: order.name, product: order.product, userId: order.userId });
                            } else {
                                existingPosition.qty = newQty;
                                await existingPosition.save();
                            }
                        }
                    }
                }

                if (funds) {
                    if (order.mode === "SELL") {
                        funds.availableMargin += requiredAmount;
                        funds.availableCash += requiredAmount;
                        funds.usedMargin -= requiredAmount;
                        if (funds.usedMargin < 0) funds.usedMargin = 0;
                        await funds.save();
                    }
                }
            }
        }
    } catch (err) {
        console.error("[PendingOrders] Error checking pending orders:", err.message);
    }
}

/**
 * Broadcast current prices to all connected WebSocket clients
 */
function broadcastPrices() {
    if (clients.size === 0) return;

    const payload = JSON.stringify({
        type: 'PRICE_UPDATE',
        stocks: priceStore,
        indices: indexStore,
        marketOpen: isMarketOpen(),
        timestamp: new Date().toISOString(),
    });

    clients.forEach(client => {
        try {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(payload);
            }
        } catch (e) {
            clients.delete(client);
        }
    });
}

/**
 * Register a WebSocket client and send it the current price snapshot
 */
function addClient(ws) {
    clients.add(ws);
    console.log(`[PriceEngine] Client connected. Total: ${clients.size}`);

    // Send snapshot immediately to new client
    ws.send(JSON.stringify({
        type: 'PRICE_UPDATE',
        stocks: priceStore,
        indices: indexStore,
        marketOpen: isMarketOpen(),
        timestamp: new Date().toISOString(),
    }));

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`[PriceEngine] Client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', () => {
        clients.delete(ws);
    });
}

/**
 * Get all current prices (for REST fallback /stockPrices endpoint)
 */
function getAllPrices() {
    return { stocks: priceStore, indices: indexStore, marketOpen: isMarketOpen() };
}

/**
 * Start the price engine
 */
async function start() {
    console.log('[PriceEngine] Starting...');

    await fetchRealPrices();
    await fetchIndexPrices();

    // Tick every 2 seconds
    setInterval(() => {
        applyPriceTick();
        broadcastPrices();
    }, 2000);

    // Re-anchor to real Yahoo Finance prices every 5 minutes
    setInterval(async () => {
        await fetchRealPrices();
        await fetchIndexPrices();
        console.log('[PriceEngine] Re-anchored to real market prices.');
    }, 5 * 60 * 1000);

    console.log('[PriceEngine] Running — ticking every 2s, re-fetching real data every 5min.');
}

module.exports = { start, addClient, getAllPrices, isMarketOpen };
