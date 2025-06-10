"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface GaugeChartProps {
  value: number
  maxValue?: number
  title: string
  label: string
  color: string
  height?: number
}

export default function GaugeChart({ 
  value, 
  maxValue = 100, 
  title, 
  label,
  color,
  height = 200 
}: GaugeChartProps) {
  
  const percentage = Math.min((value / maxValue) * 100, 100)
  const remaining = 100 - percentage

  const data = {
    datasets: [{
      data: [percentage, remaining],
      backgroundColor: [color, '#f3f4f6'],
      borderColor: [color, '#f3f4f6'],
      borderWidth: 0,
      cutout: '70%',
      circumference: 180,
      rotation: 270,
    }]
  }

  const options = {
    
    responsive: true,
    cutout:160,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#103a5e] mb-4">{title}</h3>
        
        <div className="relative" style={{ height: `${height}px` }}>
          <Doughnut data={data} options={options} />
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold" style={{ color }}>
              {Math.round(percentage)}%
            </div>
            <div className="text-sm text-[#7d7d7d] mt-1">
              {label}
            </div>
          </div>
        </div>

        {/* Value display */}
        <div className="mt-4 text-center">
          <span className="text-lg font-semibold text-[#103a5e]">
            {value}
          </span>
          {maxValue !== 100 && (
            <span className="text-sm text-[#7d7d7d]">
              {" "}/ {maxValue}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
