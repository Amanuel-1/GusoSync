"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie, Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderColor?: string[]
      borderWidth?: number
    }[]
  }
  title: string
  height?: number
  showLegend?: boolean
  isDoughnut?: boolean
}

export default function PieChart({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  isDoughnut = false
}: PieChartProps) {
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          },
          generateLabels: function(chart: any) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i]
                const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0)
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0
                
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor?.[i] || '#fff',
                  lineWidth: dataset.borderWidth || 2,
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0
            return `${label}: ${value} (${percentage}%)`
          }
        }
      },
    },
  }

  const ChartComponent = isDoughnut ? Doughnut : Pie

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#103a5e]">{title}</h3>
      </div>
      
      <div style={{ height: `${height}px` }}>
        <ChartComponent data={data} options={options} />
      </div>
    </div>
  )
}
