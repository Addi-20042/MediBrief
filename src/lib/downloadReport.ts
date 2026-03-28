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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toSafeText = (value?: string): string => escapeHtml((value ?? "").trim());

const toSafeList = (values?: string[]): string[] =>
  (values ?? []).map((value) => toSafeText(value)).filter(Boolean);

const getReportKind = (title: string): string =>
  title.toLowerCase().includes("symptom") ? "Symptom review" : "Medical report review";

const getFileStamp = (): string => new Date().toISOString().split("T")[0];

const reportStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background: #f4f7fb;
  }

  .page {
    max-width: 880px;
    margin: 0 auto;
    background: #ffffff;
    padding: 36px 40px 40px;
  }

  .header {
    border-bottom: 3px solid #0f766e;
    padding-bottom: 18px;
    margin-bottom: 28px;
  }

  .brand {
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0f766e;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .title {
    font-size: 30px;
    line-height: 1.2;
    color: #0f172a;
    margin: 0 0 6px;
  }

  .subtitle {
    margin: 0;
    color: #475569;
    font-size: 15px;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 26px;
  }

  .meta-card {
    border: 1px solid #dbe4ee;
    border-radius: 12px;
    padding: 14px 16px;
    background: #f8fbff;
  }

  .meta-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    margin-bottom: 6px;
  }

  .meta-value {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
  }

  .section {
    margin-bottom: 22px;
  }

  .section-card {
    border: 1px solid #dbe4ee;
    border-radius: 14px;
    padding: 18px 20px;
    background: #ffffff;
  }

  .section-card.muted {
    background: #f8fbff;
  }

  .section-card.alert {
    background: #fff7ed;
    border-color: #fdba74;
  }

  .section-title {
    margin: 0 0 12px;
    font-size: 17px;
    color: #0f172a;
  }

  .section-text {
    margin: 0;
    color: #334155;
    white-space: pre-wrap;
  }

  .topic-card {
    border: 1px solid #dbe4ee;
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 14px;
    page-break-inside: avoid;
    break-inside: avoid;
    background: #ffffff;
  }

  .topic-header {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .topic-number {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #0f766e;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .topic-name {
    margin: 2px 0 0;
    font-size: 18px;
    color: #0f172a;
  }

  .supporting-block {
    margin-top: 14px;
  }

  .supporting-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    margin-bottom: 8px;
    font-weight: 700;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 600;
  }

  .list {
    margin: 0;
    padding-left: 18px;
    color: #334155;
  }

  .list li + li {
    margin-top: 8px;
  }

  .footer {
    margin-top: 28px;
    padding-top: 18px;
    border-top: 1px solid #dbe4ee;
    color: #64748b;
    font-size: 12px;
  }

  @media print {
    body {
      background: #ffffff;
    }

    .page {
      max-width: none;
      padding: 24px;
    }
  }
`;

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

const buildTopicCards = (conditions: ConditionData[]): string => {
  if (conditions.length === 0) {
    return `
      <div class="section-card muted">
        <h2 class="section-title">Topics for Follow-Up</h2>
        <p class="section-text">No follow-up topics were generated for this report.</p>
      </div>
    `;
  }

  return `
    <div class="section">
      <div class="section-card muted" style="margin-bottom: 14px;">
        <h2 class="section-title">Topics for Follow-Up</h2>
        <p class="section-text">Use these notes to guide a calm, informed discussion with a licensed healthcare professional.</p>
      </div>
      ${conditions
        .map((condition, index) => {
          const matchingSymptoms = toSafeList(condition.matchingSymptoms);
          const relatedFindings = toSafeList(condition.relatedFindings);
          const recommendations = toSafeList(condition.recommendations);

          return `
            <div class="topic-card">
              <div class="topic-header">
                <div class="topic-number">${index + 1}</div>
                <div>
                  <h3 class="topic-name">${toSafeText(condition.name || "Clinical note")}</h3>
                </div>
              </div>

              ${condition.description ? `<p class="section-text">${toSafeText(condition.description)}</p>` : ""}

              ${matchingSymptoms.length > 0 ? `
                <div class="supporting-block">
                  <div class="supporting-label">Relevant Symptoms</div>
                  <div class="tag-row">${matchingSymptoms.map((symptom) => `<span class="tag">${symptom}</span>`).join("")}</div>
                </div>
              ` : ""}

              ${relatedFindings.length > 0 ? `
                <div class="supporting-block">
                  <div class="supporting-label">Relevant Findings</div>
                  <div class="tag-row">${relatedFindings.map((finding) => `<span class="tag">${finding}</span>`).join("")}</div>
                </div>
              ` : ""}

              ${recommendations.length > 0 ? `
                <div class="supporting-block">
                  <div class="supporting-label">Suggested Next Steps</div>
                  <ul class="list">
                    ${recommendations.map((recommendation) => `<li>${recommendation}</li>`).join("")}
                  </ul>
                </div>
              ` : ""}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
};

const buildReportBody = (data: ReportData): string => {
  const title = toSafeText(data.title || "Health Report");
  const date = toSafeText(data.date || new Date().toLocaleString());
  const inputData = toSafeText(data.inputData);
  const summary = toSafeText(data.summary);
  const generalAdvice = toSafeText(data.generalAdvice);
  const recommendations = toSafeList(data.recommendations);
  const disclaimer = toSafeText(
    data.disclaimer ||
      "This report is intended for educational support only and should not replace evaluation, diagnosis, or treatment from a licensed healthcare professional."
  );

  return `
    <div class="page">
      <div class="header">
        <div class="brand">MediBrief</div>
        <h1 class="title">${title}</h1>
        <p class="subtitle">Prepared as a patient-friendly reference to support discussion with a clinician.</p>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="meta-label">Prepared On</div>
          <div class="meta-value">${date}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Report Type</div>
          <div class="meta-value">${toSafeText(getReportKind(data.title || ""))}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Items Included</div>
          <div class="meta-value">${data.conditions.length}</div>
        </div>
      </div>

      ${inputData ? `
        <div class="section">
          <div class="section-card">
            <h2 class="section-title">Submitted Information</h2>
            <p class="section-text">${inputData}</p>
          </div>
        </div>
      ` : ""}

      ${summary ? `
        <div class="section">
          <div class="section-card muted">
            <h2 class="section-title">Health Overview</h2>
            <p class="section-text">${summary}</p>
          </div>
        </div>
      ` : ""}

      ${buildTopicCards(data.conditions)}

      ${generalAdvice ? `
        <div class="section">
          <div class="section-card">
            <h2 class="section-title">Care Guidance</h2>
            <p class="section-text">${generalAdvice}</p>
          </div>
        </div>
      ` : ""}

      ${recommendations.length > 0 ? `
        <div class="section">
          <div class="section-card">
            <h2 class="section-title">Suggested Next Steps</h2>
            <ul class="list">
              ${recommendations.map((recommendation) => `<li>${recommendation}</li>`).join("")}
            </ul>
          </div>
        </div>
      ` : ""}

      <div class="section">
        <div class="section-card alert">
          <h2 class="section-title">Important Note</h2>
          <p class="section-text">${disclaimer}</p>
        </div>
      </div>

      <div class="footer">
        <div>Generated by MediBrief on ${date}</div>
        <div>Keep this report with your records and share it with a licensed clinician if you need follow-up care.</div>
      </div>
    </div>
  `;
};

export const generateReportHTML = (data: ReportData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toSafeText(data.title || "Health Report")} - MediBrief</title>
  <style>${reportStyles}</style>
</head>
<body>
  ${buildReportBody(data)}
</body>
</html>
`;

export const generateReportText = (data: ReportData): string => {
  let text = `MEDIBRIEF - ${data.title.toUpperCase()}\n`;
  text += `${"=".repeat(72)}\n`;
  text += `Prepared On: ${data.date}\n`;
  text += `Report Type: ${getReportKind(data.title)}\n`;
  text += `Items Included: ${data.conditions.length}\n\n`;

  if (data.inputData) {
    text += `SUBMITTED INFORMATION\n${"-".repeat(32)}\n`;
    text += `${data.inputData}\n\n`;
  }

  if (data.summary) {
    text += `HEALTH OVERVIEW\n${"-".repeat(32)}\n`;
    text += `${data.summary}\n\n`;
  }

  if (data.conditions.length > 0) {
    text += `TOPICS FOR FOLLOW-UP\n${"-".repeat(32)}\n`;
    data.conditions.forEach((condition, index) => {
      text += `${index + 1}. ${condition.name}\n`;
      if (condition.description) {
        text += `   ${condition.description}\n`;
      }
      if (condition.matchingSymptoms && condition.matchingSymptoms.length > 0) {
        text += `   Relevant Symptoms: ${condition.matchingSymptoms.join(", ")}\n`;
      }
      if (condition.relatedFindings && condition.relatedFindings.length > 0) {
        text += `   Relevant Findings: ${condition.relatedFindings.join(", ")}\n`;
      }
      if (condition.recommendations && condition.recommendations.length > 0) {
        text += `   Suggested Next Steps:\n`;
        condition.recommendations.forEach((recommendation) => {
          text += `   - ${recommendation}\n`;
        });
      }
      text += `\n`;
    });
  }

  if (data.generalAdvice) {
    text += `CARE GUIDANCE\n${"-".repeat(32)}\n`;
    text += `${data.generalAdvice}\n\n`;
  }

  if (data.recommendations && data.recommendations.length > 0) {
    text += `SUGGESTED NEXT STEPS\n${"-".repeat(32)}\n`;
    data.recommendations.forEach((recommendation, index) => {
      text += `${index + 1}. ${recommendation}\n`;
    });
    text += `\n`;
  }

  text += `IMPORTANT NOTE\n${"-".repeat(32)}\n`;
  text += `${data.disclaimer || "This report is intended for educational support only and should not replace evaluation, diagnosis, or treatment from a licensed healthcare professional."}\n\n`;
  text += `Generated by MediBrief on ${data.date}\n`;

  return text;
};

export const downloadReportPDF = async (data: ReportData) => {
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.createElement("div");
    element.innerHTML = `<style>${reportStyles}</style>${buildReportBody(data)}`;

    await html2pdf()
      .set({
        margin: [0.35, 0.35, 0.35, 0.35] as [number, number, number, number],
        filename: `medibrief-health-report-${getFileStamp()}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: { unit: "in" as const, format: "a4", orientation: "portrait" as const },
      })
      .from(element)
      .save();
  } catch (error) {
    console.error("PDF generation failed, falling back to HTML:", error);
    downloadReportHTML(data);
  }
};

export const downloadReportHTML = (data: ReportData) => {
  const html = generateReportHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `medibrief-health-report-${getFileStamp()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadReport = (data: ReportData) => {
  void downloadReportPDF(data);
};

export const downloadReportText = (data: ReportData) => {
  const text = generateReportText(data);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `medibrief-health-report-${getFileStamp()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReport = (data: ReportData) => {
  const html = generateReportHTML(data);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export type ExportFormat = "pdf" | "html" | "txt";

export const exportReport = async (data: ReportData, format: ExportFormat = "pdf") => {
  switch (format) {
    case "pdf":
      await downloadReportPDF(data);
      break;
    case "html":
      downloadReportHTML(data);
      break;
    case "txt":
      downloadReportText(data);
      break;
    default:
      await downloadReportPDF(data);
  }
};
