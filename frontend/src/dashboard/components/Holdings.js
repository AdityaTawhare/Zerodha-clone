import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const Holdings = ({ livePrices }) => {
  const [allHoldings, setAllHoldings] = useState([]);
  const generalContext = React.useContext(GeneralContext);

  const handleSellClick = (uid, price) => {
    generalContext.openBuyWindow(uid, "SELL", price, "CNC", true);
  };

  useEffect(() => {
    axios.get("http://localhost:3002/allHoldings", { withCredentials: true }).then((res) => {
      setAllHoldings(res.data);
    });
  }, []);

  // Merge DB holdings with live prices
  const enrichedHoldings = allHoldings.map(stock => {
    const liveData = livePrices?.[stock.name];
    const livePrice = liveData?.price || stock.price;
    const curValue = livePrice * stock.qty;
    const isProfit = curValue - stock.avg * stock.qty >= 0.0;
    const dayChange = liveData?.changePercent || 0;

    return { ...stock, livePrice, curValue, isProfit, dayChange, isDown: liveData?.isDown };
  });

  const totalInvestment = enrichedHoldings.reduce((sum, s) => sum + s.avg * s.qty, 0);
  const totalCurrent = enrichedHoldings.reduce((sum, s) => sum + s.curValue, 0);
  const totalPnL = totalCurrent - totalInvestment;
  const totalPnLPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  return (
    <div className="fade-in holdings-page">
      <h3 className="page-title">Holdings ({allHoldings.length})</h3>

      {allHoldings.length > 0 && (
        <div className="stats-cards-grid">
          <div className="stats-card">
            <span className="stats-label">Total investment</span>
            <p className="stats-val">₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="stats-card">
            <span className="stats-label">Current value</span>
            <p className="stats-val">₹{totalCurrent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="stats-card">
            <span className="stats-label">Total P&L</span>
            <p className={`stats-val pnl-val ${totalPnL >= 0 ? "profit" : "loss"}`}>
              {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <small className="pnl-percent">
                ({totalPnL >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%)
              </small>
            </p>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="kite-table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th className="num">Qty.</th>
              <th className="num">Avg. cost</th>
              <th className="num">LTP</th>
              <th className="num">Cur. val</th>
              <th className="num">P&L</th>
              <th className="num">Net chg.</th>
              <th className="num">Day chg.</th>
              <th className="act">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrichedHoldings.map((stock, index) => {
              const pnl = stock.curValue - stock.avg * stock.qty;
              const netChgPercent = stock.avg > 0 ? (pnl / (stock.avg * stock.qty)) * 100 : 0;
              const profClass = pnl >= 0 ? "profit" : "loss";
              const dayClass = stock.isDown ? "loss" : "profit";

              return (
                <HoldingRow
                  key={stock._id || index}
                  stock={stock}
                  pnl={pnl}
                  netChgPercent={netChgPercent}
                  profClass={profClass}
                  dayClass={dayClass}
                  onSell={handleSellClick}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .holdings-page {
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .page-title {
          font-size: 18px;
          font-weight: 500;
          color: #444;
          margin-bottom: 20px;
        }
        .stats-cards-grid {
          display: flex;
          gap: 20px;
          padding: 16px 20px;
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .stats-card {
          flex: 1;
          min-width: 150px;
        }
        .stats-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 4px;
        }
        .stats-val {
          font-size: 16px;
          font-weight: 600;
          color: #444;
          margin: 0;
        }
        .pnl-val {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .pnl-percent {
          font-size: 12px;
          font-weight: 500;
        }
        .profit {
          color: #41b25d !important;
        }
        .loss {
          color: #df514c !important;
        }
        .table-container {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #eee;
          border-radius: 4px;
          background: #fff;
        }
        .kite-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .kite-table th, .kite-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f1f1;
          text-align: left;
          color: #444;
        }
        .kite-table th {
          background: #fafafa;
          font-weight: 500;
          color: #999;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #eee;
        }
        .kite-table td.num, .kite-table th.num {
          text-align: right;
        }
        .kite-table td.act, .kite-table th.act {
          text-align: center;
          width: 80px;
        }
        .kite-table tbody tr {
          transition: background 0.15s ease;
        }
        .kite-table tbody tr:hover {
          background: #fcfcfc;
        }
        .action-btn {
          display: inline-block;
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-btn:hover {
          background: #df514c;
          color: white;
          border-color: #df514c;
        }
        .flash-row-up { animation: flashGreen 0.6s ease; }
        .flash-row-down { animation: flashRed 0.6s ease; }
        @keyframes flashGreen {
          0% { background-color: rgba(65, 178, 93, 0.15); }
          100% { background-color: transparent; }
        }
        @keyframes flashRed {
          0% { background-color: rgba(223, 81, 76, 0.15); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
};

const HoldingRow = ({ stock, pnl, netChgPercent, profClass, dayClass, onSell }) => {
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef(stock.livePrice);

  useEffect(() => {
    if (prevPriceRef.current !== stock.livePrice) {
      const isUp = stock.livePrice > prevPriceRef.current;
      setFlashClass(isUp ? "flash-row-up" : "flash-row-down");
      const t = setTimeout(() => setFlashClass(""), 600);
      prevPriceRef.current = stock.livePrice;
      return () => clearTimeout(t);
    }
  }, [stock.livePrice]);

  return (
    <tr className={flashClass}>
      <td style={{ fontWeight: 500, color: "#333" }}>{stock.name}</td>
      <td className="num">{stock.qty}</td>
      <td className="num">₹{stock.avg.toFixed(2)}</td>
      <td className="num" style={{ fontWeight: 600 }}>₹{stock.livePrice.toFixed(2)}</td>
      <td className="num">₹{stock.curValue.toFixed(2)}</td>
      <td className={`num ${profClass}`}>{pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}</td>
      <td className={`num ${profClass}`}>{pnl >= 0 ? "+" : ""}{netChgPercent.toFixed(2)}%</td>
      <td className={`num ${dayClass}`}>
        {stock.isDown ? "▼" : "▲"} {Math.abs(stock.dayChange).toFixed(2)}%
      </td>
      <td className="act">
        <span className="action-btn" onClick={() => onSell(stock.name, stock.livePrice)}>
          Exit
        </span>
      </td>
    </tr>
  );
};

export default Holdings;
