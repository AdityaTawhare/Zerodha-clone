import React from 'react';

function Awards() {
    const columns = [
        ["Futures and Options", "Commodity derivatives", "Currency derivatives"],
        ["Stocks & IPOs", "Direct mutual funds", "Bonds & Govt. Securities"],
    ];

    return (
        <section style={{ padding: "80px 0", background: "#fff" }}>
            <div className="container">
                <div className="row align-items-center g-5">
                    {/* Image */}
                    <div className="col-lg-5 text-center">
                        <div style={{ position: "relative", display: "inline-block" }}>
                            <div style={{
                                position: "absolute",
                                inset: "5%",
                                background: "radial-gradient(ellipse, rgba(56,126,209,0.10) 0%, transparent 70%)",
                                borderRadius: "50%",
                                filter: "blur(20px)",
                                zIndex: 0,
                            }} />
                            <img
                                src="media/images/largestBroker.svg"
                                alt="Largest Broker"
                                style={{
                                    width: "90%",
                                    maxWidth: "400px",
                                    position: "relative",
                                    zIndex: 1,
                                }}
                            />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="col-lg-7">
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#eff6ff",
                            color: "#387ed1",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "16px",
                        }}>
                            #1 in India
                        </div>
                        <h2 style={{
                            fontSize: "clamp(26px, 4vw, 36px)",
                            fontWeight: 800,
                            letterSpacing: "-0.03em",
                            color: "#1a1a1a",
                            marginBottom: "16px",
                            lineHeight: 1.15,
                        }}>
                            Largest stock broker in India
                        </h2>
                        <p style={{ fontSize: "15px", color: "#666", marginBottom: "28px", lineHeight: 1.7 }}>
                            2+ million Zerodha clients contribute to over 15% of all retail order
                            volumes in India daily by trading and investing in:
                        </p>

                        <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                            {columns.map((col, i) => (
                                <ul key={i} style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {col.map(item => (
                                        <li key={item} style={{
                                            fontSize: "14px",
                                            color: "#444",
                                            padding: "5px 0",
                                            paddingLeft: "18px",
                                            position: "relative",
                                            fontWeight: 500,
                                        }}>
                                            <span style={{
                                                position: "absolute",
                                                left: 0,
                                                color: "#387ed1",
                                                fontWeight: 700,
                                            }}>→</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div>

                        <img
                            src="media/images/pressLogos.png"
                            alt="Press logos"
                            style={{ width: "85%", opacity: 0.7, filter: "grayscale(30%)" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Awards;