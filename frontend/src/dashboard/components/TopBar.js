import React, { useContext } from "react";
import Menu from "./Menu";
import GeneralContext from "./GeneralContext";

const TopBar = ({ username }) => {
  const { indices, marketOpen, connected } = useContext(GeneralContext);

  const nifty = indices?.NIFTY;
  const sensex = indices?.SENSEX;

  return (
    <div className="topbar-container">
      <div className="indices-container">
        {/* NIFTY 50 */}
        <div className="index-block">
          <span className="index-name">NIFTY 50</span>
          <span className="index-points" style={{ color: nifty?.isDown ? "#e44b4b" : "#1a9c3e" }}>
            {nifty?.price || "—"}
          </span>
          <span
            className="index-change"
            style={{ color: nifty?.isDown ? "#e44b4b" : "#1a9c3e", fontSize: "11px" }}
          >
            {nifty ? `${nifty.isDown ? "▼" : "▲"} ${Math.abs(nifty.changePercent)}%` : ""}
          </span>
        </div>

        <div className="index-divider" />

        {/* SENSEX */}
        <div className="index-block">
          <span className="index-name">SENSEX</span>
          <span className="index-points" style={{ color: sensex?.isDown ? "#e44b4b" : "#1a9c3e" }}>
            {sensex?.price || "—"}
          </span>
          <span
            className="index-change"
            style={{ color: sensex?.isDown ? "#e44b4b" : "#1a9c3e", fontSize: "11px" }}
          >
            {sensex ? `${sensex.isDown ? "▼" : "▲"} ${Math.abs(sensex.changePercent)}%` : ""}
          </span>
        </div>

        {/* Market Status Badge */}
        <div
          style={{
            marginLeft: "20px",
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 600,
            backgroundColor: marketOpen ? "#dcfce7" : "#fee2e2",
            color: marketOpen ? "#16a34a" : "#dc2626",
            border: `1px solid ${marketOpen ? "#86efac" : "#fca5a5"}`,
          }}
        >
          {marketOpen ? "● Market Open" : "● Market Closed"}
        </div>

        {/* WebSocket Connection Status */}
        {!connected && (
          <div
            style={{
              marginLeft: "10px",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: "#fef9c3",
              color: "#ca8a04",
              border: "1px solid #fde047",
            }}
          >
            ⟳ Connecting...
          </div>
        )}
      </div>

      <Menu username={username} />

      <style>{`
        .topbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 20px;
          border-bottom: 1px solid #e0e0e0;
          background: #fff;
        }
        .indices-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .index-block {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 80px;
        }
        .index-name {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 500;
        }
        .index-points {
          font-size: 13px;
          font-weight: 700;
        }
        .index-change {
          font-size: 10px;
        }
        .index-divider {
          width: 1px;
          height: 30px;
          background: #e0e0e0;
          margin: 0 4px;
        }
      `}</style>
    </div>
  );
};

export default TopBar;
