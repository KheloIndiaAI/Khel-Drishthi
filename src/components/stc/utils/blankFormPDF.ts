import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==================== COLOR SCHEME (SAI India Sports Colors) ====================
const COLORS = {
  saffron: { r: 255, g: 153, b: 51 },      // #FF9933
  navyBlue: { r: 0, g: 0, b: 128 },        // #000080
  indiaGreen: { r: 19, g: 136, b: 8 },     // #138808
  cardBg: { r: 249, g: 250, b: 251 },      // #F9FAFB
  cardBorder: { r: 229, g: 231, b: 235 },  // #E5E7EB
  conditionalBg: { r: 255, g: 247, b: 237 }, // #FFF7ED
  conditionalBorder: { r: 245, g: 158, b: 11 }, // #F59E0B
  textPrimary: { r: 31, g: 41, b: 55 },    // #1F2937
  textMuted: { r: 107, g: 114, b: 128 },   // #6B7280
  white: { r: 255, g: 255, b: 255 },
};

interface PDFOptions {
  type: 'printable' | 'fillable';
}

// ==================== HELPER: Add Page Header ====================
function addPageHeader(doc: jsPDF, sectionNumber: number, sectionTitle: string, pageNumber: number): void {
  // Navy header bar
  doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.rect(0, 0, 210, 12, 'F');
  
  // Header text
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Sports Authority of India', 14, 8);
  doc.text('Nurturing Talent, Measuring Excellence', 85, 8);
  doc.text(`Section ${sectionNumber} | Page ${pageNumber}`, 196, 8, { align: 'right' });
  
  // Saffron accent line
  doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.rect(0, 12, 210, 2, 'F');
  
  // Section title bar
  doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.rect(14, 18, 182, 10, 'F');
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Section ${sectionNumber}: ${sectionTitle}`, 20, 25);
  
  // Reset text color
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
}

// ==================== HELPER: Add Card Container ====================
function addCard(doc: jsPDF, title: string, yPos: number, height: number): number {
  // Card background
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.setDrawColor(COLORS.cardBorder.r, COLORS.cardBorder.g, COLORS.cardBorder.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, yPos, 182, height, 2, 2, 'FD');
  
  // Saffron left accent
  doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.rect(14, yPos, 3, height, 'F');
  
  // Card title
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPos + 6);
  
  // Reset
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFont('helvetica', 'normal');
  
  return yPos + 10;
}

// ==================== HELPER: Add Conditional Box ====================
function addConditionalBox(doc: jsPDF, condition: string, yPos: number, height: number): number {
  // Amber background
  doc.setFillColor(COLORS.conditionalBg.r, COLORS.conditionalBg.g, COLORS.conditionalBg.b);
  doc.setDrawColor(COLORS.conditionalBorder.r, COLORS.conditionalBorder.g, COLORS.conditionalBorder.b);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(18, yPos, 174, height, 2, 2, 'FD');
  doc.setLineDashPattern([], 0);
  
  // Condition label (removed arrow character to avoid stray characters)
  doc.setTextColor(COLORS.conditionalBorder.r, COLORS.conditionalBorder.g, COLORS.conditionalBorder.b);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(condition, 22, yPos + 5);
  
  // Reset
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFont('helvetica', 'normal');
  
  return yPos + 8;
}

// ==================== HELPER: Add Text Field ====================
function addTextField(doc: jsPDF, label: string, yPos: number, width: number = 80, xOffset: number = 20): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.text(label + ':', xOffset, yPos);
  
  const labelWidth = doc.getTextWidth(label + ': ');
  doc.setDrawColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.setLineWidth(0.3);
  doc.line(xOffset + labelWidth, yPos, xOffset + labelWidth + width, yPos);
  
  return yPos + 7;
}

// ==================== HELPER: Add Checkbox with Label ====================
function addCheckbox(doc: jsPDF, label: string, xPos: number, yPos: number, checked: boolean = false): number {
  doc.setDrawColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.setLineWidth(0.4);
  doc.rect(xPos, yPos - 3.5, 4, 4);
  
  if (checked) {
    doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
    doc.rect(xPos + 0.5, yPos - 3, 3, 3, 'F');
  }
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(label, xPos + 6, yPos);
  
  return xPos + 6 + doc.getTextWidth(label) + 8;
}

// ==================== HELPER: Add Checkbox Options Row ====================
function addCheckboxOptions(doc: jsPDF, label: string, options: string[], yPos: number, xOffset: number = 20): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.text(label + ':', xOffset, yPos);
  
  let xPos = xOffset + doc.getTextWidth(label + ': ') + 3;
  options.forEach((option) => {
    xPos = addCheckbox(doc, option, xPos, yPos);
    if (xPos > 180) {
      xPos = xOffset + 5;
      yPos += 6;
    }
  });
  
  return yPos + 7;
}

// ==================== HELPER: Add Text Area ====================
function addTextArea(doc: jsPDF, label: string, yPos: number, lines: number = 3, xOffset: number = 20): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(label, xOffset, yPos);
  yPos += 3;
  
  doc.setDrawColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.setLineWidth(0.2);
  for (let i = 0; i < lines; i++) {
    doc.line(xOffset, yPos + (i * 6), 190, yPos + (i * 6));
  }
  
  return yPos + (lines * 6) + 3;
}

// ==================== HELPER: Check Page Break ====================
function checkPageBreak(doc: jsPDF, yPos: number, requiredSpace: number, sectionNumber: number, sectionTitle: string, pageNumber: number): { y: number, page: number } {
  if (yPos + requiredSpace > 280) {
    doc.addPage();
    pageNumber++;
    addPageHeader(doc, sectionNumber, sectionTitle, pageNumber);
    return { y: 35, page: pageNumber };
  }
  return { y: yPos, page: pageNumber };
}

// ==================== HELPER: Add Page Footer ====================
function addPageFooter(doc: jsPDF, pageNumber: number): void {
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.text('STC Excellence Survey - Sports Authority of India', 14, 290);
  doc.text(`Page ${pageNumber}`, 196, 290, { align: 'right' });
}

// ==================== MAIN: Generate Blank Form PDF ====================
export function generateBlankFormPDF(options: PDFOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  let pageNumber = 1;
  
  // ==================== COVER PAGE ====================
  // Navy header bar
  doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Large SAI Logo placeholder (prominent, centered)
  doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.roundedRect(75, 8, 60, 35, 3, 3, 'F');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SAI LOGO', 105, 28, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Sports Authority of India', 105, 36, { align: 'center' });
  
  // Saffron accent line
  doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.rect(0, 50, 210, 4, 'F');
  
  // Main Title
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('SPORTS AUTHORITY OF INDIA', 105, 68, { align: 'center' });
  
  // Subtitle
  doc.setTextColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Nurturing Talent, Measuring Excellence - STC Profile', 105, 78, { align: 'center' });
  
  // Green accent line
  doc.setFillColor(COLORS.indiaGreen.r, COLORS.indiaGreen.g, COLORS.indiaGreen.b);
  doc.rect(60, 84, 90, 1.5, 'F');
  
  // Instructions box
  let instrY = 95;
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.setDrawColor(COLORS.indiaGreen.r, COLORS.indiaGreen.g, COLORS.indiaGreen.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, instrY, 170, 55, 3, 3, 'FD');
  
  // Saffron accent on instruction box
  doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.rect(20, instrY, 4, 55, 'F');
  
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUCTIONS', 28, instrY + 10);
  
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const instructions = [
    '1. Fill all sections completely and accurately.',
    '2. Use BLOCK LETTERS for handwritten entries.',
    '3. Tick the appropriate checkboxes where applicable.',
    '4. For numerical fields, use whole numbers unless specified.',
    '5. If any section is not applicable, write "N/A".',
    '6. Attach supporting documents where requested.',
    '7. Get form signed by the Centre In-Charge.',
  ];
  
  let iy = instrY + 18;
  instructions.forEach(instr => {
    doc.text(instr, 28, iy);
    iy += 6;
  });
  
  // Important notes box (amber)
  let notesY = 155;
  doc.setFillColor(COLORS.conditionalBg.r, COLORS.conditionalBg.g, COLORS.conditionalBg.b);
  doc.setDrawColor(COLORS.conditionalBorder.r, COLORS.conditionalBorder.g, COLORS.conditionalBorder.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, notesY, 170, 22, 3, 3, 'FD');
  
  doc.setTextColor(COLORS.conditionalBorder.r, COLORS.conditionalBorder.g, COLORS.conditionalBorder.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT NOTES', 28, notesY + 8);
  
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('- Data should be current unless otherwise specified.', 28, notesY + 15);
  doc.text('- Use sanctioned strength as per official records.', 28, notesY + 20);
  
  // Table of Contents
  let tocY = 185;
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', 105, tocY, { align: 'center' });
  
  tocY += 8;
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.setDrawColor(COLORS.cardBorder.r, COLORS.cardBorder.g, COLORS.cardBorder.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(35, tocY, 140, 75, 2, 2, 'FD');
  
  const tocItems = [
    '1. Centre Identity & Status',
    '2. Disciplines & Athlete Strength',
    '3. Infrastructure & Field of Play',
    '4. Hostel & Amenities',
    '5. Human Resources',
    '6. Equipment & Strength & Conditioning',
    '7. Talent Identification & Competitions',
    '8. Vision for STC',
    '9. Attachments & Declaration',
  ];
  
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  tocY += 8;
  tocItems.forEach((item) => {
    doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
    doc.circle(43, tocY - 1.5, 1.5, 'F');
    doc.text(item, 48, tocY);
    tocY += 8;
  });
  
  // Form version
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.text('Form Version: 2025.1', 20, 275);
  doc.text('Date: January 2025', 170, 275);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 1: CENTRE IDENTITY & STATUS ====================
  doc.addPage();
  pageNumber = 2;
  addPageHeader(doc, 1, 'Centre Identity & Status', pageNumber);
  
  let y = 35;
  
  // Card 1.1: Basic Identity
  y = addCard(doc, 'Card 1.1: Basic Identity', y, 40);
  y = addTextField(doc, 'STC Name', y, 120, 22);
  y = addTextField(doc, 'State', y, 60, 22);
  y = addTextField(doc, 'Region/RC', y, 60, 100);
  y = addTextField(doc, 'District', y, 50, 22);
  y = addTextField(doc, 'Year of Inclusion in Scheme', y, 25, 100);
  y += 5;
  
  // Card 1.2: Operational Status
  y = addCard(doc, 'Card 1.2: Operational Status', y, 35);
  y = addCheckboxOptions(doc, 'Current Status', ['Operational', 'Kept in Abeyance'], y, 22);
  y += 3;
  
  // Conditional box for abeyance
  y = addConditionalBox(doc, 'Complete if Kept in Abeyance:', y, 45);
  y = addTextField(doc, 'Abeyance Since Date (DD/MM/YYYY)', y, 40, 24);
  doc.setFontSize(8);
  doc.text('Reasons (check all that apply):', 24, y);
  y += 5;
  const abeyanceReasons = ['Infrastructure Issues', 'Coach Vacancy', 'Hostel Issues', 'Safety Concerns', 'Funding', 'Admin Issues', 'Other'];
  let xPos = 24;
  abeyanceReasons.forEach((reason) => {
    if (xPos + doc.getTextWidth(reason) + 12 > 185) {
      xPos = 24;
      y += 5;
    }
    xPos = addCheckbox(doc, reason, xPos, y);
  });
  y += 3;
  y = addTextArea(doc, 'Additional Notes:', y, 2, 24);
  y += 8;
  
  // Card 1.3: Centre In-Charge Details
  y = addCard(doc, 'Card 1.3: Centre In-Charge (CIC) Details', y, 30);
  y = addTextField(doc, 'CIC Name', y, 80, 22);
  y = addTextField(doc, 'Designation', y, 50, 110);
  y = addTextField(doc, 'Posted as CIC Since (DD/MM/YYYY)', y, 40, 22);
  y += 5;
  
  // Card 1.4: Geo Coordinates
  y = addCard(doc, 'Card 1.4: Geo Coordinates', y, 18);
  y = addTextField(doc, 'Latitude (-90 to 90)', y, 30, 22);
  y = addTextField(doc, 'Longitude (-180 to 180)', y, 30, 100);
  y += 5;
  
  // Card 1.5: Address
  y = addCard(doc, 'Card 1.5: Address', y, 28);
  y = addTextArea(doc, 'Full Address:', y, 2, 22);
  y = addTextField(doc, 'District', y, 50, 22);
  y = addTextField(doc, 'Pin Code', y, 30, 100);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 2: DISCIPLINES & ATHLETE STRENGTH ====================
  doc.addPage();
  pageNumber = 3;
  addPageHeader(doc, 2, 'Disciplines & Athlete Strength', pageNumber);
  
  y = 35;
  
  // Summary Cards Row
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.setDrawColor(COLORS.cardBorder.r, COLORS.cardBorder.g, COLORS.cardBorder.b);
  const summaryWidth = 43;
  const summaryTitles = ['Total Sanctioned', 'Total Existing', 'Total Vacancies', 'Utilization %'];
  for (let i = 0; i < 4; i++) {
    doc.roundedRect(14 + (i * (summaryWidth + 2)), y, summaryWidth, 18, 2, 2, 'FD');
    doc.setFillColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
    doc.rect(14 + (i * (summaryWidth + 2)), y, 3, 18, 'F');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
    doc.text(summaryTitles[i], 19 + (i * (summaryWidth + 2)), y + 6);
    doc.setDrawColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
    doc.line(19 + (i * (summaryWidth + 2)), y + 14, 14 + (i * (summaryWidth + 2)) + summaryWidth - 5, y + 14);
    doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  }
  y += 25;
  
  // Discipline Strength Table
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Discipline-wise Athlete Strength:', 14, y);
  y += 3;
  
  autoTable(doc, {
    startY: y,
    head: [[
      '#', 'Discipline', 'San.Res.B', 'San.Res.G', 'San.NR.B', 'San.NR.G',
      'Ex.Res.B', 'Ex.Res.G', 'Ex.NR.B', 'Ex.NR.G', 'Vacancy'
    ]],
    body: Array(10).fill(['', '', '', '', '', '', '', '', '', '', '']),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 6 
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 28 },
    },
    alternateRowStyles: { fillColor: [COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 5;
  
  // Per-discipline catchment and notes
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.text('For each discipline with surplus (Existing > Sanctioned), provide explanation:', 14, y);
  y += 3;
  doc.setDrawColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.line(14, y + 5, 196, y + 5);
  doc.line(14, y + 11, 196, y + 11);
  y += 15;
  
  // Card: Previously Operational Disciplines
  y = addCard(doc, 'Card 2.2: Previously Operational Disciplines', y, 45);
  y = addCheckboxOptions(doc, 'Had previous disciplines that were discontinued', ['Yes', 'No'], y, 22);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline Name', 'From Year', 'To Year', 'Was Residential?', 'Was Non-Res?', 'Reason Discontinued']],
    body: Array(3).fill(['', '', '', '☐ Yes ☐ No', '☐ Yes ☐ No', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  // New Discipline Suggestions
  y = addCard(doc, 'Card 2.3: New Discipline Suggestions', y, 22);
  y = addTextArea(doc, 'Suggestions for new disciplines at this STC:', y, 2, 22);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 3: INFRASTRUCTURE & FIELD OF PLAY ====================
  doc.addPage();
  pageNumber = 4;
  addPageHeader(doc, 3, 'Infrastructure & Field of Play', pageNumber);
  
  y = 35;
  
  // Card 3.1: Land Area & Ownership
  y = addCard(doc, 'Card 3.1: Land Area & Ownership', y, 50);
  y = addTextField(doc, 'Total Land Area (Acres)', y, 30, 22);
  y = addCheckboxOptions(doc, 'Land Ownership', ['Owned by SAI', 'Lease', 'Shared with Partner'], y, 22);
  y += 2;
  
  // Conditional for Lease/Shared
  y = addConditionalBox(doc, 'Complete if Lease or Shared:', y, 25);
  y = addCheckboxOptions(doc, 'MOU Signed', ['Yes', 'No'], y, 24);
  y = addTextField(doc, 'If Yes - Tenure (Years)', y, 20, 24);
  y = addTextField(doc, 'Renewal Due Year', y, 20, 100);
  y = addTextField(doc, 'If No - Reason MOU not signed', y, 80, 24);
  y += 8;
  
  // Card 3.2: Discipline-wise FoP
  y = addCard(doc, 'Card 3.2: Discipline-wise Field of Play', y, 75);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Exclusive?', 'FoP Type', 'Year Built', 'Condition', 'Status']],
    body: Array(8).fill(['', '☐ Yes ☐ No', '☐ In ☐ Out', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 3;
  
  // Conditional for NOT Exclusive
  y = addConditionalBox(doc, 'For FoPs NOT Exclusive to SAI, provide:', y, 18);
  y = addTextField(doc, 'Owned By', y, 50, 24);
  y = addTextField(doc, 'Distance (km)', y, 15, 100);
  y = addCheckboxOptions(doc, 'Travel Mode', ['Walk', 'Hired Vehicle', 'SAI Vehicle', 'Public Transport', 'Other'], y, 24);
  y += 8;
  
  addPageFooter(doc, pageNumber);
  
  // Continue Section 3 on new page
  doc.addPage();
  pageNumber = 5;
  addPageHeader(doc, 3, 'Infrastructure & Field of Play (contd.)', pageNumber);
  
  y = 35;
  
  // Card 3.3: Non-Sanctioned FoP
  y = addCard(doc, 'Card 3.3: Non-Sanctioned Field of Play', y, 45);
  y = addCheckboxOptions(doc, 'Has Non-Sanctioned FoP available', ['Yes', 'No'], y, 22);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['Sport/Activity', 'Indoor/Outdoor', 'Condition', 'Consider for Sanction?', 'Notes']],
    body: Array(3).fill(['', '', '', '☐ Yes ☐ No', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  // Card 3.4: General Facilities
  y = addCard(doc, 'Card 3.4: General Facilities', y, 55);
  y = addCheckboxOptions(doc, 'Warm-up Area Available', ['Yes', 'No'], y, 22);
  y = addTextField(doc, 'Warm-up Area Description', y, 100, 22);
  y = addTextArea(doc, 'S&C / Gym Description:', y, 2, 22);
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Indoor Facilities:', 22, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  y = addCheckboxOptions(doc, 'Available', ['Yes', 'No'], y, 22);
  y = addTextField(doc, 'Description', y, 60, 22);
  y = addTextField(doc, 'Area (sqft)', y, 25, 110);
  y = addTextField(doc, 'Construction Year', y, 20, 22);
  y = addCheckboxOptions(doc, 'Condition', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation'], y, 70);
  y += 8;
  
  // Card 3.5: Administrative Block
  y = addCard(doc, 'Card 3.5: Administrative Block', y, 70);
  y = addCheckboxOptions(doc, 'Admin Block Available', ['Yes', 'No'], y, 22);
  y += 2;
  
  // Conditional for Admin Block exists
  y = addConditionalBox(doc, 'If Admin Block Available:', y, 45);
  y = addTextField(doc, 'Number of Floors', y, 15, 24);
  y = addTextField(doc, 'Area (sqft)', y, 25, 80);
  y = addTextField(doc, 'Construction Year', y, 20, 130);
  y = addCheckboxOptions(doc, 'Condition', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation'], y, 24);
  y = addCheckboxOptions(doc, 'Sufficient Space for Staff', ['Yes', 'No'], y, 24);
  y = addCheckboxOptions(doc, 'Has Separate Accounts Room', ['Yes', 'No'], y, 24);
  y = addCheckboxOptions(doc, 'Has Store Room', ['Yes', 'No'], y, 100);
  y = addCheckboxOptions(doc, 'Has Meeting Room', ['Yes', 'No'], y, 24);
  y = addCheckboxOptions(doc, 'Internet Connectivity', ['Broadband', '4G/Mobile', 'Limited', 'None'], y, 24);
  y = addCheckboxOptions(doc, 'IT Equipment Adequacy', ['Adequate', 'Partial', 'Inadequate', 'None'], y, 24);
  y += 5;
  
  // Conditional for Admin Block NOT exists
  y = addConditionalBox(doc, 'If Admin Block NOT Available:', y, 15);
  y = addCheckboxOptions(doc, 'New Admin Block Needed', ['Yes', 'No'], y, 24);
  y = addTextField(doc, 'Justification', y, 100, 24);
  y += 10;
  
  addPageFooter(doc, pageNumber);
  
  // Continue with Card 3.6 on same or new page
  const check1 = checkPageBreak(doc, y, 35, 3, 'Infrastructure & Field of Play (contd.)', pageNumber);
  y = check1.y;
  pageNumber = check1.page;
  
  // Card 3.6: Expansion & Environment
  y = addCard(doc, 'Card 3.6: Expansion & Environment', y, 30);
  y = addCheckboxOptions(doc, 'Surplus Land Available for Expansion', ['Yes', 'No'], y, 22);
  y = addTextField(doc, 'If Yes - Acres', y, 15, 22);
  y = addTextField(doc, 'Potential Use', y, 80, 70);
  y = addCheckboxOptions(doc, 'Weather Impacts Training', ['Yes', 'No'], y, 22);
  y = addTextField(doc, 'If Yes - Description', y, 100, 22);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 4: HOSTEL & AMENITIES ====================
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 4, 'Hostel & Amenities', pageNumber);
  
  y = 35;
  
  // Card 4.1: Hostel Availability
  y = addCard(doc, 'Card 4.1: Hostel Availability', y, 25);
  y = addCheckboxOptions(doc, 'Hostel Facility Available', ['Yes', 'No'], y, 22);
  y += 2;
  
  // Conditional for NO hostel
  y = addConditionalBox(doc, 'If NO Hostel - Alternative residential arrangement:', y, 12);
  y = addTextField(doc, '', y, 145, 24);
  y += 8;
  
  // Card 4.2: Building Details
  y = addCard(doc, 'Card 4.2: Building Details (If hostel available)', y, 18);
  y = addTextField(doc, 'Building Construction Year', y, 25, 22);
  y = addTextField(doc, 'Number of Floors', y, 15, 100);
  y += 5;
  
  // Card 4.3: Capacity & Room Details
  y = addCard(doc, 'Card 4.3: Capacity & Room Details', y, 55);
  y = addCheckboxOptions(doc, 'Hostel Type', ['Rooms', 'Dormitory', 'Mixed'], y, 22);
  y = addTextField(doc, 'Total Bed Capacity', y, 25, 22);
  y = addTextField(doc, 'Current Occupancy', y, 25, 100);
  y = addTextField(doc, 'Male Beds', y, 25, 22);
  y = addTextField(doc, 'Female Beds', y, 25, 100);
  y = addTextField(doc, 'Number of Rooms', y, 20, 22);
  y = addTextField(doc, 'Number of Dormitories', y, 20, 100);
  y += 2;
  doc.setFontSize(8);
  doc.text('Room Type Breakup:', 22, y);
  y += 4;
  y = addTextField(doc, 'Single Bed Rooms', y, 15, 24);
  y = addTextField(doc, '2-Bed', y, 15, 70);
  y = addTextField(doc, '3-Bed', y, 15, 110);
  y = addTextField(doc, '4-Bed', y, 15, 150);
  y = addCheckboxOptions(doc, 'Gender Segregation Present', ['Yes', 'No'], y, 22);
  y += 5;
  
  // Card 4.4: Amenities
  y = addCard(doc, 'Card 4.4: Amenities', y, 40);
  doc.setFontSize(8);
  doc.text('Check all available:', 22, y);
  y += 4;
  const amenities = ['TV Room', 'Reading Room', 'Recreation Area', 'Laundry', 'Wi-Fi', 'AC', 'Fans'];
  xPos = 22;
  amenities.forEach((amenity) => {
    if (xPos + doc.getTextWidth(amenity) + 12 > 185) {
      xPos = 22;
      y += 5;
    }
    xPos = addCheckbox(doc, amenity, xPos, y);
  });
  y += 6;
  y = addCheckboxOptions(doc, 'Water Supply', ['Municipal', 'Borewell', 'Tanker', 'Mixed'], y, 22);
  y = addCheckboxOptions(doc, 'Power Backup Available', ['Yes', 'No'], y, 22);
  y = addCheckboxOptions(doc, 'Fire Safety Equipment', ['Yes', 'No'], y, 100);
  y += 5;
  
  addPageFooter(doc, pageNumber);
  
  // Continue Section 4
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 4, 'Hostel & Amenities (contd.)', pageNumber);
  
  y = 35;
  
  // Card 4.5: Toilet & Sanitation
  y = addCard(doc, 'Card 4.5: Toilet & Sanitation', y, 30);
  y = addCheckboxOptions(doc, 'Toilet Type', ['Western', 'Indian', 'Both'], y, 22);
  y = addTextField(doc, 'Functional Toilets Count', y, 20, 22);
  y = addCheckboxOptions(doc, 'Toilets Sufficient', ['Yes', 'No'], y, 22);
  y = addTextField(doc, 'Bathroom Ratio (Athletes per Bathroom)', y, 20, 22);
  y += 5;
  
  // Card 4.6: Dining & Mess
  y = addCard(doc, 'Card 4.6: Dining & Mess', y, 25);
  y = addCheckboxOptions(doc, 'Mess Operator', ['SAI', 'Outsourced'], y, 22);
  y = addTextField(doc, 'If Outsourced - Contractor Name', y, 70, 22);
  y = addTextField(doc, 'Dining Seating Capacity', y, 25, 22);
  y = addCheckboxOptions(doc, 'Dining Area Quality', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation'], y, 22);
  y += 5;
  
  // Card 4.7: Overall Quality
  y = addCard(doc, 'Card 4.7: Overall Hostel Quality', y, 35);
  y = addCheckboxOptions(doc, 'Overall Quality', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation'], y, 22);
  doc.setFontSize(8);
  doc.text('Improvement Needs (check all that apply):', 22, y);
  y += 4;
  const improvements = ['Beds/Mattresses', 'Plumbing', 'Electrical', 'Painting', 'Flooring', 'Other'];
  xPos = 22;
  improvements.forEach((item) => {
    if (xPos + doc.getTextWidth(item) + 12 > 185) {
      xPos = 22;
      y += 5;
    }
    xPos = addCheckbox(doc, item, xPos, y);
  });
  y += 10;
  
  // Card 4.8: New Hostel Requirement
  y = addCard(doc, 'Card 4.8: New Hostel Requirement', y, 35);
  y = addCheckboxOptions(doc, 'New Hostel Needed', ['Yes', 'No'], y, 22);
  y += 2;
  
  // Conditional for new hostel
  y = addConditionalBox(doc, 'If New Hostel Needed:', y, 20);
  y = addCheckboxOptions(doc, 'Land Available for New Hostel', ['Yes', 'No'], y, 24);
  y = addTextField(doc, 'Land Area (Acres)', y, 20, 24);
  y = addTextField(doc, 'Beds Needed', y, 20, 100);
  y = addTextArea(doc, 'Justification:', y, 2, 24);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 5: HUMAN RESOURCES ====================
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 5, 'Human Resources', pageNumber);
  
  y = 35;
  
  // Card 5.1: Coaching Staff
  y = addCard(doc, 'Card 5.1: Coaching Staff', y, 100);
  y = addTextField(doc, 'Total Number of Coaches', y, 20, 22);
  
  // Auto-calculated box
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.roundedRect(22, y, 170, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.text('Formula: Total Athletes / Total Coaches = Coach:Athlete Ratio', 26, y + 7);
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  y += 15;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Coach Roster:', 22, y);
  doc.setFont('helvetica', 'normal');
  y += 3;
  
  autoTable(doc, {
    startY: y,
    head: [['#', 'Name', 'Designation', 'Sport/Discipline', 'Employment', 'Posted Since', 'Last Training', 'Course Level']],
    body: Array(10).fill(['', '', '', '', '', '', '', '']),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 6 
    },
    columnStyles: { 0: { cellWidth: 8 } },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  // Card 5.2: Administrative Staff
  y = addCard(doc, 'Card 5.2: Administrative Staff', y, 45);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['#', 'Name', 'Designation', 'Posted Since', 'Responsibilities']],
    body: Array(5).fill(['', '', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    columnStyles: { 0: { cellWidth: 10 } },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  addPageFooter(doc, pageNumber);
  
  // Continue Section 5
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 5, 'Human Resources (contd.)', pageNumber);
  
  y = 35;
  
  // Card 5.3: Groundsmen & Support Staff
  y = addCard(doc, 'Card 5.3: Groundsmen & Support Staff', y, 35);
  y = addTextField(doc, 'Total Number of Groundsmen', y, 20, 22);
  y = addTextField(doc, 'Total Number of Support Staff', y, 20, 22);
  y = addTextArea(doc, 'Notes on staffing adequacy:', y, 2, 22);
  y += 5;
  
  // Card 5.4: Security Staff
  y = addCard(doc, 'Card 5.4: Security Staff', y, 25);
  y = addCheckboxOptions(doc, 'Security Provider', ['SAI Staff', 'Outsourced', 'None'], y, 22);
  y = addTextField(doc, 'Number of Security Personnel', y, 20, 22);
  y = addCheckboxOptions(doc, 'Security Adequate', ['Yes', 'No'], y, 100);
  y += 5;
  
  // Card 5.5: Staff Awareness
  y = addCard(doc, 'Card 5.5: Staff Awareness & Training', y, 30);
  y = addCheckboxOptions(doc, 'Sports Science Awareness', ['High', 'Medium', 'Low', 'None'], y, 22);
  y = addCheckboxOptions(doc, 'Nutrition Planning Awareness', ['High', 'Medium', 'Low', 'None'], y, 22);
  y = addCheckboxOptions(doc, 'Anti-Doping Awareness', ['High', 'Medium', 'Low', 'None'], y, 22);
  y += 5;
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 6: EQUIPMENT & S&C ====================
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 6, 'Equipment & Strength & Conditioning', pageNumber);
  
  y = 35;
  
  // Card 6.1: Equipment Overview
  y = addCard(doc, 'Card 6.1: Equipment Overview', y, 30);
  y = addCheckboxOptions(doc, 'Overall Equipment Quality (1-5)', ['1', '2', '3', '4', '5'], y, 22);
  y = addCheckboxOptions(doc, 'Equipment Age Category', ['New', '0-2 yrs', '3-5 yrs', '>5 yrs', 'Mixed', 'Not sure'], y, 22);
  y = addTextField(doc, 'Equipment Procurement Year', y, 25, 22);
  y = addCheckboxOptions(doc, 'Training Equipment Condition (1-5)', ['1', '2', '3', '4', '5'], y, 22);
  y += 5;
  
  // Card 6.2: Discipline-wise Equipment
  y = addCard(doc, 'Card 6.2: Discipline-wise Sports Equipment', y, 60);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Equipment Description', 'Adequacy', 'Utilization Level', 'Barriers to Full Use']],
    body: Array(6).fill(['', '', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 3;
  doc.setFontSize(7);
  doc.setTextColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.text('Adequacy: Adequate / Partially Adequate / Inadequate / Not Available  |  Utilization: Fully / Partially / Underutilized / Not Used', 22, y);
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  y += 8;
  
  // Card 6.3: Equipment Upgrade Needs
  y = addCard(doc, 'Card 6.3: Equipment Upgrade Needs', y, 15);
  doc.setFontSize(8);
  doc.text('Check all that apply:', 22, y);
  y += 4;
  const upgradeNeeds = ['Replace existing', 'Repair existing', 'Add new equipment', 'Other'];
  xPos = 22;
  upgradeNeeds.forEach((item) => {
    xPos = addCheckbox(doc, item, xPos, y);
  });
  y += 10;
  
  // Card 6.4: Equipment Gap Items
  y = addCard(doc, 'Card 6.4: Equipment Gap Items', y, 40);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['#', 'Discipline', 'Item Description & Challenges', 'Qty Needed', 'Priority']],
    body: [
      ['1', '', '', '', '☐ High ☐ Medium ☐ Low'],
      ['2', '', '', '', '☐ High ☐ Medium ☐ Low'],
      ['3', '', '', '', '☐ High ☐ Medium ☐ Low'],
    ],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [200, 80, 80],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 60 } },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  addPageFooter(doc, pageNumber);
  
  // Continue Section 6 - S&C Setup
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 6, 'Equipment & S&C (contd.)', pageNumber);
  
  y = 35;
  
  // Card 6.5: S&C Setup
  y = addCard(doc, 'Card 6.5: Strength & Conditioning Setup', y, 85);
  y = addCheckboxOptions(doc, 'S&C Setup Level', ['Comprehensive', 'Basic', 'Minimal', 'None'], y, 22);
  y = addTextArea(doc, 'S&C Description:', y, 2, 22);
  
  doc.setFontSize(8);
  doc.text('Equipment Categories (check all available):', 22, y);
  y += 4;
  const scCategories = ['Racks', 'Free weights', 'Platforms', 'Cardio', 'Plyo', 'Mobility', 'Testing equipment', 'Other'];
  xPos = 22;
  scCategories.forEach((item) => {
    if (xPos + doc.getTextWidth(item) + 12 > 185) {
      xPos = 22;
      y += 5;
    }
    xPos = addCheckbox(doc, item, xPos, y);
  });
  y += 6;
  
  y = addCheckboxOptions(doc, 'S&C Equipment Condition', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation'], y, 22);
  y = addCheckboxOptions(doc, 'Structured S&C Program in Place', ['Yes', 'No'], y, 22);
  y += 2;
  
  // Conditional for S&C exists
  y = addConditionalBox(doc, 'If S&C Setup Exists:', y, 25);
  doc.setFontSize(8);
  doc.text('Methodologies Used (check all):', 24, y);
  y += 4;
  const methodologies = ['Strength Training', 'Speed/Power Training', 'Endurance Training', 'Flexibility/Recovery'];
  xPos = 24;
  methodologies.forEach((item) => {
    xPos = addCheckbox(doc, item, xPos, y);
  });
  y += 6;
  y = addTextField(doc, 'S&C Utilization Level', y, 60, 24);
  y = addTextField(doc, 'Barriers to Full Utilization', y, 100, 24);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 7: TALENT ID & COMPETITIONS ====================
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 7, 'Talent Identification & Competitions', pageNumber);
  
  y = 35;
  
  // Card 7.1: Athlete Origin (STC-Level)
  y = addCard(doc, 'Card 7.1: Athlete Origin (STC-Level Summary)', y, 25);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['Local Athletes (Same State)', 'Other State Athletes', 'Total']],
    body: [['', '', '']],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 8 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  // Card 7.2: Athlete Origin by Discipline
  y = addCard(doc, 'Card 7.2: Athlete Origin by Discipline', y, 50);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Local Athletes', 'Other State', 'Total']],
    body: Array(6).fill(['', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  // Card 7.3: Selection Trials
  y = addCard(doc, 'Card 7.3: Selection Trials', y, 45);
  y = addCheckboxOptions(doc, 'Are selection trials given sufficient publicity', ['Yes', 'No'], y, 22);
  y += 2;
  
  // Conditional for Yes
  y = addConditionalBox(doc, 'If Yes - Methods used (check all):', y, 12);
  const publicityMethods = ['School outreach', 'District sports office', 'Social media', 'Newspapers', 'Federations', 'Clubs', 'Other'];
  xPos = 24;
  publicityMethods.forEach((item) => {
    if (xPos + doc.getTextWidth(item) + 12 > 185) {
      xPos = 24;
      y += 5;
    }
    xPos = addCheckbox(doc, item, xPos, y);
  });
  y += 8;
  
  y = addCheckboxOptions(doc, 'Is there good turnout during trials', ['Yes', 'No'], y, 22);
  y += 2;
  
  // Conditional for No (poor turnout)
  y = addConditionalBox(doc, 'If No (Poor Turnout) - Reasons & Challenges:', y, 12);
  doc.setDrawColor(COLORS.textMuted.r, COLORS.textMuted.g, COLORS.textMuted.b);
  doc.line(24, y + 5, 188, y + 5);
  doc.line(24, y + 10, 188, y + 10);
  y += 15;
  
  addPageFooter(doc, pageNumber);
  
  // Continue Section 7
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 7, 'Talent ID & Competitions (contd.)', pageNumber);
  
  y = 35;
  
  // Card 7.4: Competition Participation
  y = addCard(doc, 'Card 7.4: Competition Participation by Discipline', y, 80);
  doc.setFontSize(8);
  doc.text('For each discipline, provide participation and medal counts:', 22, y);
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Level', '2025-26 Participants', '2025-26 Medals', '2020-24 Participants', '2020-24 Medals']],
    body: [
      ['', 'State', '', '', '', ''],
      ['', 'National', '', '', '', ''],
      ['', 'International', '', '', '', ''],
      ['', 'State', '', '', '', ''],
      ['', 'National', '', '', '', ''],
      ['', 'International', '', '', '', ''],
      ['', 'State', '', '', '', ''],
      ['', 'National', '', '', '', ''],
      ['', 'International', '', '', '', ''],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b],
      textColor: [255, 255, 255],
      fontSize: 6 
    },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 8;
  
  // Card 7.5: Notable Achievements
  y = addCard(doc, 'Card 7.5: Notable Achievements', y, 30);
  y = addTextArea(doc, 'List notable achievements from this STC:', y, 4, 22);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 8: VISION FOR STC ====================
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 8, 'Vision for STC', pageNumber);
  
  y = 35;
  
  // Card 8.1: Key Strengths
  y = addCard(doc, 'Card 8.1: Key Strengths (Top 3)', y, 35);
  for (let i = 1; i <= 3; i++) {
    y = addTextField(doc, `${i}`, y, 155, 22);
  }
  y += 5;
  
  // Card 8.2: Critical Challenges
  y = addCard(doc, 'Card 8.2: Critical Challenges (Top 3)', y, 35);
  for (let i = 1; i <= 3; i++) {
    y = addTextField(doc, `${i}`, y, 155, 22);
  }
  y += 5;
  
  // Card 8.3: Vision Statement
  y = addCard(doc, 'Card 8.3: Vision Statement', y, 25);
  y = addTextArea(doc, 'Vision for the STC in the next 5 years:', y, 3, 22);
  y += 5;
  
  // Card 8.4: Strategic Roadmap
  y = addCard(doc, 'Card 8.4: Strategic Roadmap', y, 75);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Short-Term Actions (6 Months - 1 Year):', 22, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  for (let i = 1; i <= 3; i++) {
    y = addTextField(doc, `${i}`, y, 150, 24);
  }
  y += 3;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Medium-Term Suggestions (1-3 Years):', 22, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  for (let i = 1; i <= 3; i++) {
    y = addTextField(doc, `${i}`, y, 150, 24);
  }
  y += 3;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Long-Term Suggestions (3-5 Years):', 22, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  for (let i = 1; i <= 3; i++) {
    y = addTextField(doc, `${i}`, y, 150, 24);
  }
  
  addPageFooter(doc, pageNumber);
  
  // Continue Section 8
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 8, 'Vision for STC (contd.)', pageNumber);
  
  y = 35;
  
  // Card 8.5: NCOE Upgrade Assessment
  y = addCard(doc, 'Card 8.5: NCOE Upgrade Assessment', y, 35);
  y = addCheckboxOptions(doc, 'Is this STC fit for upgrade to NCOE', ['Yes', 'No', 'Not Sure'], y, 22);
  y += 2;
  
  // Conditional for justification
  y = addConditionalBox(doc, 'Justification / Explanation:', y, 20);
  y = addTextArea(doc, '', y, 3, 24);
  y += 8;
  
  // Card 8.6: Additional Comments
  y = addCard(doc, 'Card 8.6: Additional Comments', y, 30);
  y = addTextArea(doc, 'Any other comments or suggestions:', y, 4, 22);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== SECTION 9: ATTACHMENTS & DECLARATION ====================
  doc.addPage();
  pageNumber++;
  addPageHeader(doc, 9, 'Attachments & Declaration', pageNumber);
  
  y = 35;
  
  // Instructions box
  doc.setFillColor(COLORS.cardBg.r, COLORS.cardBg.g, COLORS.cardBg.b);
  doc.setDrawColor(COLORS.indiaGreen.r, COLORS.indiaGreen.g, COLORS.indiaGreen.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, 182, 20, 2, 2, 'FD');
  doc.setFillColor(COLORS.indiaGreen.r, COLORS.indiaGreen.g, COLORS.indiaGreen.b);
  doc.rect(14, y, 3, 20, 'F');
  
  doc.setTextColor(COLORS.indiaGreen.r, COLORS.indiaGreen.g, COLORS.indiaGreen.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTACHMENT INSTRUCTIONS', 20, y + 7);
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('For the offline form, please attach physical copies of the following documents and label them clearly.', 20, y + 14);
  y += 28;
  
  // Recommended Uploads Checklist
  y = addCard(doc, 'Recommended Attachments Checklist', y, 35);
  doc.setFontSize(8);
  const attachments = [
    'Facility Photos (Training Areas)',
    'Field of Play Photos',
    'Hostel Photos',
    'Equipment Photos',
    'MoU/Agreement Documents',
    'Certificates and Accreditations',
    'Equipment Inventory Documents',
  ];
  
  let col = 0;
  attachments.forEach((item, index) => {
    const xp = 22 + (col * 90);
    const yp = y + (Math.floor(index / 2) * 7);
    addCheckbox(doc, item, xp, yp);
    col = (col + 1) % 2;
  });
  y += 35;
  
  // Attachment Log Table
  y = addCard(doc, 'Attachment Log', y, 40);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    head: [['#', 'Category', 'Discipline (if applicable)', 'Caption/Description', 'Attached?']],
    body: Array(4).fill(['', '', '', '', '☐ Yes']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b],
      textColor: [255, 255, 255],
      fontSize: 7 
    },
    columnStyles: { 0: { cellWidth: 10 }, 4: { cellWidth: 20 } },
    margin: { left: 22, right: 14 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  // Respondent Information
  y = addCard(doc, 'Respondent Information', y, 30);
  y = addTextField(doc, 'Respondent Name', y, 80, 22);
  y = addTextField(doc, 'Designation/Role', y, 50, 110);
  y = addTextField(doc, 'Mobile Number', y, 50, 22);
  y = addTextField(doc, 'Email Address', y, 80, 100);
  y += 5;
  
  // Declaration Box
  doc.setFillColor(COLORS.conditionalBg.r, COLORS.conditionalBg.g, COLORS.conditionalBg.b);
  doc.setDrawColor(COLORS.saffron.r, COLORS.saffron.g, COLORS.saffron.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, 182, 35, 2, 2, 'FD');
  
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARATION', 20, y + 8);
  
  doc.setTextColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const declaration = 'I hereby certify that the information provided in this form is accurate and complete to the best of my knowledge. I understand that this data will be used for planning and assessment purposes by the Sports Authority of India.';
  const splitDeclaration = doc.splitTextToSize(declaration, 170);
  doc.text(splitDeclaration, 20, y + 15);
  y += 42;
  
  // Signature lines
  doc.setDrawColor(COLORS.textPrimary.r, COLORS.textPrimary.g, COLORS.textPrimary.b);
  doc.setLineWidth(0.3);
  
  doc.line(20, y + 12, 70, y + 12);
  doc.setFontSize(8);
  doc.text('Signature of Respondent', 20, y + 17);
  
  doc.line(85, y + 12, 135, y + 12);
  doc.text('Signature of CIC', 85, y + 17);
  
  doc.line(150, y + 12, 190, y + 12);
  doc.text('Date', 150, y + 17);
  
  addPageFooter(doc, pageNumber);
  
  // ==================== FINALIZE: Add footer to all pages ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer is already added per page, but we can update if needed
  }
  
  return doc;
}

export function downloadBlankFormPDF(type: 'printable' | 'fillable'): void {
  const doc = generateBlankFormPDF({ type });
  const filename = type === 'printable' 
    ? 'STC_Profile_Form_Printable.pdf'
    : 'STC_Profile_Form_Fillable.pdf';
  doc.save(filename);
}
