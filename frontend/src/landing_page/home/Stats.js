import React from 'react';

function Stats() {
    const features = [
        {
            title: "Customer-first always",
            desc: "That's why 1.3+ crore customers trust Zerodha with ₹3.5+ lakh crores worth of equity investments."
        },
        {
            title: "No spam or gimmicks",
            desc: "No gimmicks, spam, \"gamification\", or annoying push notifications. High quality apps that you use at your pace, the way you like."
        },
        {
            title: "The Zerodha universe",
            desc: "Not just an app, but a whole ecosystem. Our investments in 30+ fintech startups offer you tailored services specific to your needs."
        },
        {
            title: "Do better with money",
            desc: "With initiatives like Nudge and Kill Switch, we don't just facilitate transactions, but actively help you do better with your money."
        },
    ];

    return (
        <section style={{ padding: "80px 0", background: "#f9f9f9", borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8" }}>
            <div className="container">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                        <h2 style={{
                            fontSize: "clamp(24px, 4vw, 34px)",
                            fontWeight: 800,
                            letterSpacing: "-0.03em",
                            color: "#1a1a1a",
                            marginBottom: "40px",
                            lineHeight: 1.2,
                        }}>
                            Trust with<br />
                            <span style={{ color: "#387ed1" }}>confidence.</span>
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                            {features.map(({ title, desc }) => (
                                <div key={title} style={{ display: "flex", gap: "16px" }}>
                                    <div style={{
                                        width: "6px",
                                        minWidth: "6px",
                                        background: "#387ed1",
                                        borderRadius: "3px",
                                        alignSelf: "stretch",
                                        opacity: 0.5,
                                    }} />
                                    <div>
                                        <h3 style={{
                                            fontSize: "15px",
                                            fontWeight: 700,
                                            color: "#1a1a1a",
                                            marginBottom: "6px",
                                            letterSpacing: "-0.01em",
                                        }}>{title}</h3>
                                        <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-lg-6 text-center">
                        <img
                            src="media/images/ecosystem.png"
                            alt="Zerodha Ecosystem"
                            style={{
                                width: "90%",
                                filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.08))",
                                borderRadius: "12px",
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "center", gap: "28px", marginTop: "24px" }}>
                            <a href="" style={{ fontSize: "14px", fontWeight: 600, color: "#387ed1" }}>
                                Explore our products →
                            </a>
                            <a href="" style={{ fontSize: "14px", fontWeight: 600, color: "#387ed1" }}>
                                Try Kite demo →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Stats;