interface ConditionData {
  name: string;
  probability?: string;
  likelihood?: string;
  description?: string;
  matchingSymptoms?: string[];
  relatedFindings?: string[];
  recommendations?: string[];
  urgency?: string;
}

interface ReportData {
  title: string;
  date: string;
  inputData?: string;
  conditions: ConditionData[];
  summary?: string;
  generalAdvice?: string;
  recommendations?: string[];
  disclaimer?: string;
}

export const getProbabilityPercent = (probability: string): number => {
  switch (probability.toLowerCase()) {
    case "high":
      return 85;
    case "medium":
      return 60;
    case "low":
      return 35;
    case "very low":
      return 15;
    default:
      return 50;
  }
};

export const getProbabilityLabel = (probability: string): string => {
  const percent = getProbabilityPercent(probability);
  return `${percent}% match`;
};

// Generate professional HTML report for print/download
export const generateReportHTML = (data: ReportData): string => {
  const conditionsHTML = data.conditions
    .map((condition, index) => {
      const probability = condition.probability || condition.likelihood || "Unknown";
      const probabilityPercent = getProbabilityPercent(probability);
      const urgencyColor = getUrgencyColorHex(condition.urgency || "Routine");
      const probabilityColor = getProbabilityColorHex(probability);

      return `
        <div class="condition-card">
          <div class="condition-header">
            <div class="condition-rank">${index + 1}</div>
            <div class="condition-title">
              <h3>${condition.name}</h3>
              ${condition.urgency ? `<span class="urgency-badge" style="background: ${urgencyColor}">${condition.urgency}</span>` : ''}
            </div>
            <div class="probability-badge" style="background: ${probabilityColor}">${probabilityPercent}% Match</div>
          </div>
          
          <div class="probability-bar-container">
            <div class="probability-bar" style="width: ${probabilityPercent}%; background: ${probabilityColor}"></div>
          </div>
          
          ${condition.description ? `<p class="condition-description">${condition.description}</p>` : ''}
          
          ${condition.matchingSymptoms && condition.matchingSymptoms.length > 0 ? `
            <div class="section">
              <h4>Matching Symptoms</h4>
              <div class="tags">
                ${condition.matchingSymptoms.map(s => `<span class="tag">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${condition.relatedFindings && condition.relatedFindings.length > 0 ? `
            <div class="section">
              <h4>Related Findings</h4>
              <div class="tags">
                ${condition.relatedFindings.map(f => `<span class="tag">${f}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${condition.recommendations && condition.recommendations.length > 0 ? `
            <div class="section">
              <h4>Recommendations</h4>
              <ul class="recommendations-list">
                ${condition.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - Medical AI Report</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .header .subtitle {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .meta-info {
      display: flex;
      justify-content: space-between;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      border: 1px solid #e5e7eb;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .meta-value {
      font-weight: 600;
      color: #111827;
      margin-top: 4px;
    }
    
    .input-section {
      background: #f0fdfa;
      border-left: 4px solid #0d9488;
      padding: 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 25px;
    }
    
    .input-section h2 {
      font-size: 14px;
      color: #0d9488;
      margin-bottom: 10px;
    }
    
    .input-section p {
      color: #374151;
    }
    
    .summary-section {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 25px;
    }
    
    .summary-section h2 {
      font-size: 14px;
      color: #d97706;
      margin-bottom: 10px;
    }
    
    .conditions-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .conditions-header h2 {
      font-size: 20px;
      color: #111827;
    }
    
    .condition-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      background: white;
      page-break-inside: avoid;
    }
    
    .condition-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .condition-rank {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }
    
    .condition-title {
      flex: 1;
    }
    
    .condition-title h3 {
      font-size: 18px;
      color: #111827;
      margin-bottom: 4px;
    }
    
    .urgency-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 9999px;
      color: white;
      font-weight: 500;
    }
    
    .probability-badge {
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 9999px;
      color: white;
      font-weight: 600;
    }
    
    .probability-bar-container {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin-bottom: 15px;
      overflow: hidden;
    }
    
    .probability-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .condition-description {
      color: #4b5563;
      margin-bottom: 15px;
      font-size: 14px;
    }
    
    .section {
      margin-top: 15px;
    }
    
    .section h4 {
      font-size: 13px;
      color: #374151;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .tag {
      background: #f3f4f6;
      color: #374151;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
    }
    
    .recommendations-list {
      list-style: none;
      padding-left: 0;
    }
    
    .recommendations-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #4b5563;
    }
    
    .recommendations-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }
    
    .general-advice {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
    }
    
    .general-advice h2 {
      font-size: 16px;
      color: #111827;
      margin-bottom: 10px;
    }
    
    .recommendations-section {
      margin-bottom: 25px;
    }
    
    .recommendations-section h2 {
      font-size: 16px;
      color: #111827;
      margin-bottom: 15px;
    }
    
    .disclaimer {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
    }
    
    .disclaimer h2 {
      font-size: 14px;
      color: #dc2626;
      margin-bottom: 8px;
    }
    
    .disclaimer p {
      font-size: 13px;
      color: #7f1d1d;
    }
    
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    
    .footer .logo {
      font-size: 18px;
      font-weight: 700;
      color: #0d9488;
      margin-bottom: 5px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .condition-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 Medical AI</h1>
    <p class="subtitle">${data.title}</p>
  </div>
  
  <div class="meta-info">
    <div class="meta-item">
      <div class="meta-label">Report Date</div>
      <div class="meta-value">${data.date}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Conditions Found</div>
      <div class="meta-value">${data.conditions.length}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Report Type</div>
      <div class="meta-value">${data.title.includes("Symptom") ? "Symptom Analysis" : "Report Analysis"}</div>
    </div>
  </div>
  
  ${data.inputData ? `
    <div class="input-section">
      <h2>📋 Input Data</h2>
      <p>${data.inputData}</p>
    </div>
  ` : ''}
  
  ${data.summary ? `
    <div class="summary-section">
      <h2>📝 AI Summary</h2>
      <p>${data.summary}</p>
    </div>
  ` : ''}
  
  <div class="conditions-header">
    <h2>🔬 Possible Conditions</h2>
  </div>
  
  ${conditionsHTML}
  
  ${data.generalAdvice ? `
    <div class="general-advice">
      <h2>💡 General Advice</h2>
      <p>${data.generalAdvice}</p>
    </div>
  ` : ''}
  
  ${data.recommendations && data.recommendations.length > 0 ? `
    <div class="recommendations-section">
      <h2>✅ Recommendations</h2>
      <ul class="recommendations-list">
        ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  ` : ''}
  
  <div class="disclaimer">
    <h2>⚠️ Medical Disclaimer</h2>
    <p>${data.disclaimer || "This analysis is for educational purposes only and should not be considered medical advice. Please consult a healthcare professional for proper diagnosis and treatment."}</p>
  </div>
  
  <div class="footer">
    <div class="logo">Medical AI</div>
    <p>Generated on ${data.date}</p>
    <p>This report was generated by AI for educational purposes only.</p>
  </div>
</body>
</html>
  `;
};

const getUrgencyColorHex = (urgency: string): string => {
  switch (urgency.toLowerCase()) {
    case "emergency":
      return "#dc2626";
    case "urgent":
      return "#f59e0b";
    case "routine":
      return "#3b82f6";
    default:
      return "#10b981";
  }
};

const getProbabilityColorHex = (probability: string): string => {
  switch (probability.toLowerCase()) {
    case "high":
      return "#dc2626";
    case "medium":
      return "#f59e0b";
    default:
      return "#10b981";
  }
};

// Generate plain text report for backward compatibility
export const generateReportText = (data: ReportData): string => {
  let text = `${"=".repeat(60)}\n`;
  text += `MEDICAL AI - ${data.title.toUpperCase()}\n`;
  text += `${"=".repeat(60)}\n\n`;
  text += `Date: ${data.date}\n\n`;

  if (data.inputData) {
    text += `INPUT DATA\n${"-".repeat(40)}\n`;
    text += `${data.inputData}\n\n`;
  }

  if (data.summary) {
    text += `SUMMARY\n${"-".repeat(40)}\n`;
    text += `${data.summary}\n\n`;
  }

  if (data.conditions && data.conditions.length > 0) {
    text += `POSSIBLE CONDITIONS\n${"-".repeat(40)}\n\n`;

    data.conditions.forEach((condition, index) => {
      const probability = condition.probability || condition.likelihood || "Unknown";
      const probabilityPercent = getProbabilityPercent(probability);
      
      text += `${index + 1}. ${condition.name}\n`;
      text += `   Probability: ${probability} (${probabilityPercent}%)\n`;
      
      if (condition.urgency) {
        text += `   Urgency: ${condition.urgency}\n`;
      }
      
      if (condition.description) {
        text += `   Description: ${condition.description}\n`;
      }

      if (condition.matchingSymptoms && condition.matchingSymptoms.length > 0) {
        text += `   Matching Symptoms: ${condition.matchingSymptoms.join(", ")}\n`;
      }

      if (condition.relatedFindings && condition.relatedFindings.length > 0) {
        text += `   Related Findings: ${condition.relatedFindings.join(", ")}\n`;
      }

      if (condition.recommendations && condition.recommendations.length > 0) {
        text += `   Recommendations:\n`;
        condition.recommendations.forEach((rec) => {
          text += `      - ${rec}\n`;
        });
      }

      text += `\n`;
    });
  }

  if (data.generalAdvice) {
    text += `GENERAL ADVICE\n${"-".repeat(40)}\n`;
    text += `${data.generalAdvice}\n\n`;
  }

  if (data.recommendations && data.recommendations.length > 0) {
    text += `RECOMMENDATIONS\n${"-".repeat(40)}\n`;
    data.recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`;
    });
    text += `\n`;
  }

  text += `${"=".repeat(60)}\n`;
  text += `MEDICAL DISCLAIMER\n`;
  text += `${"=".repeat(60)}\n`;
  text += data.disclaimer || 
    "This analysis is for educational purposes only and should not be considered medical advice. Please consult a healthcare professional for proper diagnosis and treatment.";
  text += `\n\n`;
  text += `Generated by Medical AI on ${data.date}\n`;

  return text;
};

// Download as PDF (primary format)
export const downloadReportPDF = async (data: ReportData) => {
  const html = generateReportHTML(data);
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);
  
  try {
    // Dynamically import html2pdf
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: 0.5,
      filename: `medical-ai-report-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    await html2pdf().set(opt).from(container.querySelector('body') || container).save();
  } catch (error) {
    console.error('PDF generation failed, falling back to HTML:', error);
    // Fallback to HTML download
    downloadReportHTML(data);
  } finally {
    document.body.removeChild(container);
  }
};

// Download as HTML
export const downloadReportHTML = (data: ReportData) => {
  const html = generateReportHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `medical-ai-report-${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Legacy function for backward compatibility
export const downloadReport = (data: ReportData) => {
  downloadReportPDF(data);
};

// Download as plain text
export const downloadReportText = (data: ReportData) => {
  const text = generateReportText(data);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `medical-ai-report-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Print report in a new window with professional styling
export const printReport = (data: ReportData) => {
  const html = generateReportHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

// Export format type
export type ExportFormat = 'pdf' | 'html' | 'txt';

// Unified export function
export const exportReport = async (data: ReportData, format: ExportFormat = 'pdf') => {
  switch (format) {
    case 'pdf':
      await downloadReportPDF(data);
      break;
    case 'html':
      downloadReportHTML(data);
      break;
    case 'txt':
      downloadReportText(data);
      break;
    default:
      await downloadReportPDF(data);
  }
};
