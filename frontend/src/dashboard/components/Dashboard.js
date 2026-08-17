import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";

import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import FullChartPage from "./FullChartPage";
import { GeneralContextProvider } from "./GeneralContext";
import GeneralContext from "./GeneralContext";

// Inner component so it can access GeneralContext for livePrices
const DashboardContent = ({ username }) => {
  const { livePrices } = useContext(GeneralContext);

  return (
    <div className="dashboard-container">
      <WatchList livePrices={livePrices} />
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Summary username={username} livePrices={livePrices} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/holdings" element={<Holdings livePrices={livePrices} />} />
          <Route path="/positions" element={<Positions livePrices={livePrices} />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/chart/:symbol" element={<FullChartPage livePrices={livePrices} />} />
        </Routes>
      </div>
    </div>
  );
};

const Dashboard = ({ username }) => {
  return (
    <DashboardContent username={username} />
  );
};

export default Dashboard;
