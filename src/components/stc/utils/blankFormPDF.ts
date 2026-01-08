import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SAI_BLUE = '#1a237e';
const SAI_LIGHT_BLUE = '#e3f2fd';
const HEADER_BG = '#2962FF';

interface PDFOptions {
  type: 'printable' | 'fillable';
}

// Helper to add section header
function addSectionHeader(doc: jsPDF, title: string, sectionNumber: number, yPos: number): number {
  doc.setFillColor(HEADER_BG);
  doc.rect(14, yPos, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Section ${sectionNumber}: ${title}`, 20, yPos + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  return yPos + 15;
}

// Helper to add text field
function addTextField(doc: jsPDF, label: string, yPos: number, width: number = 80): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(label + ':', 14, yPos);
  doc.setDrawColor(150);
  doc.line(14 + doc.getTextWidth(label + ': '), yPos, 14 + doc.getTextWidth(label + ': ') + width, yPos);
  return yPos + 8;
}

// Helper to add checkbox options
function addCheckboxOptions(doc: jsPDF, label: string, options: string[], yPos: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(label + ':', 14, yPos);
  yPos += 6;
  
  let xPos = 14;
  options.forEach((option, index) => {
    doc.rect(xPos, yPos - 4, 4, 4);
    doc.text(option, xPos + 6, yPos);
    xPos += doc.getTextWidth(option) + 15;
    if (xPos > 170) {
      xPos = 14;
      yPos += 7;
    }
  });
  
  return yPos + 8;
}

// Helper to add a text area
function addTextArea(doc: jsPDF, label: string, yPos: number, lines: number = 3): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(label + ':', 14, yPos);
  yPos += 4;
  
  for (let i = 0; i < lines; i++) {
    doc.setDrawColor(200);
    doc.line(14, yPos + (i * 7), 196, yPos + (i * 7));
  }
  
  return yPos + (lines * 7) + 4;
}

// Helper to check page break
function checkPageBreak(doc: jsPDF, yPos: number, requiredSpace: number): number {
  if (yPos + requiredSpace > 280) {
    doc.addPage();
    return 20;
  }
  return yPos;
}

export function generateBlankFormPDF(options: PDFOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const isPrintable = options.type === 'printable';
  
  // ==================== COVER PAGE ====================
  doc.setFillColor(SAI_BLUE);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('STC Data Collection Form', 105, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Sports Authority of India', 105, 38, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  // Instructions box
  doc.setFillColor(SAI_LIGHT_BLUE);
  doc.rect(14, 60, 182, 80, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Instructions for Filling This Form', 20, 72);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const instructions = [
    '1. Please fill all sections completely and accurately.',
    '2. Use BLOCK LETTERS for handwritten entries.',
    '3. Tick the appropriate checkboxes where applicable.',
    '4. For numerical fields, use whole numbers unless specified.',
    '5. If any section is not applicable, write "N/A".',
    '6. Attach supporting documents where requested.',
    '7. Ensure the form is signed by the Centre In-Charge.',
    '8. Submit the completed form via email to: stc.data@sai.gov.in',
  ];
  
  let instrY = 82;
  instructions.forEach(instr => {
    doc.text(instr, 20, instrY);
    instrY += 7;
  });
  
  // Important notes
  doc.setFillColor(255, 243, 224);
  doc.rect(14, 150, 182, 35, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Important Notes:', 20, 162);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('• Data should be as of the current date unless otherwise specified.', 20, 172);
  doc.text('• For capacity figures, use sanctioned strength as per official records.', 20, 179);
  
  // Footer on cover
  doc.setFontSize(10);
  doc.text('Form Version: 2025.1', 14, 250);
  doc.text('Page 1', 196, 290, { align: 'right' });
  
  // ==================== SECTION 1: CENTRE IDENTITY ====================
  doc.addPage();
  let y = 20;
  
  y = addSectionHeader(doc, 'Centre Identity & Status', 1, y);
  
  y = addTextField(doc, 'STC Name', y, 100);
  y = addTextField(doc, 'State', y, 60);
  y = addTextField(doc, 'Regional Centre', y, 70);
  y = addTextField(doc, 'District', y, 60);
  y = addTextField(doc, 'Pin Code', y, 30);
  
  y += 5;
  y = addCheckboxOptions(doc, 'Operational Status', ['Operational', 'Abeyance', 'Non-Operational'], y);
  
  y = addTextField(doc, 'If Abeyance/Non-Operational, Since When (Date)', y, 50);
  y = addTextArea(doc, 'Reasons for Abeyance/Non-Operational Status', y, 2);
  
  y = addTextField(doc, 'Year of Inclusion as STC', y, 30);
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Centre In-Charge Details:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addTextField(doc, 'CIC Name', y, 80);
  y = addTextField(doc, 'CIC Designation', y, 60);
  y = addTextField(doc, 'CIC Posted Since (Date)', y, 40);
  y = addTextField(doc, 'CIC Contact Number', y, 50);
  y = addTextField(doc, 'CIC Email', y, 80);
  
  y += 5;
  y = addTextArea(doc, 'Full Address of Centre', y, 3);
  
  doc.text('Page 2', 196, 290, { align: 'right' });
  
  // ==================== SECTION 2: DISCIPLINES & ATHLETE STRENGTH ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Disciplines & Athlete Strength', 2, y);
  
  doc.setFontSize(10);
  doc.text('List all currently sanctioned disciplines with their strength:', 14, y);
  y += 5;
  
  // Discipline strength table
  autoTable(doc, {
    startY: y,
    head: [[
      'S.No',
      'Discipline Name',
      'San. Res. Boys',
      'San. Res. Girls',
      'San. NR Boys',
      'San. NR Girls',
      'Ex. Res. Boys',
      'Ex. Res. Girls',
      'Ex. NR Boys',
      'Ex. NR Girls',
    ]],
    body: Array(12).fill(['', '', '', '', '', '', '', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 98, 255], fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
    },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = checkPageBreak(doc, y, 60);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Previously Operational Disciplines (if any):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline Name', 'Years Operational (From-To)', 'Was Residential?', 'Was Non-Res?', 'Reason Discontinued']],
    body: Array(5).fill(['', '', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = addTextArea(doc, 'New Discipline Suggestions (if any)', y, 2);
  
  doc.text('Page 3', 196, 290, { align: 'right' });
  
  // ==================== SECTION 3: INFRASTRUCTURE ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Infrastructure & Field of Play', 3, y);
  
  y = addTextField(doc, 'Total Land Area (in acres)', y, 30);
  
  y = addCheckboxOptions(doc, 'Land Ownership', ['Owned by SAI', 'Lease/Agreement', 'Shared with Partner'], y);
  
  y = addTextField(doc, 'If Lease/Shared - Partner Organization Name', y, 80);
  y = addCheckboxOptions(doc, 'MOU Signed', ['Yes', 'No'], y);
  y = addTextField(doc, 'MOU Tenure (years)', y, 20);
  y = addTextField(doc, 'MOU Renewal Due Year', y, 20);
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Discipline-wise Field of Play (FoP) Details:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'FoP Type', 'Indoor/Outdoor', 'Exclusive to SAI?', 'Condition (1-5)', 'Year Built', 'Last Renovated']],
    body: Array(10).fill(['', '', '', '', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = checkPageBreak(doc, y, 50);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Non-Sanctioned FoPs (available but not officially sanctioned):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['FoP Type/Sport', 'Indoor/Outdoor', 'Condition', 'Currently Used For']],
    body: Array(5).fill(['', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [100, 100, 100] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = addCheckboxOptions(doc, 'Warmup/Stretching Area Available', ['Yes', 'No'], y);
  y = addTextField(doc, 'Warmup Area Description', y, 100);
  
  y = addCheckboxOptions(doc, 'S&C/Gym Setup Level', ['Basic', 'Intermediate', 'Advanced', 'None'], y);
  y = addTextArea(doc, 'S&C/Gym Description', y, 2);
  
  y = checkPageBreak(doc, y, 40);
  
  y = addTextArea(doc, 'Other Indoor Facilities Description', y, 2);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Administrative Block:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  y = addCheckboxOptions(doc, 'Admin Block Exists', ['Yes', 'No'], y);
  y = addTextField(doc, 'Number of Offices', y, 20);
  y = addTextField(doc, 'Number of Meeting Rooms', y, 20);
  y = addTextField(doc, 'Year Built', y, 20);
  y = addCheckboxOptions(doc, 'Condition', ['Excellent', 'Good', 'Needs Minor Repair', 'Needs Major Renovation'], y);
  
  y += 5;
  y = addCheckboxOptions(doc, 'Surplus Land Available for Expansion', ['Yes', 'No'], y);
  y = addTextField(doc, 'If Yes, Area (acres)', y, 20);
  
  y = addCheckboxOptions(doc, 'Weather/Environmental Impact on Training', ['None', 'Minimal', 'Moderate', 'Significant'], y);
  y = addTextArea(doc, 'Weather Impact Details', y, 2);
  
  doc.text('Page 4', 196, 290, { align: 'right' });
  
  // ==================== SECTION 4: HOSTEL ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Hostel & Amenities', 4, y);
  
  y = addCheckboxOptions(doc, 'Hostel Facility Available', ['Yes', 'No'], y);
  y = addTextField(doc, 'If No, Alternative Residential Arrangement', y, 100);
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Hostel Building Details:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addTextField(doc, 'Year of Construction', y, 20);
  y = addTextField(doc, 'Number of Floors', y, 15);
  y = addCheckboxOptions(doc, 'Hostel Type', ['Rooms', 'Dormitory', 'Mixed'], y);
  
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Capacity:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addTextField(doc, 'Total Bed Capacity', y, 30);
  y = addTextField(doc, 'Current Occupancy', y, 30);
  y = addTextField(doc, 'Male Beds', y, 25);
  y = addTextField(doc, 'Female Beds', y, 25);
  
  y += 5;
  doc.text('Room Type Breakup:', 14, y);
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Room Type', 'Number of Rooms', 'Beds per Room', 'Total Beds']],
    body: [
      ['Single', '', '', ''],
      ['Double', '', '', ''],
      ['Triple', '', '', ''],
      ['Dormitory', '', '', ''],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = checkPageBreak(doc, y, 80);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Amenities (tick all that apply):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  
  const amenities = [
    'Air Conditioning', 'Ceiling Fans', 'Attached Bathroom', 'Common Bathroom',
    'Hot Water', 'Laundry Facility', 'Recreation Room', 'Study Room',
    'Wi-Fi', 'TV Room', 'Indoor Games', 'First Aid Room',
  ];
  
  let xPos = 14;
  amenities.forEach((amenity, index) => {
    doc.rect(xPos, y - 3, 3, 3);
    doc.text(amenity, xPos + 5, y);
    xPos += 45;
    if ((index + 1) % 4 === 0) {
      xPos = 14;
      y += 7;
    }
  });
  y += 10;
  
  y = addCheckboxOptions(doc, 'Water Supply', ['Municipal', 'Borewell', 'Tanker', 'Mixed'], y);
  y = addCheckboxOptions(doc, 'Power Backup', ['Generator', 'Inverter', 'Both', 'None'], y);
  
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Toilet & Sanitation:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addTextField(doc, 'Total Toilets', y, 20);
  y = addTextField(doc, 'Male Toilets', y, 20);
  y = addTextField(doc, 'Female Toilets', y, 20);
  y = addCheckboxOptions(doc, 'Toilet Condition', ['Excellent', 'Good', 'Needs Repair', 'Poor'], y);
  
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Mess & Dining:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addCheckboxOptions(doc, 'Mess Facility', ['Yes', 'No'], y);
  y = addTextField(doc, 'Dining Capacity (persons at a time)', y, 30);
  y = addCheckboxOptions(doc, 'Kitchen Type', ['In-house', 'Outsourced', 'Both'], y);
  y = addTextField(doc, 'Nutritionist/Dietician Available', y, 30);
  
  y += 5;
  y = addCheckboxOptions(doc, 'Overall Hostel Quality', ['Excellent', 'Good', 'Needs Minor Repair', 'Needs Major Renovation'], y);
  
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('New Hostel Requirements:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  y = addCheckboxOptions(doc, 'New Hostel Required', ['Yes', 'No'], y);
  y = addTextField(doc, 'If Yes, Beds Required', y, 30);
  y = addTextArea(doc, 'Justification for New Hostel', y, 2);
  
  doc.text('Page 5', 196, 290, { align: 'right' });
  
  // ==================== SECTION 5: HUMAN RESOURCES ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Human Resources', 5, y);
  
  y = addTextField(doc, 'Total Number of Coaches', y, 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Coaching Staff Details:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['S.No', 'Name', 'Designation', 'Sport/Discipline', 'Employment Type', 'Posted Since', 'Highest Coaching Course']],
    body: Array(15).fill(['', '', '', '', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 98, 255], fontSize: 7 },
    columnStyles: { 0: { cellWidth: 10 } },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  doc.text('Page 6', 196, 290, { align: 'right' });
  
  doc.addPage();
  y = 20;
  
  y = addTextField(doc, 'Total Number of Groundsmen', y, 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Groundsmen Details:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['S.No', 'Name', 'Employment Type (Regular/Contract)', 'Assigned FoP/Area']],
    body: Array(10).fill(['', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
    columnStyles: { 0: { cellWidth: 10 } },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = addTextField(doc, 'Total Number of Administrative Staff', y, 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Administrative Staff Details:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['S.No', 'Name', 'Designation', 'Employment Type', 'Posted Since']],
    body: Array(10).fill(['', '', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
    columnStyles: { 0: { cellWidth: 10 } },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = checkPageBreak(doc, y, 40);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Staff Awareness & Training:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addCheckboxOptions(doc, 'AMS/NSRS Awareness', ['Fully Aware', 'Partially Aware', 'Not Aware', 'Training Needed'], y);
  y = addCheckboxOptions(doc, 'POCSO/POSH Awareness', ['Fully Aware', 'Partially Aware', 'Not Aware', 'Training Needed'], y);
  
  y += 5;
  y = addTextField(doc, 'Total Security Staff', y, 20);
  
  doc.text('Page 7', 196, 290, { align: 'right' });
  
  // ==================== SECTION 6: EQUIPMENT ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Equipment & S&C', 6, y);
  
  y = addCheckboxOptions(doc, 'Overall Equipment Quality (1=Poor, 5=Excellent)', ['1', '2', '3', '4', '5'], y);
  y = addCheckboxOptions(doc, 'Equipment Age Category', ['Mostly New (<2 yrs)', 'Mixed Ages', 'Mostly Old (>5 yrs)', 'Needs Replacement'], y);
  y = addCheckboxOptions(doc, 'Competition-Grade Equipment Available', ['Yes', 'No', 'Partial'], y);
  y = addCheckboxOptions(doc, 'Video Analysis System', ['Yes', 'No'], y);
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Discipline-wise Equipment Status:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Equipment Description', 'Adequacy', 'Utilization Level', 'Barriers to Use']],
    body: Array(10).fill(['', '', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Equipment Gaps (items needed):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Item Needed', 'Quantity Required', 'Priority (High/Medium/Low)']],
    body: Array(10).fill(['', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [200, 100, 100] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = checkPageBreak(doc, y, 50);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Strength & Conditioning Setup:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addCheckboxOptions(doc, 'S&C Setup Level', ['Basic', 'Intermediate', 'Advanced', 'None'], y);
  
  const scEquipment = [
    'Free Weights', 'Weight Machines', 'Cardio Equipment', 'Resistance Bands',
    'Foam Rollers', 'Medicine Balls', 'Agility Ladder', 'Plyo Boxes',
  ];
  
  doc.text('S&C Equipment Available (tick all):', 14, y);
  y += 6;
  
  xPos = 14;
  scEquipment.forEach((item, index) => {
    doc.rect(xPos, y - 3, 3, 3);
    doc.text(item, xPos + 5, y);
    xPos += 50;
    if ((index + 1) % 4 === 0) {
      xPos = 14;
      y += 7;
    }
  });
  y += 10;
  
  y = addCheckboxOptions(doc, 'S&C Equipment Condition', ['Excellent', 'Good', 'Needs Repair', 'Poor'], y);
  
  doc.text('Page 8', 196, 290, { align: 'right' });
  
  // ==================== SECTION 7: TALENT ID & COMPETITIONS ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Talent Identification & Competitions', 7, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Athlete Origin (discipline-wise):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'Local Athletes (same state)', 'Other State Athletes', 'Total']],
    body: Array(10).fill(['', '', '', '']),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 98, 255] },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Selection Trials:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  y = addCheckboxOptions(doc, 'Trials Publicized Widely', ['Yes', 'No'], y);
  y = addTextField(doc, 'Publicity Methods Used', y, 100);
  y = addCheckboxOptions(doc, 'Good Turnout at Trials', ['Yes', 'No', 'Average'], y);
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Competition Performance (discipline-wise, last 12 months):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Discipline', 'State Participants', 'State Medals', 'National Participants', 'National Medals', 'Int\'l Participants', 'Int\'l Medals']],
    body: Array(10).fill(['', '', '', '', '', '', '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 98, 255], fontSize: 7 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  y = addTextArea(doc, 'Notable Achievements in Last 12 Months', y, 4);
  
  doc.text('Page 9', 196, 290, { align: 'right' });
  
  // ==================== SECTION 8: VISION ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Vision for STC', 8, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Key Strengths of this STC (list top 3):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  for (let i = 1; i <= 3; i++) {
    y = addTextArea(doc, `${i}.`, y, 2);
  }
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Primary Challenges (list top 3):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  for (let i = 1; i <= 3; i++) {
    y = addTextArea(doc, `${i}.`, y, 2);
  }
  
  y += 5;
  y = addTextArea(doc, 'Vision Statement for Next 5 Years', y, 3);
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Short-term Actions (6 months - 1 year):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  for (let i = 1; i <= 3; i++) {
    y = addTextArea(doc, `${i}.`, y, 1);
  }
  
  y = checkPageBreak(doc, y, 80);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Medium-term Suggestions (1-3 years):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  for (let i = 1; i <= 3; i++) {
    y = addTextArea(doc, `${i}.`, y, 1);
  }
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Long-term Suggestions (3-5 years):', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  for (let i = 1; i <= 3; i++) {
    y = addTextArea(doc, `${i}.`, y, 1);
  }
  
  y += 5;
  y = addCheckboxOptions(doc, 'Is this STC suitable for upgrade to NCOE?', ['Yes', 'No', 'Not Sure'], y);
  y = addTextArea(doc, 'Justification for NCOE Upgrade', y, 3);
  
  doc.text('Page 10', 196, 290, { align: 'right' });
  
  // ==================== SECTION 9: RESPONDENT INFO ====================
  doc.addPage();
  y = 20;
  
  y = addSectionHeader(doc, 'Respondent Information & Declaration', 9, y);
  
  y = addTextField(doc, 'Respondent Name', y, 80);
  y = addTextField(doc, 'Designation/Role', y, 60);
  y = addTextField(doc, 'Mobile Number', y, 50);
  y = addTextField(doc, 'Email Address', y, 80);
  
  y += 5;
  y = addCheckboxOptions(doc, 'Data Confidence Level (1=Low, 5=High)', ['1', '2', '3', '4', '5'], y);
  
  y = addTextField(doc, 'Date of Filling', y, 40);
  
  y += 10;
  doc.setFillColor(SAI_LIGHT_BLUE);
  doc.rect(14, y, 182, 40, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Declaration:', 20, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const declaration = 'I hereby certify that the information provided in this form is accurate and complete to the best of my knowledge. I understand that this data will be used for planning and assessment purposes by the Sports Authority of India.';
  const splitDeclaration = doc.splitTextToSize(declaration, 170);
  doc.text(splitDeclaration, 20, y + 18);
  
  y += 50;
  
  doc.setDrawColor(0);
  doc.line(14, y + 15, 80, y + 15);
  doc.text('Signature of Respondent', 14, y + 22);
  
  doc.line(100, y + 15, 160, y + 15);
  doc.text('Signature of CIC', 100, y + 22);
  
  doc.line(170, y + 15, 196, y + 15);
  doc.text('Date', 170, y + 22);
  
  y += 40;
  
  doc.setFillColor(255, 243, 224);
  doc.rect(14, y, 182, 25, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Submission Instructions:', 20, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('1. Scan the completed form and send to: stc.data@sai.gov.in', 20, y + 15);
  doc.text('2. Subject line: "STC Data Form - [Centre Name] - [Date]"', 20, y + 21);
  
  doc.text('Page 11', 196, 290, { align: 'right' });
  
  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`STC Data Collection Form - Sports Authority of India`, 14, 290);
  }
  
  return doc;
}

export function downloadBlankFormPDF(type: 'printable' | 'fillable'): void {
  const doc = generateBlankFormPDF({ type });
  const filename = type === 'printable' 
    ? 'STC_Data_Collection_Form_Printable.pdf'
    : 'STC_Data_Collection_Form_Fillable.pdf';
  doc.save(filename);
}
