"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function ProfileChart({ data = [] }) {

  const points = data
    .map((item) => ({
      depth: Number(item.PRES),
      temperature: Number(item.TEMP),
      salinity: Number(item.PSAL),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.depth) &&
        Number.isFinite(item.temperature)
    )
    .sort((a, b) => a.depth - b.depth);

  if (!points.length) {
    return (
      <div className="empty-state">
        No profile observations available.
      </div>
    );
  }

  return (
    <div className="profile-chart">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={points}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 30,
            bottom: 35,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.15}
          />

          <XAxis
            type="number"
            dataKey="temperature"
            domain={["auto", "auto"]}
            tickFormatter={(value) =>
              Number(value).toFixed(1)
            }
            label={{
              value: "Temperature (°C)",
              position: "insideBottom",
              offset: -20,
            }}
          />

          <YAxis
            type="number"
            dataKey="depth"
            reversed
            domain={["auto", "auto"]}
            tickFormatter={(value) =>
              Number(value).toFixed(0)
            }
            label={{
              value: "Depth (dbar)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            formatter={(value, name) => {
              if (name === "temperature") {
                return [
                  `${Number(value).toFixed(2)} °C`,
                  "Temperature",
                ];
              }

              return [value, name];
            }}
            labelFormatter={(value) =>
              `Depth: ${Number(value).toFixed(1)} dbar`
            }
          />

          <Line
            type="monotone"
            dataKey="temperature"
            name="temperature"
            dot={false}
            strokeWidth={3}
            activeDot={{ r: 5 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}