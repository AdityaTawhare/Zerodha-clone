import React, { useState, useEffect } from "react";
import axios from "axios";
import { ReceiptLongOutlined } from "@mui/icons-material";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3002/allOrders", { withCredentials: true })
      .then((res) => { setAllOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (allOrders.length === 0) {
    return (
      <div className="fade-in orders-page empty">
        <div className="empty-state-card">
          <ReceiptLongOutlined className="empty-icon" />
          <h2>You haven't placed any orders today</h2>
          <p>Orders placed during market hours will appear in this list.</p>
        </div>
        <style>{`
          .orders-page.empty {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            font-family: 'Inter', sans-serif;
          }
          .empty-state-card {
            text-align: center;
            max-width: 380px;
            padding: 40px;
          }
          .empty-icon {
            font-size: 54px !important;
            color: #ccc;
            margin-bottom: 20px;
          }
          .empty-state-card h2 {
            font-size: 16px;
            font-weight: 500;
            color: #444;
            margin: 0 0 8px 0;
          }
          .empty-state-card p {
            font-size: 12.5px;
            color: #999;
            margin: 0;
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fade-in orders-page">
      <h3 className="page-title">Orders ({allOrders.length})</h3>

      <div className="table-container">
        <table className="kite-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Instrument</th>
              <th>Product</th>
              <th className="num">Qty.</th>
              <th className="num">Price (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order, index) => (
              <tr key={index}>
                <td style={{ color: "#999", fontFamily: "monospace", fontSize: "12px" }}>
                  {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </td>
                <td>
                  <span className={`order-type-badge type-${order.mode.toLowerCase()}`}>
                    {order.mode}
                  </span>
                </td>
                <td style={{ fontWeight: 500, color: "#333" }}>{order.name}</td>
                <td>
                  <span className={`product-badge badge-${(order.product || "CNC").toLowerCase()}`}>
                    {order.product || "CNC"}
                  </span>
                </td>
                <td className="num">{order.qty}</td>
                <td className="num" style={{ fontWeight: 600 }}>₹{Number(order.price).toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${(order.status || "EXECUTED").toLowerCase()}`}>
                    {order.status || "EXECUTED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .orders-page {
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .page-title {
          font-size: 18px;
          font-weight: 500;
          color: #444;
          margin-bottom: 20px;
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
        .kite-table tbody tr {
          transition: background 0.15s ease;
        }
        .kite-table tbody tr:hover {
          background: #fcfcfc;
        }
        .order-type-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .type-buy {
          background: #eff6ff;
          color: #2b6cb0;
          border: 1px solid #bee3f8;
        }
        .type-sell {
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #fed7d7;
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
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .status-executed {
          background: #f0fdf4;
          color: #16a34a;
        }
        .status-pending {
          background: #fffbeb;
          color: #d97706;
        }
        .status-rejected {
          background: #fff5f5;
          color: #c53030;
        }
      `}</style>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="fade-in" style={{ fontFamily: "Inter, sans-serif" }}>
    <div style={{ height: "20px", width: "120px", background: "#eee", borderRadius: "3px", marginBottom: "20px" }} />
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{
        height: "44px", background: "#fafafa", borderRadius: "3px", marginBottom: "8px",
        animation: "pulse 1.5s ease infinite", animationDelay: `${i * 0.1}s`
      }} />
    ))}
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
  </div>
);

export default Orders;
