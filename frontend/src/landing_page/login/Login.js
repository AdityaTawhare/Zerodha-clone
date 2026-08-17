import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [inputValue, setInputValue] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const { email, password } = inputValue;

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setInputValue(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await axios.post(
                "http://localhost:3002/login",
                { ...inputValue },
                { withCredentials: true }
            );
            const { success: ok, message } = data;
            if (ok) {
                setSuccess(message || "Login successful! Redirecting...");
                setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
            } else {
                setError(message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not reach server. Please try again.");
        } finally {
            setLoading(false);
            setInputValue(prev => ({ ...prev, email: "", password: "" }));
        }
    };

    return (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                background: "white",
                border: "1px solid #e8e8e8",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                animation: "fadeSlideUp 0.4s ease",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <img src="media/images/logo.svg" alt="Zerodha" style={{ height: "28px", marginBottom: "20px" }} />
                    <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", color: "#1a1a1a", margin: 0 }}>
                        Welcome back
                    </h2>
                    <p style={{ fontSize: "14px", color: "#888", marginTop: "6px" }}>Sign in to your Zerodha account</p>
                </div>

                {/* Error / Success Alerts */}
                {error && (
                    <div style={{
                        background: "#fff1f0", border: "1px solid #fca5a5", color: "#dc2626",
                        padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px",
                        display: "flex", alignItems: "center", gap: "8px",
                    }}>
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a",
                        padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px",
                        display: "flex", alignItems: "center", gap: "8px",
                    }}>
                        ✓ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#444", marginBottom: "7px" }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            placeholder="you@example.com"
                            onChange={handleOnChange}
                            required
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                outline: "none",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                            }}
                            onFocus={e => { e.target.style.borderColor = "#387ed1"; e.target.style.boxShadow = "0 0 0 3px rgba(56,126,209,0.12)"; }}
                            onBlur={e => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none"; }}
                        />
                    </div>
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#444", marginBottom: "7px" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            placeholder="••••••••"
                            onChange={handleOnChange}
                            required
                            style={{
                                width: "100%",
                                padding: "11px 14px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                outline: "none",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                            }}
                            onFocus={e => { e.target.style.borderColor = "#387ed1"; e.target.style.boxShadow = "0 0 0 3px rgba(56,126,209,0.12)"; }}
                            onBlur={e => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading ? "#93c2ed" : "#387ed1",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 700,
                            fontFamily: "Inter, sans-serif",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            boxShadow: loading ? "none" : "0 4px 12px rgba(56,126,209,0.25)",
                            letterSpacing: "-0.01em",
                        }}
                        onMouseEnter={e => !loading && (e.target.style.background = "#2563b0")}
                        onMouseLeave={e => !loading && (e.target.style.background = "#387ed1")}
                    >
                        {loading ? "Signing in..." : "Sign in →"}
                    </button>

                    <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#888" }}>
                        Don't have an account?{" "}
                        <Link to="/signup" style={{ color: "#387ed1", fontWeight: 600, textDecoration: "none" }}>
                            Create one free
                        </Link>
                    </p>
                </form>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
