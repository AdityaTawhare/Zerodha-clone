import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import LineChart from "./LineChart";
import GeneralContext from "./GeneralContext";
import { ArrowBackOutlined } from "@mui/icons-material";

const FullChartPage = ({ livePrices }) => {
  const { symbol } = useParams();
  const { openBuyWindow } = useContext(GeneralContext);

  const liveData = livePrices?.[symbol];
  const livePrice = liveData?.price || 0.0;
  const isDown = liveData?.isDown || false;
  const changePercent = liveData?.changePercent || 0.0;

  const handleBuy = () => {
    openBuyWindow(symbol, "BUY", livePrice);
  };

  const handleSell = () => {
    openBuyWindow(symbol, "SELL", livePrice);
  };

  return (
    <div className="fade-in chart-page-container">
      {/* Header Bar */}
      <div className="chart-header">
        <div className="chart-title-section">
          <Link to="/dashboard" className="back-link">
            <ArrowBackOutlined className="back-icon" />
          </Link>
          <h2>{symbol}</h2>
          <span className={`live-price ${isDown ? "down" : "up"}`}>
            ₹{livePrice.toFixed(2)}
          </span>
          <span className={`live-change ${isDown ? "down" : "up"}`}>
            {isDown ? "▼" : "▲"} {Math.abs(changePercent).toFixed(2)}%
          </span>
        </div>
        
        {/* Floating Actions */}
        <div className="chart-actions">
          <button className="chart-btn btn-buy" onClick={handleBuy}>Buy</button>
          <button className="chart-btn btn-sell" onClick={handleSell}>Sell</button>
        </div>
      </div>

      {/* Main Chart Canvas wrapper */}
      <div className="chart-canvas-wrapper">
        <LineChart symbol={symbol} livePrice={livePrice} isDown={isDown} />
      </div>

      <style>{`
        .chart-page-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .chart-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .back-link {
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .back-link:hover {
          background: #f0f0f0;
          color: #333;
        }
        .back-icon {
          font-size: 20px !important;
        }
        .chart-title-section h2 {
          font-size: 20px;
          font-weight: 500;
          color: #333;
          margin: 0;
        }
        .live-price {
          font-size: 18px;
          font-weight: 600;
          margin-left: 8px;
        }
        .live-change {
          font-size: 12px;
          font-weight: 500;
        }
        .up { color: #41b25d; }
        .down { color: #df514c; }
        
        .chart-actions {
          display: flex;
          gap: 12px;
        }
        .chart-btn {
          border: none;
          padding: 8px 24px;
          color: white;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          transition: background 0.15s;
        }
        .chart-btn.btn-buy {
          background: #387ed1;
        }
        .chart-btn.btn-buy:hover {
          background: #2563b0;
        }
        .chart-btn.btn-sell {
          background: #df514c;
        }
        .chart-btn.btn-sell:hover {
          background: #c53030;
        }
        .chart-canvas-wrapper {
          flex: 1;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 20px 24px;
          min-height: 400px;
        }
      `}</style>
    </div>
  );
};

export default FullChartPage;
