import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
    return (
        <section className="hero-section container py-5">
            <div className="row align-items-center py-4">
                {/* Left — Text */}
                <div className="col-lg-5 text-lg-start text-center mb-5 mb-lg-0"
                    style={{ animation: "fadeSlideUp 0.6s ease both" }}>
                    <h1 style={{
                        fontSize: "clamp(34px, 5vw, 52px)",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.1,
                        color: "#1a1a1a",
                        marginBottom: "20px",
                    }}>
                        Invest in<br />
                        <span style={{ color: "#387ed1" }}>everything.</span>
                    </h1>
                    <p style={{
                        fontSize: "17px",
                        color: "#555",
                        marginBottom: "32px",
                        lineHeight: 1.65,
                        maxWidth: "400px",
                    }}>
                        Online platform to invest in stocks, F&O, IPOs, mutual funds, ETFs, bonds and more — at the lowest brokerage.
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
                        className="justify-content-lg-start">
                        <Link
                            to="/signup"
                            className="hero-cta"
                            style={{
                                background: "#387ed1",
                                color: "white",
                                padding: "13px 28px",
                                borderRadius: "6px",
                                fontWeight: 700,
                                fontSize: "15px",
                                textDecoration: "none",
                                transition: "all 0.2s",
                                boxShadow: "0 4px 14px rgba(56,126,209,0.3)",
                                display: "inline-block",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "#2563b0";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "#387ed1";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            Open a free account
                        </Link>
                        <Link
                            to="/product"
                            style={{
                                padding: "13px 24px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                fontSize: "15px",
                                textDecoration: "none",
                                color: "#387ed1",
                                border: "1.5px solid #d0e0f5",
                                background: "transparent",
                                transition: "all 0.2s",
                                display: "inline-block",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "#eff6ff";
                                e.currentTarget.style.borderColor = "#387ed1";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.borderColor = "#d0e0f5";
                            }}
                        >
                            Explore products →
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div style={{
                        display: "flex",
                        gap: "24px",
                        marginTop: "40px",
                        flexWrap: "wrap",
                    }}>
                        {[
                            { number: "1.3 Cr+", label: "Clients" },
                            { number: "₹3.5L Cr", label: "Equity AUM" },
                            { number: "15%", label: "Retail Orders" },
                        ].map(({ number, label }) => (
                            <div key={label}>
                                <div style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em" }}>
                                    {number}
                                </div>
                                <div style={{ fontSize: "12px", color: "#888", fontWeight: 500 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Hero Image */}
                <div className="col-lg-7 text-center"
                    style={{ animation: "fadeSlideUp 0.8s 0.1s ease both" }}>
                    <div style={{
                        position: "relative",
                        display: "inline-block",
                    }}>
                        {/* Soft glow behind image */}
                        <div style={{
                            position: "absolute",
                            inset: "10%",
                            background: "radial-gradient(ellipse, rgba(56,126,209,0.12) 0%, transparent 70%)",
                            borderRadius: "50%",
                            filter: "blur(30px)",
                            zIndex: 0,
                        }} />
                        <img
                            src="media/images/homeHero.png"
                            alt="Kite Trading Platform"
                            style={{
                                width: "100%",
                                maxWidth: "620px",
                                position: "relative",
                                zIndex: 1,
                                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.10))",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}

export default Hero;