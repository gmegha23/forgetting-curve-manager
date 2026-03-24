import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

function MemoryChart({ strength }) {
  // simulate memory decay for 7 days
  const days = [0, 1, 2, 3, 4, 5, 6];
  const memory = days.map(
    d => Math.round(100 * Math.exp(-d / strength))
  );

  const data = {
    labels: days.map(d => `Day ${d}`),
    datasets: [
      {
        label: "Memory Retention %",
        data: memory,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return <Line data={data} />;
}

export default MemoryChart;
