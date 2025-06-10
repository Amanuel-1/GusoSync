"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  icon: React.ReactNode
  color: string
  bgColor: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color,
  bgColor
}: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${bgColor} rounded-lg`}>
            <div className={`h-6 w-6 ${color}`}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#7d7d7d]">{title}</h3>
            <p className="text-2xl font-bold text-[#103a5e]">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                {Math.abs(trend.value)}%
              </span>
            </div>
            <p className="text-xs text-[#7d7d7d]">{trend.label}</p>
          </div>
        )}
      </div>
      {subtitle && (
        <div className="text-sm text-[#7d7d7d]">
          {subtitle}
        </div>
      )}
    </div>
  )
}
