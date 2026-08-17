
import React, { useState, useEffect } from "react";
import axios from "axios";

import BuyActionWindow from "./BuyActionWindow";
import usePriceSocket from "../hooks/usePriceSocket";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  closeBuyWindow: () => {},
  livePrices: {},
  indices: {},
  marketOpen: false,
  connected: false,
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedStockPrice, setSelectedStockPrice] = useState(0);
  const [orderMode, setOrderMode] = useState("BUY");
  const [selectedProduct, setSelectedProduct] = useState("CNC");
  const [isProductFixed, setIsProductFixed] = useState(false);
  const [funds, setFunds] = useState({ availableMargin: 0 });

  // Single shared WebSocket connection for all components
  const { livePrices, indices, marketOpen, connected } = usePriceSocket();

  // Fetch current funds for BuyWindow validation
  const refreshFunds = () => {
    axios.get("http://localhost:3002/getFunds", { withCredentials: true })
      .then(res => setFunds(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    refreshFunds();
  }, []);

  const handleOpenBuyWindow = (uid, mode = "BUY", price = 0, product = "CNC", fixed = false) => {
    // Use live price if available
    const livePrice = livePrices?.[uid]?.price || price;
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockPrice(livePrice);
    setOrderMode(mode);
    setSelectedProduct(product);
    setIsProductFixed(fixed);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockPrice(0);
    setOrderMode("BUY");
    setSelectedProduct("CNC");
    setIsProductFixed(false);
    refreshFunds(); // Refresh funds after closing order window
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        livePrices,
        indices,
        marketOpen,
        connected,
        availableFunds: funds.availableMargin || 0,
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow
          uid={selectedStockUID}
          initialMode={orderMode}
          price={selectedStockPrice}
          initialProduct={selectedProduct}
          isProductFixed={isProductFixed}
          closeWindow={handleCloseBuyWindow}
          availableFunds={funds.availableMargin || 0}
          livePrices={livePrices}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
