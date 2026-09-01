/**
 * Export Service
 * 
 * Handles export functionality for performance reports
 */

import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import performanceRepository from '../repository/performanceRepository.js';

/**
 * Export performance report
 */
async function exportReport(userId, options, filters = {}) {
  const { format, includeCharts, includeInsights, includeFilters, dateRange } = options;
  
  // Get all necessary data
  const dashboardData = await performanceRepository.getDashboardSummary(userId, filters);
  const trendData = await performanceRepository.getProductivityTrend(userId, filters);
  const goalData = await performanceRepository.getGoalProgress(userId, filters);
  
  switch (format) {
    case 'csv':
      return await exportToCSV(dashboardData, trendData, goalData, options);
    case 'xlsx':
      return await exportToExcel(dashboardData, trendData, goalData, options);
    case 'pdf':
      return await exportToPDF(dashboardData, trendData, goalData, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Export to CSV
 */
async function exportToCSV(dashboardData, trendData, goalData, options) {
  const rows = [];
  
  // Add header
  rows.push(['Metric', 'Value']);
  
  // Add dashboard data
  rows.push(['Productivity Score', dashboardData.productivityScore]);
  rows.push(['Completion Rate', dashboardData.completionRate]);
  rows.push(['On-Time Rate', dashboardData.onTimeRate]);
  rows.push(['Focus Score', dashboardData.focusScore]);
  
  // Add trend data
  rows.push([]);
  rows.push(['Period', 'Assigned', 'Completed', 'Delayed']);
  trendData.forEach(period => {
    rows.push([period.period, period.assigned, period.completed, period.delayed]);
  });
  
  // Add goal data
  rows.push([]);
  rows.push(['Goal', 'Type', 'Target', 'Current', 'Status']);
  goalData.forEach(goal => {
    rows.push([goal.goalName, goal.goalType, goal.targetValue, goal.currentValue, goal.status]);
  });
  
  // Convert to CSV string
  const csvContent = rows.map(row => row.join(',')).join('\n');
  
  return Buffer.from(csvContent, 'utf-8');
}

/**
 * Export to Excel
 */
async function exportToExcel(dashboardData, trendData, goalData, options) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Performance Report');
  
  // Add dashboard data
  worksheet.addRow(['Performance Summary']);
  worksheet.addRow(['Metric', 'Value']);
  worksheet.addRow(['Productivity Score', dashboardData.productivityScore]);
  worksheet.addRow(['Completion Rate', dashboardData.completionRate]);
  worksheet.addRow(['On-Time Rate', dashboardData.onTimeRate]);
  worksheet.addRow(['Focus Score', dashboardData.focusScore]);
  
  // Add trend data
  worksheet.addRow([]);
  worksheet.addRow(['Productivity Trend']);
  worksheet.addRow(['Period', 'Assigned', 'Completed', 'Delayed']);
  trendData.forEach(period => {
    worksheet.addRow([period.period, period.assigned, period.completed, period.delayed]);
  });
  
  // Add goal data
  worksheet.addRow([]);
  worksheet.addRow(['Goal Progress']);
  worksheet.addRow(['Goal', 'Type', 'Target', 'Current', 'Status']);
  goalData.forEach(goal => {
    worksheet.addRow([goal.goalName, goal.goalType, goal.targetValue, goal.currentValue, goal.status]);
  });
  
  // Style the worksheet
  worksheet.columns.forEach(column => {
    column.width = 20;
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Export to PDF
 */
async function exportToPDF(dashboardData, trendData, goalData, options) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Add title
      doc.fontSize(20).text('Performance Report', { align: 'center' });
      doc.moveDown();
      
      // Add dashboard data
      doc.fontSize(14).text('Performance Summary');
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Productivity Score: ${dashboardData.productivityScore}%`);
      doc.text(`Completion Rate: ${dashboardData.completionRate}%`);
      doc.text(`On-Time Rate: ${dashboardData.onTimeRate}%`);
      doc.text(`Focus Score: ${dashboardData.focusScore}%`);
      doc.moveDown();
      
      // Add trend data
      doc.fontSize(14).text('Productivity Trend');
      doc.moveDown();
      doc.fontSize(12);
      trendData.forEach(period => {
        doc.text(`${period.period}: ${period.completed}/${period.assigned} completed`);
      });
      doc.moveDown();
      
      // Add goal data
      doc.fontSize(14).text('Goal Progress');
      doc.moveDown();
      doc.fontSize(12);
      goalData.forEach(goal => {
        doc.text(`${goal.goalName}: ${goal.currentValue}/${goal.targetValue} (${goal.status})`);
      });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  exportReport,
};
