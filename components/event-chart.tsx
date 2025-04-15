"use client"

import { useState, useEffect, useRef } from "react"
import { Download } from "lucide-react"

interface ChartData {
  date: string
  triggered: number
  verified: number
  acknowledged: number
}

interface EventChartProps {
  data: ChartData[]
  title: string
  timeRange: string
}

export default function EventChart({ data, title, timeRange }: EventChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTypes, setSelectedTypes] = useState({
    triggered: true,
    verified: true,
    acknowledged: true,
  })
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number
    y: number
    value: number
    type: string
    date: string
  } | null>(null)

  const toggleType = (type: "triggered" | "verified" | "acknowledged") => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    const gridColor = "#f0f0f0"
    const padding = { top: 20, right: 20, bottom: 60, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Find max value for y-axis
    let maxValue = 0
    data.forEach((item) => {
      if (selectedTypes.triggered) maxValue = Math.max(maxValue, item.triggered)
      if (selectedTypes.verified) maxValue = Math.max(maxValue, item.verified)
      if (selectedTypes.acknowledged) maxValue = Math.max(maxValue, item.acknowledged)
    })
    maxValue = Math.ceil(maxValue / 20) * 20 // Round up to nearest 20

    // Draw y-axis grid lines and labels
    ctx.beginPath()
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    ctx.font = "12px Arial"
    ctx.fillStyle = "#7d7d7d"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const yAxisSteps = 8
    for (let i = 0; i <= yAxisSteps; i++) {
      const y = padding.top + (chartHeight * (yAxisSteps - i)) / yAxisSteps
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.fillText(`${Math.round((maxValue * i) / yAxisSteps)}`, padding.left - 10, y)
    }
    ctx.stroke()

    // Draw x-axis labels
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    const xStep = chartWidth / (data.length - 1)
    const labelStep = Math.ceil(data.length / 10) // Show fewer labels to avoid crowding

    for (let i = 0; i < data.length; i += labelStep) {
      const x = padding.left + i * xStep
      ctx.fillText(data[i].date, x, padding.top + chartHeight + 10)
    }

    // Store points for hover detection
    const points = {
      triggered: [] as { x: number; y: number; value: number; date: string }[],
      verified: [] as { x: number; y: number; value: number; date: string }[],
      acknowledged: [] as { x: number; y: number; value: number; date: string }[],
    }

    // Draw data lines
    const drawLine = (
      dataKey: "triggered" | "verified" | "acknowledged",
      color: string,
      dotColor: string,
      dotRadius: number,
    ) => {
      if (!selectedTypes[dataKey]) return

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2

      for (let i = 0; i < data.length; i++) {
        const x = padding.left + (i * chartWidth) / (data.length - 1)
        const y = padding.top + chartHeight - (chartHeight * data[i][dataKey]) / maxValue

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Store point for hover detection
        points[dataKey].push({
          x,
          y,
          value: data[i][dataKey],
          date: data[i].date,
        })
      }
      ctx.stroke()

      // Draw dots
      for (const point of points[dataKey]) {
        ctx.beginPath()
        ctx.fillStyle = dotColor
        ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (selectedTypes.triggered) {
      drawLine("triggered", "rgba(255, 138, 0, 0.8)", "#ff8a00", 4)
    }
    if (selectedTypes.verified) {
      drawLine("verified", "rgba(233, 44, 44, 0.8)", "#e92c2c", 4)
    }
    if (selectedTypes.acknowledged) {
      drawLine("acknowledged", "rgba(0, 151, 251, 0.8)", "#0097fb", 4)
    }

    // Add event listener for hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = (e.clientX - rect.left) * dpr
      const mouseY = (e.clientY - rect.top) * dpr

      let closestPoint = null
      let minDistance = Number.POSITIVE_INFINITY

      // Check all points
      Object.entries(points).forEach(([type, typePoints]) => {
        if (!selectedTypes[type as "triggered" | "verified" | "acknowledged"]) return

        typePoints.forEach((point) => {
          const distance = Math.sqrt((mouseX - point.x * dpr) ** 2 + (mouseY - point.y * dpr) ** 2)
          if (distance < minDistance && distance < 20 * dpr) {
            minDistance = distance
            closestPoint = {
              x: point.x,
              y: point.y,
              value: point.value,
              type,
              date: point.date,
            }
          }
        })
      })

      setHoveredPoint(closestPoint)

      // Redraw if needed
      if (closestPoint) {
        // Redraw canvas (simplified - in a real app you'd optimize this)
        // For now, we'll just show the tooltip
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [data, selectedTypes])

  return (
    <div className="bg-white rounded-md shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#103a5e]">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#7d7d7d]">{timeRange}</span>
          <button className="flex items-center gap-1 text-[#0097fb] text-sm">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            selectedTypes.triggered ? "bg-[#ff8a00] text-white" : "bg-gray-100 text-[#7d7d7d]"
          }`}
          onClick={() => toggleType("triggered")}
        >
          <span className="w-2 h-2 rounded-full bg-white"></span>
          Triggered
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            selectedTypes.verified ? "bg-[#e92c2c] text-white" : "bg-gray-100 text-[#7d7d7d]"
          }`}
          onClick={() => toggleType("verified")}
        >
          <span className="w-2 h-2 rounded-full bg-white"></span>
          Verified
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            selectedTypes.acknowledged ? "bg-[#0097fb] text-white" : "bg-gray-100 text-[#7d7d7d]"
          }`}
          onClick={() => toggleType("acknowledged")}
        >
          <span className="w-2 h-2 rounded-full bg-white"></span>
          Acknowledged
        </button>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-[400px]"></canvas>

        {hoveredPoint && (
          <div
            className="absolute bg-white shadow-md rounded-md p-2 text-sm pointer-events-none z-10"
            style={{
              left: `${hoveredPoint.x + 10}px`,
              top: `${hoveredPoint.y - 40}px`,
            }}
          >
            <div className="font-medium">{hoveredPoint.date}</div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  hoveredPoint.type === "triggered"
                    ? "bg-[#ff8a00]"
                    : hoveredPoint.type === "verified"
                      ? "bg-[#e92c2c]"
                      : "bg-[#0097fb]"
                }`}
              ></span>
              <span>
                {hoveredPoint.type.charAt(0).toUpperCase() + hoveredPoint.type.slice(1)}: {hoveredPoint.value}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
