"use client";

import ReactECharts from "echarts-for-react";

export default function PlatformChart({ data }) {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} TND ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Ventes par Plateforme",
        type: "pie",
        radius: ["40%", "70%"], // This creates the donut shape
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "20",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          value: item.value,
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        })),
      },
    ],
    color: ["#06b6d4", "#4f46e5", "orange"],
  };

  return (
    <ReactECharts option={option} style={{ height: "350px", width: "100%" }} />
  );
}
