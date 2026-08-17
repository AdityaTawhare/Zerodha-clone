import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import { DoughnutChart } from "./DoughnoutChart";
import LineChart from "./LineChart";

// Static watchlist symbols (in a real app this would come from user prefs)
const WATCHLIST_SYMBOLS = [
  "INFY", "ONGC", "TCS", "KPITTECH", "QUICKHEAL",
  "WIPRO", "RELIANCE", "HUL",
];

const WatchList = ({ livePrices }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Build the watchlist from live prices
  const watchlist = WATCHLIST_SYMBOLS.map((name) => {
    const live = livePrices?.[name];
    return {
      name,
      price: live?.price || 0,
      percent: live ? `${live.changePercent >= 0 ? "+" : ""}${live.changePercent.toFixed(2)}%` : "0.00%",
      isDown: live?.isDown || false,
    };
  });

  const filteredWatchlist = watchlist.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const labels = watchlist.map((s) => s.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((s) => s.price),
        backgroundColor: [
          "rgba(56, 126, 209, 0.6)",
          "rgba(34, 197, 94, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(168, 85, 247, 0.6)",
          "rgba(20, 184, 166, 0.6)",
          "rgba(249, 115, 22, 0.6)",
          "rgba(99, 102, 241, 0.6)",
        ],
        borderColor: [
          "#387ed1", "#16a34a", "#d97706", "#dc2626",
          "#7c3aed", "#0d9488", "#ea580c", "#4f46e5",
        ],
        borderWidth: 2,
      },
    ],
  };

  const [showAnalytics, setShowAnalytics] = useState(false);

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: true
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="watchlist-search"
          placeholder="Search eg: INFY, TCS, RELIANCE..."
          className="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="counts">{watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {filteredWatchlist.map((stock, index) => (
          <WatchListItem stock={stock} key={stock.name} livePrices={livePrices} />
        ))}
      </ul>

      <div className="analytics-drawer">
        <div className="analytics-toggle" onClick={() => setShowAnalytics(!showAnalytics)}>
          <span>📊 Watchlist Analytics</span>
          <span className="arrow-icon">{showAnalytics ? "▼" : "▲"}</span>
        </div>
        {showAnalytics && (
          <div className="analytics-body fade-in">
            <DoughnutChart data={data} options={chartOptions} />
          </div>
        )}
      </div>

      <style>{`
        .analytics-drawer {
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }
        .analytics-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-secondary);
          transition: background var(--transition);
        }
        .analytics-toggle:hover {
          background: var(--color-bg);
          color: var(--color-menu-active);
        }
        .arrow-icon {
          font-size: 9px;
          color: var(--color-text-muted);
        }
        .analytics-body {
          padding: 14px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fafafa;
          border-top: 1px solid var(--color-border-soft);
        }
      `}</style>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, livePrices }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef(stock.price);

  // Flash animation when price changes
  useEffect(() => {
    if (prevPriceRef.current !== stock.price && prevPriceRef.current !== 0) {
      const isUp = stock.price > prevPriceRef.current;
      setFlashClass(isUp ? "flash-up" : "flash-down");
      const timeout = setTimeout(() => setFlashClass(""), 600);
      prevPriceRef.current = stock.price;
      return () => clearTimeout(timeout);
    }
    prevPriceRef.current = stock.price;
  }, [stock.price]);

  return (
    <li
      className={flashClass}
      style={{ transition: "background-color 0.3s" }}
    >
      <div 
        className="watchlist-item-inner"
        style={{ position: "relative", width: "100%" }}
        onMouseEnter={() => setShowWatchlistActions(true)}
        onMouseLeave={() => setShowWatchlistActions(false)}
      >
        <div className="item">
          <p className={stock.isDown ? "down" : "up"} style={{ fontWeight: 500 }}>
            {stock.name}
          </p>
          <div className="itemInfo">
            <span
              className={`percent ${stock.isDown ? "down" : "up"}`}
              style={{ fontSize: "11px", marginRight: "4px" }}
            >
              {stock.percent}
            </span>
            {stock.isDown ? (
              <KeyboardArrowDown className="down" style={{ fontSize: "16px" }} />
            ) : (
              <KeyboardArrowUp className="up" style={{ fontSize: "16px" }} />
            )}
            <span className="price" style={{ fontWeight: 600, minWidth: "60px", textAlign: "right" }}>
              ₹{stock.price.toFixed(2)}
            </span>
          </div>
        </div>
        {showWatchlistActions && (
          <WatchListActions
              uid={stock.name}
              price={stock.price}
              onChartClick={() => setShowChart(!showChart)}
          />
        )}
      </div>
      
      {showChart && (
        <div style={{ marginTop: "8px", borderTop: "1px dashed #e8e8e8", paddingTop: "8px" }}>
            <LineChart symbol={stock.name} livePrice={stock.price} isDown={stock.isDown} />
        </div>
      )}

      <style>{`
        .flash-up { background-color: rgba(22, 163, 74, 0.12) !important; }
        .flash-down { background-color: rgba(220, 38, 38, 0.12) !important; }
        li { transition: background-color 0.6s ease; }
      `}</style>
    </li>
  );
};

const WatchListActions = ({ uid, price, onChartClick }) => {
  const generalContext = useContext(GeneralContext);
  const navigate = useNavigate();

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid, "BUY", price);
  };

  const handleSellClick = () => {
    generalContext.openBuyWindow(uid, "SELL", price);
  };

  const handleAnalyticsClick = () => {
    navigate(`/dashboard/chart/${uid}`);
  };

  return (
    <span className="actions" style={{ display: "flex", height: "100%" }}>
      <span>
        <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow} onClick={handleBuyClick}>
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow} onClick={handleSellClick}>
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip title="Analytics (Chart)" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={handleAnalyticsClick}>
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
