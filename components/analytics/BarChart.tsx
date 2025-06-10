"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
    }[]
  }
  title: string
  height?: number
  showLegend?: boolean
  yAxisLabel?: string
  horizontal?: boolean
}

export default function BarChart({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  yAxisLabel = 'Count',
  horizontal = false
}: BarChartProps) {
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#103a5e',
        bodyColor: '#7d7d7d',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
      },
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
        },
        title: {
          display: horizontal && !!yAxisLabel,
          text: horizontal ? yAxisLabel : '',
          color: '#7d7d7d',
          font: {
            size: 12
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
          display: !horizontal && !!yAxisLabel,
          text: !horizontal ? yAxisLabel : '',
          color: '#7d7d7d',
          font: {
            size: 12
          }
        }
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#103a5e]">{title}</h3>
      </div>
      
      <div style={{ height: `${height}px` }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
