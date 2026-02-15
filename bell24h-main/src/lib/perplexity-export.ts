/**
 * Perplexity Dashboard Export Utilities
 *
 * This file provides export functionality for the Perplexity Dashboard,
 * including PDF, Excel, and CSV exports with proper formatting.
 * Reuses the analytics export infrastructure previously implemented.
 */

import { perplexityApi } from './api';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

// Export format type
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

// Perplexity export data structure
export interface PerplexityExportData {
  perplexityResult: any;
  entityType: string;
  modelType: string;
  text: string;
  timestamp: string;
  additionalData?: {
    successPrediction?: any;
    textImprovement?: any;
    temporalTrends?: any[];
    competitiveInsights?: any[];
    marketSegments?: any[];
    multilingualAnalysis?: any;
    customerProfile?: any;
  };
}

/**
 * Export perplexity analysis as a file in the specified format
 */
export async function exportPerplexityAnalysis(
  data: PerplexityExportData,
  format: ExportFormat = 'pdf',
  filename?: string
): Promise<void> {
  const baseFilename = filename || `perplexity-analysis-${data.entityType}-${new Date().getTime()}`;

  try {
    switch (format) {
      case 'pdf':
        await exportToPdf(data, `${baseFilename}.pdf`);
        break;
      case 'excel':
        await exportToExcel(data, `${baseFilename}.xlsx`);
        break;
      case 'csv':
        await exportToCsv(data, `${baseFilename}.csv`);
        break;
      case 'json':
      default:
        exportToJson(data, `${baseFilename}.json`);
        break;
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Export error:', error);
    return Promise.reject(error);
  }
}

/**
 * Export data as JSON
 */
function exportToJson(data: PerplexityExportData, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, filename);
}

/**
 * Export data as CSV
 */
async function exportToCsv(data: PerplexityExportData, filename: string): Promise<void> {
  // Convert perplexity data to CSV format
  let csvContent = 'Data Type,Value\n';

  // Basic info
  csvContent += `Entity Type,${data.entityType}\n`;
  csvContent += `Model Type,${data.modelType}\n`;
  csvContent += `Timestamp,${data.timestamp}\n`;
  csvContent += `Text,"${data.text.replace(/"/g, '""')}"\n\n`;

  // Perplexity result
  if (data.perplexityResult) {
    csvContent += 'Perplexity Result\n';
    if (typeof data.perplexityResult.score !== 'undefined') {
      csvContent += `Score,${data.perplexityResult.score}\n`;
    }
    if (data.perplexityResult.complexity) {
      csvContent += `Complexity,${data.perplexityResult.complexity}\n`;
    }
    if (data.perplexityResult.readabilityIndex) {
      csvContent += `Readability Index,${data.perplexityResult.readabilityIndex}\n`;
    }

    // Add perplexity factors if available
    if (data.perplexityResult.perplexityFactors?.length > 0) {
      csvContent += '\nPerplexity Factors\n';
      csvContent += 'Factor,Impact\n';
      data.perplexityResult.perplexityFactors.forEach((factor: any) => {
        csvContent += `${factor.factor},${factor.impact}\n`;
      });
    }
    csvContent += '\n';
  }

  // Additional data sections based on what's available
  if (data.additionalData) {
    if (data.additionalData.successPrediction) {
      const sp = data.additionalData.successPrediction;
      csvContent += 'Success Prediction\n';
      csvContent += `Success Probability,${sp.successProbability}\n`;
      csvContent += `Confidence,${sp.confidence}\n\n`;

      if (sp.areas?.length > 0) {
        csvContent += 'Success Areas\n';
        csvContent += 'Area,Score\n';
        sp.areas.forEach((area: any) => {
          csvContent += `${area.name},${area.score}\n`;
        });
        csvContent += '\n';
      }
    }

    if (
      data.additionalData.temporalTrends &&
      Array.isArray(data.additionalData.temporalTrends) &&
      data.additionalData.temporalTrends.length > 0
    ) {
      csvContent += 'Temporal Trends\n';
      csvContent += 'Period,Complexity,Industry Average\n';
      data.additionalData.temporalTrends.forEach((trend: any) => {
        csvContent += `${trend.period},${trend.complexity},${trend.industryAverage}\n`;
      });
      csvContent += '\n';
    }
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

/**
 * Export data as Excel
 */
async function exportToExcel(data: PerplexityExportData, filename: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bell24H Perplexity Dashboard';
  workbook.created = new Date();

  // Overview sheet
  const overviewSheet = workbook.addWorksheet('Overview');
  overviewSheet.columns = [
    { header: 'Property', key: 'property', width: 30 },
    { header: 'Value', key: 'value', width: 50 },
  ];

  // Add basic info
  overviewSheet.addRow({ property: 'Entity Type', value: data.entityType });
  overviewSheet.addRow({ property: 'Model Type', value: data.modelType });
  overviewSheet.addRow({ property: 'Timestamp', value: data.timestamp });
  overviewSheet.addRow({ property: 'Text', value: data.text });
  overviewSheet.addRow({ property: '', value: '' });

  // Add perplexity result
  if (data.perplexityResult) {
    overviewSheet.addRow({ property: 'PERPLEXITY RESULT', value: '' });
    if (typeof data.perplexityResult.score !== 'undefined') {
      overviewSheet.addRow({ property: 'Score', value: data.perplexityResult.score });
    }
    if (data.perplexityResult.complexity) {
      overviewSheet.addRow({ property: 'Complexity', value: data.perplexityResult.complexity });
    }
    if (data.perplexityResult.readabilityIndex) {
      overviewSheet.addRow({
        property: 'Readability Index',
        value: data.perplexityResult.readabilityIndex,
      });
    }
  }

  // Apply some styling
  overviewSheet.getRow(1).font = { bold: true };
  overviewSheet.getCell('A7').font = { bold: true };

  // Additional sheets based on what data is available
  if (data.additionalData) {
    // Success Prediction sheet
    if (data.additionalData.successPrediction) {
      const predictionSheet = workbook.addWorksheet('Success Prediction');
      predictionSheet.columns = [
        { header: 'Property', key: 'property', width: 30 },
        { header: 'Value', key: 'value', width: 30 },
      ];

      const sp = data.additionalData.successPrediction;
      predictionSheet.addRow({ property: 'Success Probability', value: sp.successProbability });
      predictionSheet.addRow({ property: 'Confidence', value: sp.confidence });
      predictionSheet.addRow({ property: '', value: '' });

      // Add areas
      if (sp.areas?.length > 0) {
        predictionSheet.addRow({ property: 'SUCCESS AREAS', value: '' });
        predictionSheet.addRow({ property: 'Area', value: 'Score' });
        sp.areas.forEach((area: any) => {
          predictionSheet.addRow({ property: area.name, value: area.score });
        });
      }

      // Style the sheet
      predictionSheet.getRow(1).font = { bold: true };
      predictionSheet.getRow(2).font = { bold: true };
      predictionSheet.getCell('A5').font = { bold: true };
      predictionSheet.getRow(5).font = { bold: true };
    }

    // Trends Sheet
    if (
      data.additionalData.temporalTrends &&
      Array.isArray(data.additionalData.temporalTrends) &&
      data.additionalData.temporalTrends.length > 0
    ) {
      const trendsSheet = workbook.addWorksheet('Temporal Trends');
      trendsSheet.columns = [
        { header: 'Period', key: 'period', width: 15 },
        { header: 'Complexity', key: 'complexity', width: 15 },
        { header: 'Industry Average', key: 'industryAverage', width: 20 },
      ];

      data.additionalData.temporalTrends.forEach((trend: any) => {
        trendsSheet.addRow({
          period: trend.period,
          complexity: trend.complexity,
          industryAverage: trend.industryAverage,
        });
      });

      // Style the sheet
      trendsSheet.getRow(1).font = { bold: true };
    }
  }

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
}

/**
 * Export data as PDF
 */
async function exportToPdf(data: PerplexityExportData, filename: string): Promise<void> {
  // Define the document definition
  const docDefinition: any = {
    content: [
      { text: 'Bell24H Perplexity Analysis', style: 'header' },
      { text: new Date(data.timestamp).toLocaleString(), alignment: 'right' },

      { text: 'Basic Information', style: 'subheader', margin: [0, 15, 0, 5] },
      {
        table: {
          headerRows: 0,
          widths: ['30%', '70%'],
          body: [
            ['Entity Type', data.entityType],
            ['Model Type', data.modelType],
            ['Text', { text: data.text, italics: true }],
          ],
        },
      },

      { text: 'Perplexity Analysis Results', style: 'subheader', margin: [0, 15, 0, 5] },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  // Add perplexity result to the document
  if (data.perplexityResult) {
    const perplexityResultTable: any[][] = [];

    if (typeof data.perplexityResult.score !== 'undefined') {
      perplexityResultTable.push(['Score', data.perplexityResult.score.toString()]);
    }
    if (data.perplexityResult.complexity) {
      perplexityResultTable.push(['Complexity', data.perplexityResult.complexity]);
    }
    if (data.perplexityResult.readabilityIndex) {
      perplexityResultTable.push([
        'Readability Index',
        data.perplexityResult.readabilityIndex.toString(),
      ]);
    }

    if (perplexityResultTable.length > 0) {
      docDefinition.content.push({
        table: {
          headerRows: 0,
          widths: ['30%', '70%'],
          body: perplexityResultTable,
        },
      });
    }

    // Add perplexity factors if available
    if (data.perplexityResult.perplexityFactors?.length > 0) {
      docDefinition.content.push({
        text: 'Perplexity Factors',
        style: 'subheader',
        margin: [0, 15, 0, 5],
      });

      const factorsTableBody: any[][] = [
        [
          { text: 'Factor', style: 'tableHeader' },
          { text: 'Impact', style: 'tableHeader' },
        ],
      ];

      data.perplexityResult.perplexityFactors.forEach((factor: any) => {
        factorsTableBody.push([factor.factor, factor.impact.toString()]);
      });

      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['60%', '40%'],
          body: factorsTableBody,
        },
      });
    }
  }

  // Add additional data sections based on what's available
  if (data.additionalData) {
    // Success Prediction
    if (data.additionalData.successPrediction) {
      const sp = data.additionalData.successPrediction;

      docDefinition.content.push({
        text: 'Success Prediction',
        style: 'subheader',
        margin: [0, 15, 0, 5],
      });
      docDefinition.content.push({
        table: {
          headerRows: 0,
          widths: ['50%', '50%'],
          body: [
            ['Success Probability', `${sp.successProbability}%`],
            ['Confidence', `${sp.confidence}%`],
          ],
        },
      });

      // Add areas chart
      if (sp.areas?.length > 0) {
        docDefinition.content.push({
          text: 'Success Areas',
          style: 'subheader',
          margin: [0, 15, 0, 5],
        });

        const areasTableBody: any[][] = [
          [
            { text: 'Area', style: 'tableHeader' },
            { text: 'Score', style: 'tableHeader' },
          ],
        ];

        sp.areas.forEach((area: any) => {
          areasTableBody.push([area.name, area.score.toString()]);
        });

        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['60%', '40%'],
            body: areasTableBody,
          },
        });
      }
    }

    // Temporal Trends
    if (
      data.additionalData.temporalTrends &&
      Array.isArray(data.additionalData.temporalTrends) &&
      data.additionalData.temporalTrends.length > 0
    ) {
      docDefinition.content.push({
        text: 'Temporal Trends',
        style: 'subheader',
        margin: [0, 15, 0, 5],
      });

      const trendsTableBody: any[][] = [
        [
          { text: 'Period', style: 'tableHeader' },
          { text: 'Complexity', style: 'tableHeader' },
          { text: 'Industry Average', style: 'tableHeader' },
        ],
      ];

      data.additionalData.temporalTrends.forEach((trend: any) => {
        trendsTableBody.push([
          trend.period,
          trend.complexity.toString(),
          trend.industryAverage.toString(),
        ]);
      });

      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['33%', '33%', '34%'],
          body: trendsTableBody,
        },
      });
    }
  }

  // Generate and download the PDF
  pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Generate a custom PDF report with visualizations
 * This uses a more sophisticated layout with charts and graphics
 */
export async function generateCustomReport(
  data: PerplexityExportData,
  filename?: string
): Promise<void> {
  try {
    // First make an API call to generate the custom report
    const reportResponse = await perplexityApi.generateCustomReport(data);

    // The API returns a base64 encoded PDF
    if (reportResponse && reportResponse.pdfBase64) {
      // Convert base64 to Blob
      const binaryString = window.atob(reportResponse.pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });

      // Save the file
      const reportFilename =
        filename || `perplexity-report-${data.entityType}-${new Date().getTime()}.pdf`;
      saveAs(blob, reportFilename);
    } else {
      throw new Error('Failed to generate custom report');
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error generating custom report:', error);
    return Promise.reject(error);
  }
}
