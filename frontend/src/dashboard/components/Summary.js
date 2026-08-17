import React, { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUpOutlined, AccountBalanceWalletOutlined } from "@mui/icons-material";

const Summary = ({ username, livePrices }) => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [funds, setFunds] = useState({ availableMargin: 0, openingBalance: 0, usedMargin: 0 });

  useEffect(() => {
    axios.get("http://localhost:3002/allHoldings", { withCredentials: true }).then((res) => {
      setAllHoldings(res.data);
    });
    axios.get("http://localhost:3002/getFunds", { withCredentials: true }).then((res) => {
      setFunds(res.data);
    });
  }, []);

  let totalInvestment = 0;
  let currentValue = 0;

  allHoldings.forEach((stock) => {
    totalInvestment += stock.avg * stock.qty;
    const livePrice = livePrices?.[stock.name]?.price || stock.price;
    currentValue += livePrice * stock.qty;
  });

  const pnl = currentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? (pnl / totalInvestment) * 100 : 0;

  return (
    <div className="fade-in summary-page">
      <div className="username-section">
        <h2 className="user-greeting">Hi, {username || "User"}!</h2>
      </div>

      <div className="summary-widgets">
        {/* Equity Widget */}
        <div className="widget-card">
          <div className="widget-header">
            <AccountBalanceWalletOutlined className="widget-icon" />
            <h3>Equity</h3>
          </div>
          <div className="widget-body">
            <div className="main-stat">
              <h1>₹{funds.availableMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              <p>Margin available</p>
            </div>
            <div className="widget-divider" />
            <div className="sub-stats">
              <div className="sub-stat-row">
                <span className="label">Margins used</span>
                <span className="value">₹{funds.usedMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="sub-stat-row">
                <span className="label">Opening balance</span>
                <span className="value">₹{funds.openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Widget */}
        <div className="widget-card">
          <div className="widget-header">
            <TrendingUpOutlined className="widget-icon" />
            <h3>Holdings ({allHoldings.length})</h3>
          </div>
          <div className="widget-body">
            <div className="main-stat">
              <h1 className={pnl >= 0 ? "profit" : "loss"}>
                {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="percent-badge">
                  {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                </span>
              </h1>
              <p>Current P&L</p>
            </div>
            <div className="widget-divider" />
            <div className="sub-stats">
              <div className="sub-stat-row">
                <span className="label">Current Value</span>
                <span className="value">₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="sub-stat-row">
                <span className="label">Investment</span>
                <span className="value">₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .summary-page {
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .username-section {
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f1f1;
          padding-bottom: 16px;
        }
        .user-greeting {
          font-size: 21px;
          font-weight: 500;
          color: #444;
          margin: 0;
        }
        .summary-widgets {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
          margin-top: 10px;
        }
        .widget-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          transition: box-shadow 0.2s ease;
        }
        .widget-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.02);
        }
        .widget-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #666;
        }
        .widget-header h3 {
          font-size: 15px;
          font-weight: 500;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .widget-icon {
          font-size: 18px !important;
          color: #888;
        }
        .widget-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .main-stat {
          flex: 1;
          min-width: 160px;
        }
        .main-stat h1 {
          font-size: 26px;
          font-weight: 500;
          color: #444;
          margin: 0 0 4px 0;
          letter-spacing: -0.03em;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }
        .main-stat p {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin: 0;
        }
        .percent-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 2px;
          margin-left: 2px;
        }
        .profit {
          color: #41b25d !important;
        }
        .profit .percent-badge {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .loss {
          color: #df514c !important;
        }
        .loss .percent-badge {
          background: #ffebee;
          color: #c62828;
        }
        .widget-divider {
          width: 1px;
          height: 60px;
          background: #eee;
        }
        .sub-stats {
          flex: 1;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sub-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
        }
        .sub-stat-row .label {
          color: #999;
        }
        .sub-stat-row .value {
          color: #333;
          font-weight: 500;
        }
        @media (max-width: 480px) {
          .widget-body {
            flex-direction: column;
            align-items: flex-start;
          }
          .widget-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Summary;
