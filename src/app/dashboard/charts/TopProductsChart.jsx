"use client";

import ReactECharts from "echarts-for-react";

export default function TopProductsChart({ data }) {
  // ECharts expects data to be reversed for horizontal bar charts
  const reversedData = [...data].reverse();

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: reversedData.map((item) => item.name),
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    series: [
      {
        name: "Quantité vendue",
        type: "bar",
        data: reversedData.map((item) => item["Quantité vendue"]),
      },
    ],
    color: ["#10b981"],
  };

  return (
    <ReactECharts option={option} style={{ height: "350px", width: "100%" }} />
  );
}
