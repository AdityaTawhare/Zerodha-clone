import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const Positions = ({ livePrices }) => {
  const [allPositions, setAllPositions] = useState([]);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios.get("http://localhost:3002/allPositions", { withCredentials: true }).then((res) => {
      setAllPositions(res.data);
    });
  }, []);

  const handleExitClick = (uid, price, product) => {
    generalContext.openBuyWindow(uid, "SELL", price, product, true);
  };

  // Enrich with live prices
  const enrichedPositions = allPositions.map(stock => {
    const liveData = livePrices?.[stock.name];
    const livePrice = liveData?.price || stock.price;
    const pnl = (livePrice - stock.avg) * stock.qty;
    const isProfit = pnl >= 0;
    return { ...stock, livePrice, pnl, isProfit, isDown: liveData?.isDown, changePercent: liveData?.changePercent || 0 };
  });

  const totalPnL = enrichedPositions.reduce((sum, s) => sum + s.pnl, 0);

  return (
    <div className="fade-in positions-page">
      <h3 className="page-title">Positions ({allPositions.length})</h3>

      {enrichedPositions.length > 0 && (
        <div className="stats-cards-grid">
          <div className="stats-card">
            <span className="stats-label">Day's P&L</span>
            <p className={`stats-val pnl-val ${totalPnL >= 0 ? "profit" : "loss"}`}>
              {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="kite-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th className="num">Qty.</th>
              <th className="num">Avg. price</th>
              <th className="num">LTP</th>
              <th className="num">P&L</th>
              <th className="num">Chg.</th>
              <th className="act">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrichedPositions.map((stock, index) => {
              const profClass = stock.isProfit ? "profit" : "loss";
              const dayClass = stock.isDown ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td>
                    <span className={`product-badge badge-${stock.product.toLowerCase()}`}>
                      {stock.product}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: "#333" }}>{stock.name}</td>
                  <td className="num">{stock.qty}</td>
                  <td className="num">₹{stock.avg.toFixed(2)}</td>
                  <td className="num" style={{ fontWeight: 600 }}>₹{stock.livePrice.toFixed(2)}</td>
                  <td className={`num ${profClass}`}>
                    {stock.pnl >= 0 ? "+" : ""}₹{stock.pnl.toFixed(2)}
                  </td>
                  <td className={`num ${dayClass}`}>
                    {stock.isDown ? "▼" : "▲"} {Math.abs(stock.changePercent).toFixed(2)}%
                  </td>
                  <td className="act">
                    <span
                      className="action-btn"
                      onClick={() => handleExitClick(stock.name, stock.livePrice, stock.product)}
                    >
                      Exit
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .positions-page {
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
          max-width: 250px;
        }
        .stats-card {
          flex: 1;
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
        .product-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .badge-mis {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fcd34d;
        }
        .badge-cnc {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
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
      `}</style>
    </div>
  );
};

export default Positions;
