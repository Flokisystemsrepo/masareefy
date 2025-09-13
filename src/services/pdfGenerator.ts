import jsPDF from "jspdf";

interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  brandName: string;
  reportHeader: string;
  reportFooter: string;
  logoUrl?: string;
}

interface ReportData {
  title: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  metrics: any;
  insights?: string[];
  generatedAt: string;
}

export class PDFGenerator {
  private doc: jsPDF;
  private brandSettings: BrandSettings;
  private currentY: number = 0;
  private pageHeight: number = 0;
  private margin: number = 20;

  constructor(brandSettings: BrandSettings) {
    this.brandSettings = brandSettings;
    this.doc = new jsPDF("p", "mm", "a4");
    this.pageHeight = this.doc.internal.pageSize.height;
    this.currentY = this.margin;
  }

  // Convert hex color to RGB
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }

  // Add header with brand styling
  private addHeader(reportData: ReportData): void {
    const { primaryColor, brandName, reportHeader } = this.brandSettings;
    const [r, g, b] = this.hexToRgb(primaryColor);

    // Brand header background
    this.doc.setFillColor(r, g, b);
    this.doc.rect(0, 0, this.doc.internal.pageSize.width, 40, "F");

    // Brand name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(brandName, this.margin, 15);

    // Report title
    this.doc.setFontSize(20);
    this.doc.text(reportHeader || reportData.title, this.margin, 25);

    // Date range
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    const dateText = `${new Date(
      reportData.dateRange.startDate
    ).toLocaleDateString()} - ${new Date(
      reportData.dateRange.endDate
    ).toLocaleDateString()}`;
    this.doc.text(dateText, this.margin, 35);

    this.currentY = 50;
  }

  // Add footer with brand styling
  private addFooter(): void {
    const { secondaryColor, reportFooter } = this.brandSettings;
    const [r, g, b] = this.hexToRgb(secondaryColor);

    const footerY = this.pageHeight - 20;

    // Footer background
    this.doc.setFillColor(r, g, b);
    this.doc.rect(0, footerY - 10, this.doc.internal.pageSize.width, 10, "F");

    // Footer text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(reportFooter, this.margin, footerY - 3);

    // Generated date
    const generatedText = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    this.doc.text(
      generatedText,
      this.doc.internal.pageSize.width -
        this.margin -
        this.doc.getTextWidth(generatedText),
      footerY - 3
    );
  }

  // Add a section with title and content
  private addSection(title: string, content: string[], color?: string): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    // Add spacing before section
    this.currentY += 5;

    // Section title with background
    if (color) {
      const [r, g, b] = this.hexToRgb(color);
      this.doc.setFillColor(r, g, b);
      this.doc.rect(
        this.margin - 5,
        this.currentY - 3,
        this.doc.internal.pageSize.width - this.margin * 2 + 10,
        8,
        "F"
      );
      this.doc.setTextColor(255, 255, 255);
    } else {
      this.doc.setFillColor(240, 240, 240);
      this.doc.rect(
        this.margin - 5,
        this.currentY - 3,
        this.doc.internal.pageSize.width - this.margin * 2 + 10,
        8,
        "F"
      );
      this.doc.setTextColor(0, 0, 0);
    }

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY + 2);
    this.currentY += 12;

    // Section content with better formatting
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");

    content.forEach((line, index) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Add bullet points for list items
      if (line.includes(":") && !line.startsWith("Top")) {
        // This is a list item
        this.doc.text("•", this.margin, this.currentY);
        this.doc.text(line, this.margin + 5, this.currentY);
      } else {
        // This is a header or regular text
        this.doc.text(line, this.margin, this.currentY);
      }

      this.currentY += 5;
    });

    this.currentY += 8;
  }

  // Add metrics table
  private addMetricsTable(metrics: any): void {
    if (this.currentY > this.pageHeight - 120) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    const { accentColor } = this.brandSettings;
    const [r, g, b] = this.hexToRgb(accentColor);

    // Section title
    this.currentY += 5;
    this.doc.setFillColor(r, g, b);
    this.doc.rect(
      this.margin - 5,
      this.currentY - 3,
      this.doc.internal.pageSize.width - this.margin * 2 + 10,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Key Financial Metrics", this.margin, this.currentY + 2);
    this.currentY += 15;

    // Table header
    this.doc.setFillColor(50, 50, 50);
    this.doc.rect(
      this.margin,
      this.currentY,
      this.doc.internal.pageSize.width - this.margin * 2,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Financial Metric", this.margin + 3, this.currentY + 5);
    this.doc.text("Amount", this.margin + 100, this.currentY + 5);
    this.doc.text("Percentage", this.margin + 150, this.currentY + 5);
    this.currentY += 8;

    // Table rows with better organization
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);

    const metricRows = [
      {
        category: "Revenue",
        metrics: [
          ["Total Revenue", this.formatCurrency(metrics.totalRevenue || 0), ""],
        ],
      },
      {
        category: "Costs",
        metrics: [
          ["Total Costs", this.formatCurrency(metrics.totalCosts || 0), ""],
        ],
      },
      {
        category: "Profitability",
        metrics: [
          ["Gross Profit", this.formatCurrency(metrics.grossProfit || 0), ""],
          [
            "Gross Profit Margin",
            "",
            `${(metrics.grossProfitMargin || 0).toFixed(1)}%`,
          ],
          ["Net Profit", this.formatCurrency(metrics.netProfit || 0), ""],
          [
            "Net Profit Margin",
            "",
            `${(metrics.netProfitMargin || 0).toFixed(1)}%`,
          ],
        ],
      },
      {
        category: "Growth",
        metrics: [
          ["Revenue Growth", "", `${(metrics.revenueGrowth || 0).toFixed(1)}%`],
          ["Cost Growth", "", `${(metrics.costGrowth || 0).toFixed(1)}%`],
          ["Profit Growth", "", `${(metrics.profitGrowth || 0).toFixed(1)}%`],
        ],
      },
    ];

    metricRows.forEach((section, sectionIndex) => {
      // Category header
      this.doc.setFillColor(245, 245, 245);
      this.doc.rect(
        this.margin,
        this.currentY,
        this.doc.internal.pageSize.width - this.margin * 2,
        6,
        "F"
      );
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.text(section.category, this.margin + 3, this.currentY + 4);
      this.currentY += 6;

      // Category metrics
      section.metrics.forEach(([metric, amount, percentage], index) => {
        if (this.currentY > this.pageHeight - 30) {
          this.doc.addPage();
          this.currentY = this.margin;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          this.doc.setFillColor(250, 250, 250);
          this.doc.rect(
            this.margin,
            this.currentY,
            this.doc.internal.pageSize.width - this.margin * 2,
            6,
            "F"
          );
        }

        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(9);
        this.doc.text(metric, this.margin + 3, this.currentY + 4);

        if (amount) {
          this.doc.text(amount, this.margin + 100, this.currentY + 4);
        }

        if (percentage) {
          this.doc.text(percentage, this.margin + 150, this.currentY + 4);
        }

        this.currentY += 6;
      });

      this.currentY += 2;
    });

    this.currentY += 10;
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Add organized revenue analysis
  private addRevenueAnalysis(revenueSources: any[]): void {
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    const { primaryColor } = this.brandSettings;
    const [r, g, b] = this.hexToRgb(primaryColor);

    // Section title
    this.currentY += 5;
    this.doc.setFillColor(r, g, b);
    this.doc.rect(
      this.margin - 5,
      this.currentY - 3,
      this.doc.internal.pageSize.width - this.margin * 2 + 10,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Revenue Analysis", this.margin, this.currentY + 2);
    this.currentY += 15;

    // Table header
    this.doc.setFillColor(50, 50, 50);
    this.doc.rect(
      this.margin,
      this.currentY,
      this.doc.internal.pageSize.width - this.margin * 2,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Revenue Source", this.margin + 3, this.currentY + 5);
    this.doc.text("Amount", this.margin + 100, this.currentY + 5);
    this.doc.text("Percentage", this.margin + 150, this.currentY + 5);
    this.doc.text("Status", this.margin + 190, this.currentY + 5);
    this.currentY += 8;

    // Revenue sources table
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);

    revenueSources.slice(0, 5).forEach((source: any, index: number) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(
          this.margin,
          this.currentY,
          this.doc.internal.pageSize.width - this.margin * 2,
          6,
          "F"
        );
      }

      this.doc.text(source.source, this.margin + 3, this.currentY + 4);
      this.doc.text(
        this.formatCurrency(source.amount),
        this.margin + 100,
        this.currentY + 4
      );
      this.doc.text(
        `${source.percentage.toFixed(1)}%`,
        this.margin + 150,
        this.currentY + 4
      );

      // Status indicator
      let status = "";
      let statusColor = [0, 0, 0];
      if (source.percentage > 50) {
        status = "Primary";
        statusColor = [0, 128, 0];
      } else if (source.percentage > 20) {
        status = "Major";
        statusColor = [255, 165, 0];
      } else {
        status = "Minor";
        statusColor = [128, 128, 128];
      }

      this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      this.doc.text(status, this.margin + 190, this.currentY + 4);
      this.doc.setTextColor(0, 0, 0);

      this.currentY += 6;
    });

    this.currentY += 10;
  }

  // Add organized cost analysis
  private addCostAnalysis(costCategories: any[]): void {
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    const { secondaryColor } = this.brandSettings;
    const [r, g, b] = this.hexToRgb(secondaryColor);

    // Section title
    this.currentY += 5;
    this.doc.setFillColor(r, g, b);
    this.doc.rect(
      this.margin - 5,
      this.currentY - 3,
      this.doc.internal.pageSize.width - this.margin * 2 + 10,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Cost Analysis", this.margin, this.currentY + 2);
    this.currentY += 15;

    // Table header
    this.doc.setFillColor(50, 50, 50);
    this.doc.rect(
      this.margin,
      this.currentY,
      this.doc.internal.pageSize.width - this.margin * 2,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Cost Category", this.margin + 3, this.currentY + 5);
    this.doc.text("Amount", this.margin + 100, this.currentY + 5);
    this.doc.text("Percentage", this.margin + 150, this.currentY + 5);
    this.doc.text("Priority", this.margin + 190, this.currentY + 5);
    this.currentY += 8;

    // Cost categories table
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);

    costCategories.slice(0, 5).forEach((category: any, index: number) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(
          this.margin,
          this.currentY,
          this.doc.internal.pageSize.width - this.margin * 2,
          6,
          "F"
        );
      }

      this.doc.text(category.category, this.margin + 3, this.currentY + 4);
      this.doc.text(
        this.formatCurrency(category.amount),
        this.margin + 100,
        this.currentY + 4
      );
      this.doc.text(
        `${category.percentage.toFixed(1)}%`,
        this.margin + 150,
        this.currentY + 4
      );

      // Priority indicator
      let priority = "";
      let priorityColor = [0, 0, 0];
      if (category.percentage > 40) {
        priority = "High";
        priorityColor = [220, 20, 60];
      } else if (category.percentage > 20) {
        priority = "Medium";
        priorityColor = [255, 165, 0];
      } else {
        priority = "Low";
        priorityColor = [0, 128, 0];
      }

      this.doc.setTextColor(
        priorityColor[0],
        priorityColor[1],
        priorityColor[2]
      );
      this.doc.text(priority, this.margin + 190, this.currentY + 4);
      this.doc.setTextColor(0, 0, 0);

      this.currentY += 6;
    });

    this.currentY += 10;
  }

  // Add insights section with better organization
  private addInsights(insights: string[]): void {
    if (!insights || insights.length === 0) return;

    if (this.currentY > this.pageHeight - 120) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    const { accentColor } = this.brandSettings;
    const [r, g, b] = this.hexToRgb(accentColor);

    // Section title
    this.currentY += 5;
    this.doc.setFillColor(r, g, b);
    this.doc.rect(
      this.margin - 5,
      this.currentY - 3,
      this.doc.internal.pageSize.width - this.margin * 2 + 10,
      8,
      "F"
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      "Business Insights & Recommendations",
      this.margin,
      this.currentY + 2
    );
    this.currentY += 15;

    // Organize insights by category
    const organizedInsights = this.organizeInsights(insights);

    // Add each category
    Object.entries(organizedInsights).forEach(
      ([category, categoryInsights]) => {
        if (this.currentY > this.pageHeight - 40) {
          this.doc.addPage();
          this.currentY = this.margin;
        }

        // Category header
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(
          this.margin,
          this.currentY,
          this.doc.internal.pageSize.width - this.margin * 2,
          6,
          "F"
        );
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(10);
        this.doc.text(category, this.margin + 3, this.currentY + 4);
        this.currentY += 8;

        // Category insights
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 0);

        categoryInsights.forEach((insight: string, index: number) => {
          if (this.currentY > this.pageHeight - 30) {
            this.doc.addPage();
            this.currentY = this.margin;
          }

          // Clean up the insight text (remove emojis and format better)
          const cleanInsight = this.cleanInsightText(insight);

          // Add bullet point
          this.doc.text("•", this.margin + 3, this.currentY + 3);

          // Add insight text with proper wrapping
          const maxWidth =
            this.doc.internal.pageSize.width - this.margin * 2 - 10;
          const lines = this.doc.splitTextToSize(cleanInsight, maxWidth);

          lines.forEach((line: string, lineIndex: number) => {
            if (this.currentY > this.pageHeight - 30) {
              this.doc.addPage();
              this.currentY = this.margin;
            }

            this.doc.text(line, this.margin + 8, this.currentY + 3);
            this.currentY += 4;
          });

          this.currentY += 2;
        });

        this.currentY += 5;
      }
    );

    this.currentY += 10;
  }

  // Organize insights by category
  private organizeInsights(insights: string[]): { [key: string]: string[] } {
    const organized: { [key: string]: string[] } = {
      "Performance Highlights": [],
      "Areas for Improvement": [],
      "Strategic Recommendations": [],
      "Action Items": [],
    };

    insights.forEach((insight) => {
      if (
        insight.includes("✅") ||
        insight.includes("Strong") ||
        insight.includes("Excellent") ||
        insight.includes("above")
      ) {
        organized["Performance Highlights"].push(insight);
      } else if (
        insight.includes("⚠️") ||
        insight.includes("Low") ||
        insight.includes("declined") ||
        insight.includes("High")
      ) {
        organized["Areas for Improvement"].push(insight);
      } else if (
        insight.includes("📊") ||
        insight.includes("💰") ||
        insight.includes("Consider") ||
        insight.includes("Focus")
      ) {
        organized["Strategic Recommendations"].push(insight);
      } else if (
        insight.includes("📈") ||
        insight.includes("🎯") ||
        insight.includes("Review") ||
        insight.includes("setting up")
      ) {
        organized["Action Items"].push(insight);
      } else {
        organized["Strategic Recommendations"].push(insight);
      }
    });

    // Remove empty categories
    Object.keys(organized).forEach((key) => {
      if (organized[key].length === 0) {
        delete organized[key];
      }
    });

    return organized;
  }

  // Clean up insight text for better readability
  private cleanInsightText(insight: string): string {
    return insight
      .replace(/✅/g, "")
      .replace(/⚠️/g, "")
      .replace(/📊/g, "")
      .replace(/💰/g, "")
      .replace(/📈/g, "")
      .replace(/🎯/g, "")
      .replace(/•/g, "")
      .trim();
  }

  // Generate P&L Report PDF
  public generatePLReport(reportData: ReportData): void {
    this.addHeader(reportData);
    this.addMetricsTable(reportData.metrics);

    // Add revenue analysis with better organization
    if (reportData.metrics.topRevenueSources) {
      this.addRevenueAnalysis(reportData.metrics.topRevenueSources);
    }

    // Add cost analysis with better organization
    if (reportData.metrics.topCostCategories) {
      this.addCostAnalysis(reportData.metrics.topCostCategories);
    }

    // Add insights
    if (reportData.insights) {
      this.addInsights(reportData.insights);
    }

    this.addFooter();
  }

  // Generate Revenue Report PDF
  public generateRevenueReport(reportData: ReportData): void {
    this.addHeader(reportData);
    this.addMetricsTable(reportData.metrics);

    if (reportData.metrics.topRevenueSources) {
      this.addRevenueAnalysis(reportData.metrics.topRevenueSources);
    }

    this.addInsights(reportData.insights || []);
    this.addFooter();
  }

  // Generate Costs Report PDF
  public generateCostsReport(reportData: ReportData): void {
    this.addHeader(reportData);
    this.addMetricsTable(reportData.metrics);

    if (reportData.metrics.topCostCategories) {
      this.addCostAnalysis(reportData.metrics.topCostCategories);
    }

    this.addInsights(reportData.insights || []);
    this.addFooter();
  }

  // Generate generic report PDF
  public generateGenericReport(reportData: ReportData): void {
    this.addHeader(reportData);
    this.addMetricsTable(reportData.metrics);
    this.addInsights(reportData.insights || []);
    this.addFooter();
  }

  // Save the PDF
  public save(filename: string): void {
    this.doc.save(filename);
  }

  // Get PDF as blob for download
  public getBlob(): Blob {
    return this.doc.output("blob");
  }
}

// Utility function to generate insights based on metrics
export function generateInsights(metrics: any): string[] {
  const insights: string[] = [];

  // Performance Highlights
  if (metrics.revenueGrowth > 10) {
    insights.push(
      `Strong revenue growth of ${metrics.revenueGrowth.toFixed(
        1
      )}% indicates healthy business performance and market demand.`
    );
  }

  if (metrics.grossProfitMargin > 30) {
    insights.push(
      `Excellent gross profit margin of ${metrics.grossProfitMargin.toFixed(
        1
      )}% is significantly above the industry average of 25%.`
    );
  }

  if (metrics.costGrowth < 0) {
    insights.push(
      `Effective cost management demonstrated by ${Math.abs(
        metrics.costGrowth
      ).toFixed(1)}% reduction in operational costs.`
    );
  }

  if (metrics.profitGrowth > 20) {
    insights.push(
      `Outstanding profit growth of ${metrics.profitGrowth.toFixed(
        1
      )}% shows strong operational efficiency.`
    );
  }

  // Areas for Improvement
  if (metrics.revenueGrowth < 0) {
    insights.push(
      `Revenue declined by ${Math.abs(metrics.revenueGrowth).toFixed(
        1
      )}%. Immediate action required to review pricing strategy and marketing effectiveness.`
    );
  }

  if (metrics.grossProfitMargin < 20) {
    insights.push(
      `Low gross profit margin of ${metrics.grossProfitMargin.toFixed(
        1
      )}% indicates need for cost optimization or pricing strategy review.`
    );
  }

  if (metrics.costGrowth > 15) {
    insights.push(
      `High cost growth of ${metrics.costGrowth.toFixed(
        1
      )}% requires immediate attention to cost structure and operational efficiency.`
    );
  }

  // Strategic Recommendations
  if (metrics.topRevenueSources && metrics.topRevenueSources[0]) {
    const topSource = metrics.topRevenueSources[0];
    if (topSource.percentage > 50) {
      insights.push(
        `${topSource.source} represents ${topSource.percentage.toFixed(
          1
        )}% of total revenue. Diversify revenue streams to reduce dependency risk.`
      );
    }
  }

  if (metrics.topCostCategories && metrics.topCostCategories[0]) {
    const topCost = metrics.topCostCategories[0];
    if (topCost.percentage > 40) {
      insights.push(
        `${topCost.category} accounts for ${topCost.percentage.toFixed(
          1
        )}% of total costs. Implement cost optimization strategies for this category.`
      );
    }
  }

  // Action Items
  insights.push(
    "Implement automated financial reporting system to track key metrics in real-time."
  );

  insights.push(
    "Conduct quarterly business review sessions to assess performance against strategic goals."
  );

  if (metrics.grossProfitMargin < 25) {
    insights.push(
      "Schedule pricing strategy review meeting to identify opportunities for margin improvement."
    );
  }

  if (metrics.revenueGrowth < 5) {
    insights.push(
      "Develop and execute marketing campaigns to accelerate revenue growth."
    );
  }

  return insights;
}
