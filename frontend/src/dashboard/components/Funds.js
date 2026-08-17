import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Funds = () => {
  const [funds, setFunds] = useState({
    availableMargin: 0,
    usedMargin: 0,
    availableCash: 0,
    openingBalance: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("ADD"); // "ADD" or "WITHDRAW"
  const [amount, setAmount] = useState("");
  const [commodityActivated, setCommodityActivated] = useState(false);

  const fetchFunds = () => {
    axios.get("http://localhost:3002/getFunds", { withCredentials: true }).then((res) => {
      setFunds(res.data);
    });
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const handleOpenModal = (type) => {
    setActionType(type);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    axios.post("http://localhost:3002/updateFunds", {
      type: actionType,
      amount: Number(amount)
    }, { withCredentials: true }).then((res) => {
      if (res.data.status === false) {
        alert(res.data.message);
        return;
      }
      setModalOpen(false);
      setAmount("");
      fetchFunds(); // Refresh data
    }).catch(err => {
      alert("Transaction Failed: " + (err.response?.data?.message || err.message));
    });
  };

  return (
    <div className="fade-in funds-page">
      <div className="funds-header-bar">
        <p className="upi-promo">Instant, zero-cost fund transfers with UPI</p>
        <div className="funds-actions">
          <button className="btn-action btn-add-funds" onClick={() => handleOpenModal("ADD")}>
            Add funds
          </button>
          <button className="btn-action btn-withdraw-funds" onClick={() => handleOpenModal("WITHDRAW")}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="funds-grid">
        {/* Equity Column */}
        <div className="funds-column">
          <h4 className="column-title">Equity</h4>
          
          <div className="details-table">
            <div className="table-row row-highlight">
              <span className="label">Available margin</span>
              <span className="value val-highlight">
                ₹{funds.availableMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="table-row">
              <span className="label">Used margin</span>
              <span className="value">
                ₹{funds.usedMargin.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="table-row">
              <span className="label">Available cash</span>
              <span className="value">
                ₹{funds.availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="table-section-divider" />
            
            <div className="table-row">
              <span className="label">Opening Balance</span>
              <span className="value">
                ₹{funds.openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="table-row">
              <span className="label">Payin</span>
              <span className="value">
                ₹{(funds.payin || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="table-row">
              <span className="label">Payout</span>
              <span className="value">
                ₹{(funds.payout || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="table-row">
              <span className="label">SPAN</span>
              <span className="value">₹0.00</span>
            </div>
            <div className="table-row">
              <span className="label">Delivery margin</span>
              <span className="value">₹0.00</span>
            </div>
            <div className="table-row">
              <span className="label">Exposure</span>
              <span className="value">₹0.00</span>
            </div>
            <div className="table-row">
              <span className="label">Options premium</span>
              <span className="value">₹0.00</span>
            </div>
            
            <div className="table-section-divider" />
            
            <div className="table-row">
              <span className="label">Collateral (Liquid funds)</span>
              <span className="value">₹0.00</span>
            </div>
            <div className="table-row">
              <span className="label">Collateral (Equity)</span>
              <span className="value">₹0.00</span>
            </div>
            <div className="table-row">
              <span className="label">Total Collateral</span>
              <span className="value">₹0.00</span>
            </div>
          </div>
        </div>

        {/* Commodity Column */}
        <div className="funds-column">
          <h4 className="column-title">Commodity</h4>
          
          {!commodityActivated ? (
            <div className="commodity-card">
              <p>You don't have a commodity account</p>
              <a
                href="#"
                className="btn-activate-commodity"
                onClick={(e) => {
                  e.preventDefault();
                  setCommodityActivated(true);
                  alert("Commodity account activated successfully!");
                }}
              >
                Open Account
              </a>
            </div>
          ) : (
            <div className="details-table fade-in">
              <div className="table-row row-highlight">
                <span className="label">Available margin</span>
                <span className="value val-highlight">₹50,000.00</span>
              </div>
              <div className="table-row">
                <span className="label">Used margin</span>
                <span className="value">₹0.00</span>
              </div>
              <div className="table-row">
                <span className="label">Available cash</span>
                <span className="value">₹50,000.00</span>
              </div>
              
              <div className="table-section-divider" />
              
              <div className="table-row">
                <span className="label">Opening Balance</span>
                <span className="value">₹50,000.00</span>
              </div>
              <div className="table-row">
                <span className="label">Payin</span>
                <span className="value">₹0.00</span>
              </div>
              <div className="table-row">
                <span className="label">Payout</span>
                <span className="value">₹0.00</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="funds-modal-content">
            <h3>{actionType === "ADD" ? "Add Funds" : "Withdraw Funds"}</h3>
            <div className="input-group">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer-btns">
              <button className="modal-btn-confirm" onClick={handleSubmit}>Confirm</button>
              <button className="modal-btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .funds-page {
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .funds-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
          border: 1px solid #eee;
          padding: 16px 20px;
          border-radius: 4px;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .upi-promo {
          font-size: 13.5px;
          color: #666;
          margin: 0;
        }
        .funds-actions {
          display: flex;
          gap: 12px;
        }
        .btn-action {
          padding: 10px 20px;
          border-radius: 3px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .btn-action:active {
          transform: translateY(1px);
        }
        .btn-add-funds {
          background: #41b25d;
          color: white;
        }
        .btn-add-funds:hover {
          background: #36954e;
        }
        .btn-withdraw-funds {
          background: #387ed1;
          color: white;
        }
        .btn-withdraw-funds:hover {
          background: #2563b0;
        }
        .funds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
        }
        .funds-column {
          width: 100%;
        }
        .column-title {
          font-size: 15px;
          font-weight: 500;
          color: #666;
          margin-bottom: 16px;
        }
        .details-table {
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
          background: #fff;
        }
        .table-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid #f9f9f9;
          font-size: 13px;
          color: #444;
          transition: background 0.15s ease;
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .table-row:hover {
          background: #fafafa;
        }
        .row-highlight {
          background: #fbfbfb;
          border-bottom: 1px solid #eee;
        }
        .table-row .label {
          color: #888;
        }
        .table-row .value {
          font-weight: 500;
        }
        .val-highlight {
          font-size: 15px;
          font-weight: 600;
          color: #387ed1;
        }
        .table-section-divider {
          border-top: 1px solid #eee;
          height: 0;
          margin: 4px 0;
        }
        .commodity-card {
          border: 1px solid #eee;
          border-radius: 4px;
          background: #fafafa;
          padding: 40px 20px;
          text-align: center;
        }
        .commodity-card p {
          font-size: 13px;
          color: #999;
          margin: 0 0 20px 0;
        }
        .btn-activate-commodity {
          display: inline-block;
          background: #387ed1;
          color: white;
          padding: 8px 16px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .btn-activate-commodity:hover {
          background: #2563b0;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(1.5px);
          animation: fadeIn 0.2s ease;
        }
        .funds-modal-content {
          background: white;
          padding: 28px;
          border-radius: 4px;
          width: 320px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          animation: slideUp 0.2s ease;
        }
        .funds-modal-content h3 {
          font-size: 16px;
          font-weight: 500;
          color: #444;
          margin: 0 0 20px 0;
          text-align: center;
        }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }
        .currency-symbol {
          position: absolute;
          left: 14px;
          font-size: 18px;
          color: #999;
          font-weight: 500;
        }
        .input-group input {
          width: 100%;
          padding: 12px 14px 12px 32px;
          font-size: 18px;
          font-weight: 600;
          color: #444;
          border: 1px solid #ddd;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .input-group input:focus {
          border-color: #387ed1;
        }
        .modal-footer-btns {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .modal-btn-confirm {
          flex: 1;
          background: #41b25d;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 3px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .modal-btn-confirm:hover {
          background: #36954e;
        }
        .modal-btn-cancel {
          flex: 1;
          background: #f1f1f1;
          color: #666;
          border: none;
          padding: 10px;
          border-radius: 3px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .modal-btn-cancel:hover {
          background: #e4e4e4;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Funds;
