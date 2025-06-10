"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DataPoint {
  date: string
  [key: string]: number | string
}

interface LineChartProps {
  data: DataPoint[]
  title: string
  lines: {
    key: string
    label: string
    color: string
    borderColor?: string
    fill?: boolean
  }[]
  height?: number
  showLegend?: boolean
  yAxisLabel?: string
}

export default function LineChart({
  data,
  title,
  lines,
  height = 300,
  showLegend = true,
  yAxisLabel = 'Count'
}: LineChartProps) {

  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: lines.map(line => ({
      label: line.label,
      data: data.map(point => Number(point[line.key]) || 0),
      borderColor: line.borderColor || line.color,
      backgroundColor: line.fill ? `${line.color}20` : line.color,
      fill: line.fill || false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: line.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#103a5e',
        bodyColor: '#7d7d7d',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex
            const date = new Date(data[dataIndex].date)
            return date.toLocaleDateString()
          }
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: '#f0f0f0',
          drawBorder: false,
        },
        ticks: {
          color: '#7d7d7d',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
          drawBorder: false,
        },
        ticks: {
          color: '#7d7d7d',
          font: {
            size: 11
          }
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: '#7d7d7d',
          font: {
            size: 12
          }
        }
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#fff',
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#103a5e]">{title}</h3>
      </div>

      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
