const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF report
 * @param {object} reportData - Report data object
 * @param {object} assessmentData - Assessment data object
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Path to generated PDF
 */
const generatePDFReport = async (reportData, assessmentData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      
      // Pipe its output to a file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Set font
      doc.font('Helvetica');

      // Header
      doc.fontSize(24)
         .fillColor('#1e3a8a')
         .text('Cybersecurity Assessment Report', { align: 'center' })
         .moveDown();

      // Company info
      const companyName = (assessmentData && assessmentData.companyName) || 'Organization';
      const assessmentType = (assessmentData && assessmentData.assessmentTypeFormatted) ||
        (assessmentData && assessmentData.assessmentType ? assessmentData.assessmentType.replace(/_/g, ' ').toUpperCase() : 'General Assessment');

      doc.fontSize(14)
         .fillColor('#374151')
         .text(`Company: ${companyName}`, { align: 'left' })
         .text(`Assessment Type: ${assessmentType}`, { align: 'left' })
         .text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'left' })
         .moveDown();

      // Separator
      doc.strokeColor('#3b82f6')
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke()
         .moveDown();

      // Executive Summary
      doc.fontSize(18)
         .fillColor('#1e3a8a')
         .text('Executive Summary', { underline: true })
         .moveDown();

      doc.fontSize(11)
         .fillColor('#374151')
         .text(reportData.executiveSummary || 'No executive summary provided.', { align: 'justify', lineGap: 5 })
         .moveDown();

      // Risk Score
      doc.fontSize(18)
         .fillColor('#1e3a8a')
         .text('Risk Assessment', { underline: true })
         .moveDown();

      doc.fontSize(12)
         .fillColor('#374151')
         .text(`Overall Risk Score: ${reportData.riskScore || 0}/100`)
         .text(`Security Score: ${reportData.overallScore || 0}/100`)
         .moveDown();

      // Findings
      if (reportData.findings && reportData.findings.length > 0) {
        doc.fontSize(18)
           .fillColor('#1e3a8a')
           .text('Findings', { underline: true })
           .moveDown();

        reportData.findings.forEach((finding, index) => {
          const severityColor = {
            critical: '#dc2626',
            high: '#ea580c',
            medium: '#ca8a04',
            low: '#16a34a',
            info: '#2563eb',
          };

          const sev = (finding.severity || 'info').toLowerCase();
          const category = finding.category || 'General Finding';
          const description = finding.description || '';

          doc.fontSize(12)
             .fillColor(severityColor[sev] || '#374151')
             .text(`${index + 1}. ${category} - ${sev.toUpperCase()}`)
             .moveDown(0.5);

          if (description) {
            doc.fontSize(10)
               .fillColor('#374151')
               .text(description, { align: 'justify', lineGap: 3 })
               .moveDown();
          }
        });
      }

      // Recommendations
      if (reportData.recommendations && reportData.recommendations.length > 0) {
        doc.addPage();

        doc.fontSize(18)
           .fillColor('#1e3a8a')
           .text('Recommendations', { underline: true })
           .moveDown();

        reportData.recommendations.forEach((rec, index) => {
          const priorityColor = {
            critical: '#dc2626',
            high: '#ea580c',
            medium: '#ca8a04',
            low: '#16a34a',
          };

          const prio = (rec.priority || 'medium').toLowerCase();
          const title = rec.title || 'Recommendation';
          const description = rec.description || '';

          doc.fontSize(12)
             .fillColor(priorityColor[prio] || '#374151')
             .text(`${index + 1}. [${prio.toUpperCase()}] ${title}`)
             .moveDown(0.5);

          if (description) {
            doc.fontSize(10)
               .fillColor('#374151')
               .text(description, { align: 'justify', lineGap: 3 });
          }

          if (rec.estimatedEffort) {
            doc.moveDown(0.5);
            doc.fontSize(9)
               .fillColor('#6b7280')
               .text(`Estimated Effort: ${rec.estimatedEffort}`);
          }

          doc.moveDown();
        });
      }

      // Additional sections
      if (reportData.methodology || reportData.scope || reportData.limitations) {
        doc.addPage();

        if (reportData.methodology) {
          doc.fontSize(18)
             .fillColor('#1e3a8a')
             .text('Methodology', { underline: true })
             .moveDown();

          doc.fontSize(11)
             .fillColor('#374151')
             .text(reportData.methodology, { align: 'justify', lineGap: 5 })
             .moveDown();
        }

        if (reportData.scope) {
          doc.fontSize(18)
             .fillColor('#1e3a8a')
             .text('Scope', { underline: true })
             .moveDown();

          doc.fontSize(11)
             .fillColor('#374151')
             .text(reportData.scope, { align: 'justify', lineGap: 5 })
             .moveDown();
        }

        if (reportData.limitations) {
          doc.fontSize(18)
             .fillColor('#1e3a8a')
             .text('Limitations', { underline: true })
             .moveDown();

          doc.fontSize(11)
             .fillColor('#374151')
             .text(reportData.limitations, { align: 'justify', lineGap: 5 })
             .moveDown();
        }
      }

      // Conclusion
      if (reportData.conclusion) {
        doc.addPage();

        doc.fontSize(18)
           .fillColor('#1e3a8a')
           .text('Conclusion', { underline: true })
           .moveDown();

        doc.fontSize(11)
           .fillColor('#374151')
           .text(reportData.conclusion, { align: 'justify', lineGap: 5 })
           .moveDown();
      }

      // Footer
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(
           `Generated by Cybersecurity Assessment Portal | ${new Date().toLocaleString()}`,
           { align: 'center' }
         );

      // Finalize the PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePDFReport };
