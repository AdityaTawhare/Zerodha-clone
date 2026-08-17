import { useState, useEffect, useRef } from "react";

const WS_URL = "ws://localhost:3002";

/**
 * usePriceSocket — React hook for WebSocket-based live stock prices
 *
 * Returns:
 *   livePrices: { SYMBOL: { price, change, changePercent, prevClose, isDown } }
 *   indices: { NIFTY: {...}, SENSEX: {...} }
 *   marketOpen: boolean
 *   connected: boolean
 */
const usePriceSocket = () => {
  const [livePrices, setLivePrices] = useState({});
  const [indices, setIndices] = useState({ NIFTY: null, SENSEX: null });
  const [marketOpen, setMarketOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log("[PriceSocket] Connected to price engine");
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "PRICE_UPDATE") {
            setLivePrices(data.stocks || {});
            setIndices(data.indices || { NIFTY: null, SENSEX: null });
            setMarketOpen(data.marketOpen || false);
          }
        } catch (e) {
          console.error("[PriceSocket] Parse error:", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("[PriceSocket] Disconnected. Reconnecting in 3s...");
        // Auto-reconnect after 3 seconds
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("[PriceSocket] Error:", err);
        ws.close();
      };
    } catch (e) {
      console.error("[PriceSocket] Could not connect:", e);
      reconnectTimerRef.current = setTimeout(connect, 5000);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on cleanup
        wsRef.current.close();
      }
    };
  }, []);

  return { livePrices, indices, marketOpen, connected };
};

export default usePriceSocket;
