"use client";

import ReactECharts from "echarts-for-react";

export default function RevenueChart({ data }) {
  const option = {
    tooltip: {
      trigger: "axis",
      formatter: "{b}<br/>{a}: {c} TND",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((item) =>
        new Date(item.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        })
      ),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} TND",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    series: [
      {
        name: "Revenu",
        type: "line",
        stack: "Total",
        smooth: true,
        areaStyle: {},
        data: data.map((item) => item.Revenu),
      },
    ],
    color: ["#3b82f6"],
  };

  return (
    <ReactECharts option={option} style={{ height: "350px", width: "100%" }} />
  );
}
