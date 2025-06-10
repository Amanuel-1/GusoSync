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

interface AreaChartProps {
  data: DataPoint[]
  title: string
  areas: {
    key: string
    label: string
    color: string
    fillColor?: string
  }[]
  height?: number
  showLegend?: boolean
  yAxisLabel?: string
  stacked?: boolean
}

export default function AreaChart({ 
  data, 
  title, 
  areas, 
  height = 300, 
  showLegend = true,
  yAxisLabel = 'Count',
  stacked = false
}: AreaChartProps) {
  
  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: areas.map((area, index) => ({
      label: area.label,
      data: data.map(point => Number(point[area.key]) || 0),
      borderColor: area.color,
      backgroundColor: area.fillColor || `${area.color}40`,
      fill: stacked ? (index === 0 ? 'origin' : `-${index}`) : 'origin',
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: area.color,
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
        stacked: stacked,
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
