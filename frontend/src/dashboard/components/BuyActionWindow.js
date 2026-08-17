import React, { useState } from "react";
import axios from "axios";

const BuyActionWindow = ({ uid, initialMode, price, initialProduct, isProductFixed, closeWindow }) => {
  // Tabs: BUY | SELL
  const [mode, setMode] = useState(initialMode || "BUY");

  // Fields
  const [qty, setQty] = useState(1);
  const [orderPrice, setOrderPrice] = useState(price || 0.0);
  const [triggerPrice, setTriggerPrice] = useState(price || 0.0);

  // Toggles
  const [product, setProduct] = useState(initialProduct || "CNC"); // CNC (Longterm) | MIS (Intraday)
  const [orderType, setOrderType] = useState("MARKET"); // MARKET | LIMIT | SL | SL-M
  // eslint-disable-next-line no-unused-vars
  const [validity, setValidity] = useState("DAY");

  // GTT bracket order options
  const [gttStoploss, setGttStoploss] = useState(false);
  const [stoplossPct, setStoplossPct] = useState(2.0); // default 2%
  const [gttTarget, setGttTarget] = useState(false);
  const [targetPct, setTargetPct] = useState(5.0); // default 5%

  const handleExecute = () => {
    axios.post("http://localhost:3002/newOrder", {
      name: uid,
      qty: Number(qty),
      price: orderType === "MARKET" ? Number(price) : Number(orderPrice),
      mode,
      product,
      orderType,
      validity,
      triggerPrice: (orderType === "SL" || orderType === "SL-M") ? Number(triggerPrice) : undefined,
      stopLoss: gttStoploss ? Number(stoplossPct) : undefined,
      target: gttTarget ? Number(targetPct) : undefined,
    }, { withCredentials: true }).then((res) => {
      if (res.data.status === false) {
        alert(res.data.message);
        return;
      }
      closeWindow();
      window.location.reload();
    }).catch(err => {
      console.log(err);
      alert("Order Failed: " + (err.response?.data?.message || err.message));
    });
  };

  return (
    <div className={`container-window ${mode === "SELL" ? "sell-mode" : "buy-mode"}`} draggable="true">

      {/* Header with Stock Name and Toggle Switch */}
      <div className="header">
        <div className="stock-info">
          <h3>{uid}</h3>
          <span className="stock-price">₹ {price.toFixed(2)}</span>
        </div>
        <div className="toggle-switch">
          <label className="switch">
            <input
              type="checkbox"
              checked={mode === "SELL"}
              onChange={() => setMode(mode === "BUY" ? "SELL" : "BUY")}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="body">

        {/* Product Type (Intraday vs Longterm) */}
        <div className="radio-group" style={{ pointerEvents: isProductFixed ? "none" : "auto", opacity: isProductFixed ? 0.6 : 1 }}>
          <label className={product === "MIS" ? "selected" : ""}>
            <input
              type="radio"
              name="product"
              checked={product === "MIS"}
              onChange={() => setProduct("MIS")}
              disabled={isProductFixed}
            />
            Intraday <span>MIS</span>
          </label>
          <label className={product === "CNC" ? "selected" : ""}>
            <input
              type="radio"
              name="product"
              checked={product === "CNC"}
              onChange={() => setProduct("CNC")}
              disabled={isProductFixed}
            />
            Longterm <span>CNC</span>
          </label>
        </div>

        {/* Qty and Price Inputs */}
        <div className="inputs-row">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="1"
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
              step="0.05"
              disabled={orderType === "MARKET" || orderType === "SL-M"}
              style={{ backgroundColor: (orderType === "MARKET" || orderType === "SL-M") ? "#eee" : "white" }}
            />
          </fieldset>
        </div>

        {/* Order Type Options */}
        <div className="radio-group small">
          <label className={orderType === "MARKET" ? "selected" : ""}>
            <input
              type="radio"
              name="orderType"
              checked={orderType === "MARKET"}
              onChange={() => setOrderType("MARKET")}
            />
            Market
          </label>
          <label className={orderType === "LIMIT" ? "selected" : ""}>
            <input
              type="radio"
              name="orderType"
              checked={orderType === "LIMIT"}
              onChange={() => setOrderType("LIMIT")}
            />
            Limit
          </label>
          <label className={orderType === "SL" ? "selected" : ""}>
            <input
              type="radio"
              name="orderType"
              checked={orderType === "SL"}
              onChange={() => setOrderType("SL")}
            />
            SL
          </label>
          <label className={orderType === "SL-M" ? "selected" : ""}>
            <input
              type="radio"
              name="orderType"
              checked={orderType === "SL-M"}
              onChange={() => setOrderType("SL-M")}
            />
            SL-M
          </label>
        </div>

        {/* Trigger Price Field (Shows only for SL / SL-M) */}
        {(orderType === "SL" || orderType === "SL-M") && (
          <div className="inputs-row fade-in" style={{ marginTop: "10px" }}>
            <fieldset>
              <legend>Trigger Price</legend>
              <input
                type="number"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                step="0.05"
              />
            </fieldset>
          </div>
        )}

        {/* GTT Bracket Section */}
        <div className="gtt-section">
          <p className="gtt-title">GTT Bracket Order</p>
          <div className="gtt-options">
            <div className="gtt-option-row">
              <label className="gtt-checkbox">
                <input
                  type="checkbox"
                  checked={gttStoploss}
                  onChange={(e) => setGttStoploss(e.target.checked)}
                />
                Stoploss %
              </label>
              {gttStoploss && (
                <input
                  type="number"
                  value={stoplossPct}
                  onChange={(e) => setStoplossPct(e.target.value)}
                  className="gtt-pct-input"
                  min="0.1"
                  step="0.1"
                />
              )}
            </div>
            <div className="gtt-option-row">
              <label className="gtt-checkbox">
                <input
                  type="checkbox"
                  checked={gttTarget}
                  onChange={(e) => setGttTarget(e.target.checked)}
                />
                Target %
              </label>
              {gttTarget && (
                <input
                  type="number"
                  value={targetPct}
                  onChange={(e) => setTargetPct(e.target.value)}
                  className="gtt-pct-input"
                  min="0.1"
                  step="0.1"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer (Margin & Buttons) */}
        <div className="footer-actions">
          <div className="margin-info">
            Margin required: ₹{((orderType === "SL" || orderType === "SL-M" ? triggerPrice : orderPrice) * qty).toFixed(2)}
          </div>
          <div className="buttons">
            <button
              className={`btn-action ${mode === "BUY" ? "btn-buy" : "btn-sell"}`}
              onClick={handleExecute}
            >
              {mode}
            </button>
            <button className="btn-cancel" onClick={closeWindow}>Cancel</button>
          </div>
        </div>

      </div>

      <style>{`
        .container-window {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: white;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            border-radius: 4px;
            z-index: 2000;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        .buy-mode .header { background-color: #387ed1; color: white; }
        .sell-mode .header { background-color: #df514c; color: white; }
        
        .header {
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h3 { margin: 0; font-size: 16px; font-weight: 500; }
        .stock-price { font-size: 13px; font-weight: 600; opacity: 0.95; }

        .body { padding: 20px; }

        .radio-group {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        .radio-group label {
            cursor: pointer;
            font-size: 12px;
            color: #666;
            display: flex;
            align-items: center;
            gap: 5px;
            user-select: none;
        }
        .radio-group label.selected { color: #222; font-weight: 600; }
        .radio-group.small label { font-size: 11px; }

        .inputs-row {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        fieldset {
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 5px 10px;
            flex: 1;
        }
        legend { font-size: 10px; color: #888; text-transform: uppercase; font-weight: 500; }
        input[type="number"] {
            width: 100%;
            border: none;
            outline: none;
            font-size: 14px;
            font-weight: 500;
            color: #333;
        }

        /* GTT section */
        .gtt-section {
          border-top: 1px solid #eee;
          margin-top: 16px;
          padding-top: 14px;
          margin-bottom: 12px;
        }
        .gtt-title {
          font-size: 11px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 10px;
        }
        .gtt-options {
          display: flex;
          gap: 20px;
        }
        .gtt-option-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gtt-checkbox {
          font-size: 12.5px;
          color: #444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          user-select: none;
        }
        .gtt-pct-input {
          width: 54px;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 3px 6px;
          font-size: 12px;
          outline: none;
          font-weight: 500;
          color: #333;
          text-align: center;
        }
        .gtt-pct-input:focus {
          border-color: #387ed1;
        }

        .footer-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        .margin-info { font-size: 11.5px; color: #666; font-weight: 500; }
        
        .buttons { display: flex; gap: 10px; }
        .btn-action {
            border: none;
            padding: 8px 15px;
            color: white;
            font-weight: 600;
            border-radius: 3px;
            cursor: pointer;
            width: 100px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
        .btn-buy { background-color: #387ed1; }
        .btn-buy:hover { background-color: #2563b0; }
        .btn-sell { background-color: #df514c; }
        .btn-sell:hover { background-color: #c53030; }
        
        .btn-cancel {
            background: none;
            border: 1px solid #ddd;
            padding: 8px 15px;
            border-radius: 3px;
            cursor: pointer;
            color: #666;
            font-weight: 500;
            font-size: 12px;
        }
        .btn-cancel:hover { background-color: #fafafa; border-color: #ccc; }
      `}</style>
    </div>
  );
};

export default BuyActionWindow;
