import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "next-themes";

const salesTrendData = [
  { date: "Week 1", daily: 3200, weekly: 22400, monthly: 89600 },
  { date: "Week 2", daily: 4100, weekly: 28700, monthly: 114800 },
  { date: "Week 3", daily: 3800, weekly: 26600, monthly: 106400 },
  { date: "Week 4", daily: 4500, weekly: 31500, monthly: 126000 },
];
export default function TrendingSales() {
  const [viewMode, setViewMode] = useState("daily");
  const themeConfig = useTheme();
  const strokeColor =
    themeConfig.theme === "system"
      ? "oklch(0.708 0 0)"
      : themeConfig.theme === "light"
      ? "oklch(0.556 0 0)"
      : "oklch(0.708 0 0)";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey="date" stroke={strokeColor} />
              <YAxis stroke={strokeColor} />
              <Tooltip
                formatter={(value) => [
                  `$${value}`,
                  viewMode.charAt(0).toUpperCase() + viewMode.slice(1),
                ]}
              />
              <Line
                type="monotone"
                dataKey={viewMode}
                stroke="#6122f4"
                strokeWidth={3}
                dot={{ fill: "#2563EB", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
