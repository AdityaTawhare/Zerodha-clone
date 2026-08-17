import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GeneralContextProvider } from "./GeneralContext";
import "../dashboard.css";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:3002",
          {},
          { withCredentials: true }
        );
        if (data.status) {
          setIsAuthenticated(true);
          setUsername(data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    };
    verifyUser();
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f8f8f8",
        gap: "20px",
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Kite-style logo + spinner */}
        <img
          src="/logo.png"
          alt="Zerodha"
          style={{ width: "48px", opacity: 0.9 }}
        />
        <div style={{
          width: "28px",
          height: "28px",
          border: "2.5px solid #e8e8e8",
          borderTop: "2.5px solid #387ed1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: "13px", color: "#999", marginTop: "-8px" }}>
          Verifying session...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <GeneralContextProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <TopBar username={username} />
        <Dashboard username={username} />
      </div>
    </GeneralContextProvider>
  );
};

export default Home;
