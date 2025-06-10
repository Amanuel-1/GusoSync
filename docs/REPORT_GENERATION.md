# GusoSync AI Report Generation Agent

## Overview

The GusoSync Analytics Dashboard includes an advanced AI-powered Report Generation Agent that creates comprehensive, professional PDF reports with insights, recommendations, and visualizations based on transportation system data. This agent-based approach provides better modularity, error handling, and scalability compared to traditional API endpoints.

## Features

### 🤖 AI-Powered Analysis
- **Google Gemini AI Integration**: Uses advanced AI to analyze data and generate insights
- **Intelligent Recommendations**: Provides actionable, data-driven recommendations
- **Professional Language**: Generates formal, executive-level reports
- **Contextual Analysis**: Understands transportation domain and business objectives

### 📊 Report Types
1. **Comprehensive Report**: Full analytics with all metrics and insights
2. **Executive Summary**: High-level overview for management
3. **Operational Report**: Detailed operational metrics and performance
4. **Incident Analysis**: Focus on incidents and safety metrics

### 📅 Date Range Options
- Last 7 days
- Last 30 days
- Last 90 days
- Last year

### 📄 PDF Generation
- **Professional Formatting**: Clean, corporate-style layout
- **Charts and Visualizations**: Includes data visualizations and charts
- **Branded Design**: GusoSync branding and color scheme
- **Metadata**: Report information, generation details, and timestamps

## Setup Instructions

### 1. Environment Configuration

Add your Google Gemini API key to your environment variables:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your environment file

### 3. Dependencies

The following packages are required and should be installed:

```bash
pnpm add @google/genai mime jspdf html2canvas
```

## Usage

### From Analytics Dashboard

1. Navigate to `/dashboard/analytics`
2. Click the "Generate Report" button in the header
3. Configure report settings:
   - Select date range
   - Choose report type
4. Click "Generate Report" to create AI analysis
5. Preview the report content
6. Click "Download PDF" to get the formatted PDF

### Agent-Based Architecture

The report generation system uses a dedicated `ReportGenerationAgent` class that:

- **Manages Report Requests**: Tracks pending and completed report generation requests
- **AI Integration**: Uses Google Gemini AI for intelligent report generation
- **PDF Generation**: Creates professional PDF documents with proper formatting
- **Error Handling**: Provides robust error handling and fallback mechanisms
- **Status Monitoring**: Tracks agent status and report generation metrics

#### Agent Usage

```typescript
import { reportGenerationAgent } from '@/services/reportGenerationAgent';

// Generate a report
const result = await reportGenerationAgent.generateReport(
  analyticsData,
  'Last 30 days',
  'comprehensive',
  'user@example.com'
);

// Generate PDF
const pdfBuffer = await reportGenerationAgent.generatePDF(
  reportContent,
  metadata
);

// Get agent status
const status = reportGenerationAgent.getAgentStatus();
```

### API Endpoints

#### Get Agent Status
```
GET /dashboard/api/analytics/report-agent-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": {
      "isActive": true,
      "pendingRequests": 0,
      "completedReports": 5,
      "totalRequests": 5
    },
    "recentReports": [...],
    "totalReports": 5
  }
}
```

## Data Sources

The report generation system pulls data from multiple sources:

### 1. Incidents Data
- **Source**: `/api/issues` and `/api/drivers/incidents`
- **Metrics**: Total incidents, resolution rates, status distribution
- **Analysis**: Trend analysis, severity breakdown, response times

### 2. Personnel Data
- **Source**: `/api/control-center/personnel`
- **Metrics**: Staff counts, role distribution, attendance rates
- **Analysis**: Resource allocation, performance metrics

### 3. System Performance
- **Source**: `/api/buses`, `/api/routes`
- **Metrics**: Fleet utilization, route efficiency, system health
- **Analysis**: Operational efficiency, capacity utilization

### 4. Passenger Data
- **Source**: `/api/control-center/passengers`
- **Metrics**: Registration trends, growth rates, demographics
- **Analysis**: User engagement, service demand

### 5. Ticket Sales
- **Source**: `/api/tickets`
- **Metrics**: Sales volume, revenue, usage patterns
- **Analysis**: Financial performance, demand patterns

## Report Structure

### 1. Executive Summary
- Key findings overview
- Critical metrics summary
- High-level recommendations

### 2. Operational Metrics
- System performance indicators
- Resource utilization analysis
- Efficiency measurements

### 3. Incident Analysis
- Safety and security metrics
- Response time analysis
- Resolution effectiveness

### 4. Growth and Trends
- Passenger growth patterns
- Revenue trends
- Capacity planning insights

### 5. Recommendations
- Actionable improvement suggestions
- Priority-based action items
- Expected impact assessments

## Security and Permissions

### Access Control
- **Required Roles**: `CONTROL_STAFF` or `CONTROL_ADMIN`
- **Authentication**: Valid session token required
- **Authorization**: Role-based access verification

### Data Privacy
- Reports contain aggregated data only
- No personal information included
- Secure API communication
- Audit trail for report generation

## Troubleshooting

### Common Issues

1. **"AI report generation is not configured"**
   - Ensure `GEMINI_API_KEY` is set in environment variables
   - Verify API key is valid and active

2. **"Failed to fetch analytics data"**
   - Check backend API connectivity
   - Verify authentication tokens
   - Ensure required endpoints are accessible

3. **"Failed to generate PDF"**
   - Check browser compatibility
   - Verify PDF generation dependencies
   - Review server logs for detailed errors

### Error Handling
- Graceful fallbacks for missing data
- User-friendly error messages
- Detailed logging for debugging
- Retry mechanisms for transient failures

## Customization

### Report Templates
- Modify `lib/pdf-generator.ts` for PDF styling
- Update AI prompts in `generate-report/route.ts`
- Customize report sections and structure

### Branding
- Update colors in PDF generator
- Modify header and footer templates
- Add custom logos and styling

### Data Processing
- Extend data sources in analytics APIs
- Add new metrics and calculations
- Customize filtering and aggregation logic

## Performance Considerations

### Optimization
- Data caching for frequently accessed metrics
- Efficient PDF generation algorithms
- Streaming responses for large reports
- Background processing for complex analyses

### Limitations
- AI API rate limits (Gemini)
- PDF size constraints
- Browser memory for large datasets
- Network timeouts for slow connections

## Future Enhancements

### Planned Features
- Scheduled report generation
- Email delivery of reports
- Custom report templates
- Interactive charts in PDFs
- Multi-language support
- Advanced data visualizations

### Integration Opportunities
- Business intelligence tools
- External reporting systems
- Automated alerting based on insights
- Historical trend comparisons
- Predictive analytics capabilities
