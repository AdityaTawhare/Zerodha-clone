import React from "react";
import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  Company: [
    { label: "About", to: "/about" },
    { label: "Products", to: "/product" },
    { label: "Pricing", to: "/pricing" },
    { label: "Careers", to: "/" },
    { label: "Zerodha.tech", to: "/" },
    { label: "Press & Media", to: "/" },
  ],
  Support: [
    { label: "Contact", to: "/support" },
    { label: "Support portal", to: "/support" },
    { label: "Z-Connect blog", to: "/" },
    { label: "List of charges", to: "/pricing" },
    { label: "Downloads", to: "/" },
  ],
  Account: [
    { label: "Open an account", to: "/signup" },
    { label: "Fund transfer", to: "/" },
    { label: "60 day challenge", to: "/" },
  ],
};

function Footer() {
  return (
    <footer style={{ background: "#f9f9f9", borderTop: "1px solid #e8e8e8", fontFamily: "Inter, sans-serif" }}>
      <div className="container py-5">
        {/* Top row */}
        <div className="row g-4 mb-5">
          {/* Brand */}
          <div className="col-lg-4 col-md-6">
            <img src="media/images/logo.svg" style={{ width: "120px", marginBottom: "16px" }} alt="Zerodha" />
            <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.7, maxWidth: "280px" }}>
              India's largest stock broker, trusted by 1.3+ crore investors for reliable, low-cost trading.
            </p>
            <p style={{ fontSize: "12px", color: "#aaa", marginTop: "12px" }}>
              &copy; 2010–2026, Zerodha Clone.<br />All rights reserved.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div className="col-lg-2 col-md-4 col-6" key={heading}>
              <p className="footer-heading" style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#333",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "16px",
              }}>
                {heading}
              </p>
              {links.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#777",
                    marginBottom: "10px",
                    fontWeight: 400,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#387ed1"}
                  onMouseLeave={e => e.currentTarget.style.color = "#777"}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr style={{ borderColor: "#e8e8e8", margin: "0 0 24px" }} />

        {/* Regulatory text */}
        <div style={{ fontSize: "12px", color: "#aaa", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "10px" }}>
            Zerodha Broking Ltd.: Member of NSE & BSE – SEBI Registration no.: INZ000031633. CDSL: Depository services through Zerodha Securities Pvt. Ltd. – SEBI Registration no.: IN-DP-100-2015. Commodity Trading through Zerodha Commodities Pvt. Ltd. MCX: 46025 – SEBI Registration no.: INZ000038238. Registered Address: Zerodha Broking Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India.
          </p>
          <p style={{ marginBottom: "10px" }}>
            Investments in securities market are subject to market risks; read all the related documents carefully before investing.
          </p>
          <p>
            "Prevent unauthorised transactions in your account. Update your mobile numbers/email IDs with your stock brokers." – Issued in the interest of investors.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;