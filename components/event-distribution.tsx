"use client"

import { useState, useEffect, useRef } from "react"
import { Download } from "lucide-react"

interface EventDistributionProps {
  data: {
    type: string
    count: number
    color: string
  }[]
  title: string
}

export default function EventDistribution({ data, title }: EventDistributionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)

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

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.count, 0)

    // Draw pie chart
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) - 40

    let startAngle = 0
    const segments = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const sliceAngle = (2 * Math.PI * item.count) / total

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      // Fill with color
      ctx.fillStyle = i === hoveredSegment || i === selectedSegment ? item.color : `${item.color}cc`
      ctx.fill()

      // Store segment info for hover detection
      segments.push({
        startAngle,
        endAngle: startAngle + sliceAngle,
        item,
      })

      startAngle += sliceAngle
    }

    // Draw center circle (donut hole)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()

    // Draw total in center
    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#103a5e"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(total.toString(), centerX, centerY - 10)
    ctx.font = "14px Arial"
    ctx.fillStyle = "#7d7d7d"
    ctx.fillText("Total Events", centerX, centerY + 15)

    // Add event listener for hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate distance from center
      const dx = mouseX - centerX
      const dy = mouseY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Check if mouse is within the donut
      if (distance > radius * 0.6 && distance < radius) {
        // Calculate angle
        let angle = Math.atan2(dy, dx)
        if (angle < 0) angle += 2 * Math.PI

        // Find segment
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]
          if (angle >= segment.startAngle && angle < segment.endAngle) {
            setHoveredSegment(i)
            return
          }
        }
      } else {
        setHoveredSegment(null)
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate distance from center
      const dx = mouseX - centerX
      const dy = mouseY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Check if mouse is within the donut
      if (distance > radius * 0.6 && distance < radius) {
        // Calculate angle
        let angle = Math.atan2(dy, dx)
        if (angle < 0) angle += 2 * Math.PI

        // Find segment
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]
          if (angle >= segment.startAngle && angle < segment.endAngle) {
            setSelectedSegment(selectedSegment === i ? null : i)
            return
          }
        }
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("click", handleClick)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleClick)
    }
  }, [data, hoveredSegment, selectedSegment])

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#103a5e]">{title}</h2>
        <button className="flex items-center gap-1 text-[#0097fb] text-sm">
          <Download size={16} />
          Download
        </button>
      </div>

      <div className="flex">
        <div className="w-1/2">
          <canvas ref={canvasRef} className="w-full h-[300px]"></canvas>
        </div>
        <div className="w-1/2 pl-4 flex flex-col justify-center">
          <div className="space-y-4">
            {data.map((item, index) => (
              <div
                key={item.type}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  hoveredSegment === index || selectedSegment === index ? "bg-gray-100" : ""
                }`}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
              >
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.type}</div>
                  <div className="text-xs text-[#7d7d7d]">
                    {item.count} events ({Math.round((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100)}%)
                  </div>
                </div>
                <div className="text-lg font-medium">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
