import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const LineChart = ({ symbol, livePrice, isDown }) => {
  const [dataPoints, setDataPoints] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3002/historicalData?symbol=${symbol}`,
          { withCredentials: true }
        );
        if (data && data.length > 0) {
          const prices = data.map(q => q.close);
          const dates = data.map(q => {
            const d = new Date(q.date);
            return d.toLocaleDateString([], { month: "short", day: "numeric" });
          });
          
          // Seed the very last point with our current livePrice
          if (prices.length > 0) {
            prices[prices.length - 1] = livePrice;
          }
          
          setDataPoints(prices);
          setLabels(dates);
        }
      } catch (err) {
        console.error("Failed to fetch historical stock data:", err);
      }
    };
    
    fetchHistorical();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]); // Re-run when symbol changes

  // Update last chart point when a new live price tick comes in
  useEffect(() => {
    if (dataPoints.length > 0) {
      setDataPoints((prev) => {
        const newData = [...prev];
        newData[newData.length - 1] = livePrice;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice]);

  const chartColor = isDown ? "#e44b4b" : "#1a9c3e";
  const chartBgColor = isDown ? "rgba(228, 75, 75, 0.1)" : "rgba(26, 156, 62, 0.1)";

  const data = {
    labels,
    datasets: [
      {
        label: symbol,
        data: dataPoints,
        borderColor: chartColor,
        backgroundColor: chartBgColor,
        borderWidth: 1.5,
        fill: true,
        pointRadius: 0, // hide dots for cleaner look
        pointHoverRadius: 4,
        tension: 0.1, // slightly smooth
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { family: "Inter", size: 12 },
        bodyFont: { family: "Inter", size: 12 },
        padding: 8,
        displayColors: false,
      },
    },
    scales: {
      x: { display: false }, // hide x axis
      y: {
        display: true,
        position: "right",
        border: { display: false },
        grid: {
          color: "#f0f0f0",
          tickLength: 0,
        },
        ticks: {
          font: { family: "Inter", size: 10 },
          color: "#999",
          maxTicksLimit: 5,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div style={{ width: "100%", height: "180px", padding: "10px 0" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
