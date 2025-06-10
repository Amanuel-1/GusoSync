"use client"

import React, { useState } from "react"
import { 
  FileText, 
  Download, 
  Loader2, 
  Calendar,
  ChevronDown,
  Eye,
  Settings
} from "lucide-react"
import { showToast } from "@/lib/toast"
import { authService, User } from "@/services/authService"

interface ReportGeneratorProps {
  onClose?: () => void
}

export default function ReportGenerator({ onClose }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [reportMetadata, setReportMetadata] = useState<any>(null)
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [reportType, setReportType] = useState("comprehensive")
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const dateOptions = ["Last 7 days", "Last 30 days", "Last 90 days", "Last year"]
  const reportTypes = [
    { value: "comprehensive", label: "Comprehensive Report", description: "Full analytics with all metrics and insights" },
    { value: "executive", label: "Executive Summary", description: "High-level overview for management" },
    { value: "operational", label: "Operational Report", description: "Detailed operational metrics and performance" },
    { value: "incident", label: "Incident Analysis", description: "Focus on incidents and safety metrics" }
  ]

  // Get current user on component mount
  React.useEffect(() => {
    const user = authService.getUser();
    setCurrentUser(user);
  }, []);

  const generateReport = async () => {
    try {
      console.log('Starting report generation...', { dateRange, reportType });
      setIsGenerating(true)
      setReportContent(null)
      setReportMetadata(null)

      console.log('Making API call to generate report...');
      const response = await fetch('/dashboard/api/analytics/generate-report-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange,
          reportType,
          generatedBy: currentUser ? {
            name: `${currentUser.first_name} ${currentUser.last_name}`,
            email: currentUser.email,
            role: currentUser.role,
            id: currentUser.id
          } : null,
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error response:', error);
        throw new Error(error.error || 'Failed to generate report');
      }

      const data = await response.json();
      console.log('API success response:', data);

      setReportContent(data.data.reportContent);
      setReportMetadata(data.data.metadata);

      showToast.success('Report generated successfully!')
      
    } catch (error) {
      console.error('Error generating report:', error)
      showToast.error(error instanceof Error ? error.message : 'Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    if (!reportContent || !reportMetadata) {
      showToast.error('Please generate a report first')
      return
    }

    try {
      setIsGeneratingPDF(true)

      console.log('Generating PDF...');
      const response = await fetch('/dashboard/api/analytics/generate-pdf-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportContent,
          metadata: reportMetadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GusoSync-Analytics-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.success('PDF report downloaded successfully!')
      
    } catch (error) {
      console.error('Error downloading PDF:', error)
      showToast.error(error instanceof Error ? error.message : 'Failed to download PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] p-6 max-h-full overflow-y-auto">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#103a5e]">Report Generator</h3>
            <p className="text-sm text-[#7d7d7d]">Generate comprehensive analytics reports with AI insights</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#7d7d7d] hover:text-[#103a5e] transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            title="Close modal"
          >
            ×
          </button>
        )}
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Date Range Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-[#103a5e] mb-2">
            <Calendar size={16} className="inline mr-2" />
            Date Range
          </label>
          <button
            className="w-full flex items-center justify-between bg-white border border-[#d9d9d9] rounded-md px-4 py-2 text-sm"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            {dateRange}
            <ChevronDown size={16} />
          </button>
          
          {showDateDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-10">
              {dateOptions.map((option) => (
                <button
                  key={option}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    dateRange === option ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                  onClick={() => {
                    setDateRange(option)
                    setShowDateDropdown(false)
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Report Type Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-[#103a5e] mb-2">
            <Settings size={16} className="inline mr-2" />
            Report Type
          </label>
          <button
            className="w-full flex items-center justify-between bg-white border border-[#d9d9d9] rounded-md px-4 py-2 text-sm"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            {reportTypes.find(t => t.value === reportType)?.label}
            <ChevronDown size={16} />
          </button>
          
          {showTypeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-10">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                    reportType === type.value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  onClick={() => {
                    setReportType(type.value)
                    setShowTypeDropdown(false)
                  }}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-[#7d7d7d] mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
 
        <button
          onClick={() => {
            console.log('Generate Report button clicked in component');
            generateReport();
          }}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-[#0097fb] text-white px-6 py-2 rounded-md hover:bg-[#0086e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>

        {reportContent && (
          <>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 bg-white border border-[#d9d9d9] text-[#103a5e] px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye size={16} />
              {showPreview ? 'Hide Preview' : 'Preview Report'}
            </button>

            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </>
        )}
      </div>

      {/* Report Preview */}
      {showPreview && reportContent && (
        <div className="border border-[#e5e7eb] rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-[#103a5e]">Report Preview</h4>
            <div className="text-xs text-[#7d7d7d]">
              Generated: {reportMetadata?.generatedAt ? new Date(reportMetadata.generatedAt).toLocaleString() : 'Now'}
            </div>
          </div>
          
          <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-[#103a5e] font-mono">
              {reportContent}
            </pre>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">About Report Generation</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Reports are generated using advanced AI to provide insights and recommendations</li>
          <li>• Data is analyzed in real-time from your transportation system</li>
          <li>• PDF reports include professional formatting with charts and visualizations</li>
          <li>• All reports include executive summaries and actionable recommendations</li>
        </ul>
      </div>
    </div>
  )
}
