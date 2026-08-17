import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  DashboardOutlined,
  ListAltOutlined,
  AccountBalanceWalletOutlined,
  TrendingUpOutlined,
  CurrencyRupeeOutlined,
  LogoutOutlined,
} from "@mui/icons-material";

const MENU_ITEMS = [
  { label: "Dashboard",  path: "/dashboard",           icon: <DashboardOutlined sx={{ fontSize: 16 }} /> },
  { label: "Orders",     path: "/dashboard/orders",     icon: <ListAltOutlined sx={{ fontSize: 16 }} /> },
  { label: "Holdings",   path: "/dashboard/holdings",   icon: <TrendingUpOutlined sx={{ fontSize: 16 }} /> },
  { label: "Positions",  path: "/dashboard/positions",  icon: <AccountBalanceWalletOutlined sx={{ fontSize: 16 }} /> },
  { label: "Funds",      path: "/dashboard/funds",      icon: <CurrencyRupeeOutlined sx={{ fontSize: 16 }} /> },
];

const Menu = ({ username }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3002/logout", {}, { withCredentials: true });
    } catch {}
    window.location.href = "/";
  };

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
      : location.pathname.startsWith(path);

  return (
    <div className="menu-container">
      {/* Logo */}
      <img src="/logo.png" style={{ width: "38px", height: "38px", objectFit: "contain" }} alt="Zerodha" />

      {/* Nav Links */}
      <div className="menus">
        <ul>
          {MENU_ITEMS.map(({ label, path, icon }) => (
            <li key={path}>
              <Link to={path} style={{ textDecoration: "none" }}>
                <span
                  className={`menu ${isActive(path) ? "selected" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {icon}
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <hr style={{ border: "none", borderLeft: "1px solid #e8e8e8", height: "28px", margin: "0 8px" }} />

      {/* Profile */}
      <div
        className="profile"
        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        style={{ position: "relative" }}
      >
        <div className="avatar">
          {username ? username[0].toUpperCase() : "U"}
        </div>
        <p className="username">{username || "User"}</p>

        {isProfileDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              backgroundColor: "white",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
              padding: "6px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 1000,
              minWidth: "140px",
              animation: "fadeSlideIn 0.15s ease",
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "none",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#e44b4b",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <LogoutOutlined sx={{ fontSize: 15 }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
