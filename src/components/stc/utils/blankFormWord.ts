import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  WidthType,
  AlignmentType,
  PageBreak,
  TableOfContents,
  ShadingType,
} from "docx";

// ==================== COLOR SCHEME (SAI India Sports Colors) ====================
const COLORS = {
  saffron: 'FF9933',
  navyBlue: '000080',
  indiaGreen: '138808',
  cardBg: 'F9FAFB',
  cardBorder: 'E5E7EB',
  conditionalBg: 'FFF7ED',
  conditionalBorder: 'F59E0B',
  textPrimary: '1F2937',
  textMuted: '6B7280',
  white: 'FFFFFF',
};

// ==================== HELPER: Create Text Run ====================
function createTextRun(text: string, options: { bold?: boolean; color?: string; size?: number; italic?: boolean } = {}): TextRun {
  return new TextRun({
    text,
    bold: options.bold ?? false,
    color: options.color ?? COLORS.textPrimary,
    size: (options.size ?? 11) * 2, // Word uses half-points
    italics: options.italic ?? false,
  });
}

// ==================== HELPER: Create Section Title ====================
function createSectionTitle(number: number, title: string): Paragraph {
  return new Paragraph({
    children: [
      createTextRun(`Section ${number}: ${title}`, { bold: true, color: COLORS.white, size: 14 }),
    ],
    heading: HeadingLevel.HEADING_1,
    shading: {
      type: ShadingType.SOLID,
      color: COLORS.navyBlue,
      fill: COLORS.navyBlue,
    },
    spacing: { before: 400, after: 200 },
  });
}

// ==================== HELPER: Create Card Title ====================
function createCardTitle(title: string): Paragraph {
  return new Paragraph({
    children: [
      createTextRun(title, { bold: true, color: COLORS.navyBlue, size: 11 }),
    ],
    spacing: { before: 200, after: 100 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.saffron },
    },
    indent: { left: 100 },
  });
}

// ==================== HELPER: Create Text Field ====================
function createTextField(label: string): Paragraph {
  return new Paragraph({
    children: [
      createTextRun(`${label}: `, { size: 10 }),
      createTextRun('_'.repeat(50), { color: COLORS.textMuted, size: 10 }),
    ],
    spacing: { before: 80, after: 80 },
  });
}

// ==================== HELPER: Create Checkbox Row ====================
function createCheckboxRow(label: string, options: string[]): Paragraph {
  const children: TextRun[] = [
    createTextRun(`${label}: `, { size: 10 }),
  ];
  
  options.forEach((option, index) => {
    children.push(createTextRun(`☐ ${option}`, { size: 10 }));
    if (index < options.length - 1) {
      children.push(createTextRun('  ', { size: 10 }));
    }
  });
  
  return new Paragraph({
    children,
    spacing: { before: 80, after: 80 },
  });
}

// ==================== HELPER: Create Text Area ====================
function createTextArea(label: string, lines: number = 3): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [createTextRun(`${label}`, { size: 10 })],
      spacing: { before: 80, after: 40 },
    }),
  ];
  
  for (let i = 0; i < lines; i++) {
    paragraphs.push(new Paragraph({
      children: [createTextRun('_'.repeat(100), { color: COLORS.textMuted, size: 10 })],
      spacing: { before: 40, after: 40 },
    }));
  }
  
  return paragraphs;
}

// ==================== HELPER: Create Conditional Box ====================
function createConditionalBox(condition: string, content: Paragraph[]): Paragraph[] {
  return [
    new Paragraph({
      children: [
        createTextRun(condition, { bold: true, color: COLORS.conditionalBorder, size: 9 }),
      ],
      shading: {
        type: ShadingType.SOLID,
        color: COLORS.conditionalBg,
        fill: COLORS.conditionalBg,
      },
      spacing: { before: 100, after: 50 },
      indent: { left: 200 },
    }),
    ...content.map(p => new Paragraph({
      ...p,
      indent: { left: 300 },
    })),
  ];
}

// ==================== HELPER: Create Simple Table ====================
function createSimpleTable(headers: string[], rows: number): Table {
  const headerCells = headers.map(h => new TableCell({
    children: [new Paragraph({
      children: [createTextRun(h, { bold: true, color: COLORS.white, size: 9 })],
      alignment: AlignmentType.CENTER,
    })],
    shading: { type: ShadingType.SOLID, color: COLORS.saffron, fill: COLORS.saffron },
  }));
  
  const bodyRows: TableRow[] = [];
  for (let i = 0; i < rows; i++) {
    const cells = headers.map(() => new TableCell({
      children: [new Paragraph({ children: [createTextRun('', { size: 9 })] })],
      shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: COLORS.cardBg, fill: COLORS.cardBg } : undefined,
    }));
    bodyRows.push(new TableRow({ children: cells }));
  }
  
  return new Table({
    rows: [
      new TableRow({ children: headerCells }),
      ...bodyRows,
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ==================== MAIN: Generate Blank Form Word Document ====================
export async function generateBlankFormWord(): Promise<Blob> {
  const doc = new Document({
    sections: [
      // ==================== COVER PAGE ====================
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              createTextRun('SPORTS AUTHORITY OF INDIA', { bold: true, color: COLORS.navyBlue, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              createTextRun('Nurturing Talent, Measuring Excellence - STC Profile', { color: COLORS.saffron, size: 14 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Instructions
          new Paragraph({
            children: [createTextRun('INSTRUCTIONS', { bold: true, color: COLORS.navyBlue, size: 12 })],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [createTextRun('1. Fill all sections completely and accurately.', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('2. Use BLOCK LETTERS for handwritten entries.', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('3. Tick the appropriate checkboxes where applicable.', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('4. For numerical fields, use whole numbers unless specified.', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('5. If any section is not applicable, write "N/A".', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('6. Attach supporting documents where requested.', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('7. Get form signed by the Centre In-Charge.', { size: 10 })], spacing: { after: 200 } }),
          
          // Important Notes
          new Paragraph({
            children: [createTextRun('IMPORTANT NOTES', { bold: true, color: COLORS.conditionalBorder, size: 11 })],
            shading: { type: ShadingType.SOLID, color: COLORS.conditionalBg, fill: COLORS.conditionalBg },
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [createTextRun('- Data should be current unless otherwise specified.', { size: 10 })],
            shading: { type: ShadingType.SOLID, color: COLORS.conditionalBg, fill: COLORS.conditionalBg },
          }),
          new Paragraph({
            children: [createTextRun('- Use sanctioned strength as per official records.', { size: 10 })],
            shading: { type: ShadingType.SOLID, color: COLORS.conditionalBg, fill: COLORS.conditionalBg },
            spacing: { after: 300 },
          }),
          
          // Table of Contents
          new Paragraph({
            children: [createTextRun('TABLE OF CONTENTS', { bold: true, color: COLORS.navyBlue, size: 12 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [createTextRun('1. Centre Identity & Status', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('2. Disciplines & Athlete Strength', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('3. Infrastructure & Field of Play', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('4. Hostel & Amenities', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('5. Human Resources', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('6. Equipment & Strength & Conditioning', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('7. Talent Identification & Competitions', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('8. Vision for STC', { size: 10 })] }),
          new Paragraph({ children: [createTextRun('9. Attachments & Declaration', { size: 10 })] }),
          
          // Page break
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 1 ====================
          createSectionTitle(1, 'Centre Identity & Status'),
          
          createCardTitle('Card 1.1: Basic Identity'),
          createTextField('STC Name'),
          createTextField('State'),
          createTextField('Region/RC'),
          createTextField('District'),
          createTextField('Year of Inclusion in Scheme'),
          
          createCardTitle('Card 1.2: Operational Status'),
          createCheckboxRow('Current Status', ['Operational', 'Kept in Abeyance']),
          ...createConditionalBox('Complete if Kept in Abeyance:', [
            createTextField('Abeyance Since Date (DD/MM/YYYY)'),
            createCheckboxRow('Reasons', ['Infrastructure', 'Coach Vacancy', 'Hostel', 'Safety', 'Funding', 'Admin', 'Other']),
          ]),
          
          createCardTitle('Card 1.3: Centre In-Charge Details'),
          createTextField('CIC Name'),
          createTextField('Designation'),
          createTextField('Posted as CIC Since'),
          
          createCardTitle('Card 1.4: Geo Coordinates'),
          createTextField('Latitude'),
          createTextField('Longitude'),
          
          createCardTitle('Card 1.5: Address'),
          ...createTextArea('Full Address:', 2),
          createTextField('District'),
          createTextField('Pin Code'),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 2 ====================
          createSectionTitle(2, 'Disciplines & Athlete Strength'),
          
          createCardTitle('Card 2.1: Discipline-wise Athlete Strength'),
          createSimpleTable(['#', 'Discipline', 'San.Res.B', 'San.Res.G', 'San.NR.B', 'San.NR.G', 'Ex.Res.B', 'Ex.Res.G', 'Ex.NR.B', 'Ex.NR.G', 'Vacancy'], 10),
          
          createCardTitle('Card 2.2: Previously Operational Disciplines'),
          createCheckboxRow('Had previous disciplines discontinued', ['Yes', 'No']),
          createSimpleTable(['Discipline', 'From Year', 'To Year', 'Residential?', 'Non-Res?', 'Reason'], 3),
          
          createCardTitle('Card 2.3: New Discipline Suggestions'),
          ...createTextArea('Suggestions for new disciplines:', 2),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 3 ====================
          createSectionTitle(3, 'Infrastructure & Field of Play'),
          
          createCardTitle('Card 3.1: Land Area & Ownership'),
          createTextField('Total Land Area (Acres)'),
          createCheckboxRow('Land Ownership', ['Owned by SAI', 'Lease', 'Shared with Partner']),
          ...createConditionalBox('If Lease or Shared:', [
            createCheckboxRow('MOU Signed', ['Yes', 'No']),
            createTextField('Tenure (Years)'),
            createTextField('Renewal Due Year'),
          ]),
          
          createCardTitle('Card 3.2: Discipline-wise Field of Play'),
          createSimpleTable(['Discipline', 'Exclusive?', 'FoP Type', 'Year Built', 'Condition', 'Status'], 8),
          
          createCardTitle('Card 3.3: Non-Sanctioned FoP'),
          createCheckboxRow('Has Non-Sanctioned FoP', ['Yes', 'No']),
          createSimpleTable(['Sport/Activity', 'Indoor/Outdoor', 'Condition', 'Consider Sanction?', 'Notes'], 3),
          
          createCardTitle('Card 3.4: General Facilities'),
          createCheckboxRow('Warm-up Area Available', ['Yes', 'No']),
          createTextField('Warm-up Area Description'),
          ...createTextArea('S&C / Gym Description:', 2),
          createCheckboxRow('Condition', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation']),
          
          createCardTitle('Card 3.5: Administrative Block'),
          createCheckboxRow('Admin Block Available', ['Yes', 'No']),
          createTextField('Number of Floors'),
          createTextField('Area (sqft)'),
          createCheckboxRow('Condition', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation']),
          createCheckboxRow('Internet Connectivity', ['Broadband', '4G/Mobile', 'Limited', 'None']),
          
          createCardTitle('Card 3.6: Expansion & Environment'),
          createCheckboxRow('Surplus Land for Expansion', ['Yes', 'No']),
          createTextField('If Yes - Acres'),
          createCheckboxRow('Weather Impacts Training', ['Yes', 'No']),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 4 ====================
          createSectionTitle(4, 'Hostel & Amenities'),
          
          createCardTitle('Card 4.1: Hostel Availability'),
          createCheckboxRow('Hostel Facility Available', ['Yes', 'No']),
          ...createConditionalBox('If NO Hostel:', [
            createTextField('Alternative residential arrangement'),
          ]),
          
          createCardTitle('Card 4.2: Building Details'),
          createTextField('Building Construction Year'),
          createTextField('Number of Floors'),
          
          createCardTitle('Card 4.3: Capacity & Room Details'),
          createCheckboxRow('Hostel Type', ['Rooms', 'Dormitory', 'Mixed']),
          createTextField('Total Bed Capacity'),
          createTextField('Current Occupancy'),
          createTextField('Male Beds'),
          createTextField('Female Beds'),
          createCheckboxRow('Gender Segregation', ['Yes', 'No']),
          
          createCardTitle('Card 4.4: Amenities'),
          createCheckboxRow('Available', ['TV Room', 'Reading Room', 'Recreation', 'Laundry', 'Wi-Fi', 'AC', 'Fans']),
          createCheckboxRow('Water Supply', ['Municipal', 'Borewell', 'Tanker', 'Mixed']),
          createCheckboxRow('Power Backup', ['Yes', 'No']),
          createCheckboxRow('Fire Safety', ['Yes', 'No']),
          
          createCardTitle('Card 4.5: Toilet & Sanitation'),
          createCheckboxRow('Toilet Type', ['Western', 'Indian', 'Both']),
          createTextField('Functional Toilets Count'),
          createCheckboxRow('Toilets Sufficient', ['Yes', 'No']),
          
          createCardTitle('Card 4.6: Dining & Mess'),
          createCheckboxRow('Mess Operator', ['SAI', 'Outsourced']),
          createTextField('Dining Seating Capacity'),
          createCheckboxRow('Dining Area Quality', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation']),
          
          createCardTitle('Card 4.7: Overall Hostel Quality'),
          createCheckboxRow('Overall Quality', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation']),
          createCheckboxRow('Improvement Needs', ['Beds', 'Plumbing', 'Electrical', 'Painting', 'Flooring', 'Other']),
          
          createCardTitle('Card 4.8: New Hostel Requirement'),
          createCheckboxRow('New Hostel Needed', ['Yes', 'No']),
          createCheckboxRow('Land Available', ['Yes', 'No']),
          createTextField('Beds Needed'),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 5 ====================
          createSectionTitle(5, 'Human Resources'),
          
          createCardTitle('Card 5.1: Coaching Staff'),
          createTextField('Total Number of Coaches'),
          new Paragraph({
            children: [createTextRun('Formula: Total Athletes / Total Coaches = Coach:Athlete Ratio', { size: 9, italic: true, color: COLORS.textMuted })],
            spacing: { before: 50, after: 100 },
          }),
          createSimpleTable(['#', 'Name', 'Designation', 'Sport', 'Employment', 'Posted Since', 'Last Training', 'Course Level'], 10),
          
          createCardTitle('Card 5.2: Administrative Staff'),
          createSimpleTable(['#', 'Name', 'Designation', 'Posted Since', 'Responsibilities'], 5),
          
          createCardTitle('Card 5.3: Groundsmen & Support Staff'),
          createTextField('Total Groundsmen'),
          createTextField('Total Support Staff'),
          ...createTextArea('Notes on staffing adequacy:', 2),
          
          createCardTitle('Card 5.4: Security Staff'),
          createCheckboxRow('Security Provider', ['SAI Staff', 'Outsourced', 'None']),
          createTextField('Number of Security Personnel'),
          createCheckboxRow('Security Adequate', ['Yes', 'No']),
          
          createCardTitle('Card 5.5: Staff Awareness'),
          createCheckboxRow('Sports Science Awareness', ['High', 'Medium', 'Low', 'None']),
          createCheckboxRow('Nutrition Planning', ['High', 'Medium', 'Low', 'None']),
          createCheckboxRow('Anti-Doping Awareness', ['High', 'Medium', 'Low', 'None']),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 6 ====================
          createSectionTitle(6, 'Equipment & Strength & Conditioning'),
          
          createCardTitle('Card 6.1: Equipment Overview'),
          createCheckboxRow('Overall Equipment Quality (1-5)', ['1', '2', '3', '4', '5']),
          createCheckboxRow('Equipment Age', ['New', '0-2 yrs', '3-5 yrs', '>5 yrs', 'Mixed']),
          createTextField('Procurement Year'),
          
          createCardTitle('Card 6.2: Discipline-wise Equipment'),
          createSimpleTable(['Discipline', 'Equipment Description', 'Adequacy', 'Utilization', 'Barriers'], 6),
          
          createCardTitle('Card 6.3: Equipment Upgrade Needs'),
          createCheckboxRow('Needs', ['Replace existing', 'Repair existing', 'Add new', 'Other']),
          
          createCardTitle('Card 6.4: Equipment Gap Items'),
          createSimpleTable(['#', 'Discipline', 'Item Description', 'Qty Needed', 'Priority'], 3),
          
          createCardTitle('Card 6.5: S&C Setup'),
          createCheckboxRow('S&C Setup Level', ['Comprehensive', 'Basic', 'Minimal', 'None']),
          ...createTextArea('S&C Description:', 2),
          createCheckboxRow('Equipment Categories', ['Racks', 'Free weights', 'Platforms', 'Cardio', 'Plyo', 'Mobility', 'Testing']),
          createCheckboxRow('S&C Condition', ['Excellent', 'Good', 'Minor Repair', 'Major Renovation']),
          createCheckboxRow('Structured Program', ['Yes', 'No']),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 7 ====================
          createSectionTitle(7, 'Talent Identification & Competitions'),
          
          createCardTitle('Card 7.1: Athlete Origin (Summary)'),
          createSimpleTable(['Local Athletes', 'Other State Athletes', 'Total'], 1),
          
          createCardTitle('Card 7.2: Athlete Origin by Discipline'),
          createSimpleTable(['Discipline', 'Local', 'Other State', 'Total'], 6),
          
          createCardTitle('Card 7.3: Selection Trials'),
          createCheckboxRow('Sufficient Publicity', ['Yes', 'No']),
          createCheckboxRow('Methods', ['School outreach', 'District office', 'Social media', 'Newspapers', 'Federations', 'Clubs']),
          createCheckboxRow('Good Turnout', ['Yes', 'No']),
          
          createCardTitle('Card 7.4: Competition Participation'),
          createSimpleTable(['Discipline', 'Level', '2025-26 Participants', '2025-26 Medals', '2020-24 Participants', '2020-24 Medals'], 9),
          
          createCardTitle('Card 7.5: Notable Achievements'),
          ...createTextArea('List notable achievements:', 4),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 8 ====================
          createSectionTitle(8, 'Vision for STC'),
          
          createCardTitle('Card 8.1: Key Strengths (Top 3)'),
          createTextField('1'),
          createTextField('2'),
          createTextField('3'),
          
          createCardTitle('Card 8.2: Critical Challenges (Top 3)'),
          createTextField('1'),
          createTextField('2'),
          createTextField('3'),
          
          createCardTitle('Card 8.3: Vision Statement'),
          ...createTextArea('Vision for the STC in the next 5 years:', 3),
          
          createCardTitle('Card 8.4: Strategic Roadmap'),
          new Paragraph({ children: [createTextRun('Short-Term Actions (6 Months - 1 Year):', { bold: true, size: 10 })] }),
          createTextField('1'),
          createTextField('2'),
          createTextField('3'),
          new Paragraph({ children: [createTextRun('Medium-Term Suggestions (1-3 Years):', { bold: true, size: 10 })] }),
          createTextField('1'),
          createTextField('2'),
          createTextField('3'),
          new Paragraph({ children: [createTextRun('Long-Term Suggestions (3-5 Years):', { bold: true, size: 10 })] }),
          createTextField('1'),
          createTextField('2'),
          createTextField('3'),
          
          createCardTitle('Card 8.5: NCOE Upgrade Assessment'),
          createCheckboxRow('Fit for NCOE upgrade', ['Yes', 'No', 'Not Sure']),
          ...createTextArea('Justification / Explanation:', 3),
          
          createCardTitle('Card 8.6: Additional Comments'),
          ...createTextArea('Any other comments:', 4),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // ==================== SECTION 9 ====================
          createSectionTitle(9, 'Attachments & Declaration'),
          
          new Paragraph({
            children: [createTextRun('ATTACHMENT INSTRUCTIONS', { bold: true, color: COLORS.indiaGreen, size: 10 })],
            shading: { type: ShadingType.SOLID, color: COLORS.cardBg, fill: COLORS.cardBg },
            spacing: { before: 100, after: 50 },
          }),
          new Paragraph({
            children: [createTextRun('Please attach physical copies of documents and label them clearly.', { size: 9 })],
            shading: { type: ShadingType.SOLID, color: COLORS.cardBg, fill: COLORS.cardBg },
            spacing: { after: 200 },
          }),
          
          createCardTitle('Recommended Attachments Checklist'),
          createCheckboxRow('Attachments', ['Facility Photos', 'FoP Photos', 'Hostel Photos', 'Equipment Photos']),
          createCheckboxRow('Documents', ['MoU/Agreements', 'Certificates', 'Equipment Inventory']),
          
          createCardTitle('Attachment Log'),
          createSimpleTable(['#', 'Category', 'Discipline', 'Description', 'Attached?'], 4),
          
          createCardTitle('Respondent Information'),
          createTextField('Respondent Name'),
          createTextField('Designation/Role'),
          createTextField('Mobile Number'),
          createTextField('Email Address'),
          
          new Paragraph({
            children: [createTextRun('DECLARATION', { bold: true, color: COLORS.navyBlue, size: 11 })],
            shading: { type: ShadingType.SOLID, color: COLORS.conditionalBg, fill: COLORS.conditionalBg },
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [createTextRun('I hereby certify that the information provided in this form is accurate and complete to the best of my knowledge. I understand that this data will be used for planning and assessment purposes by the Sports Authority of India.', { size: 9 })],
            shading: { type: ShadingType.SOLID, color: COLORS.conditionalBg, fill: COLORS.conditionalBg },
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              createTextRun('Signature of Respondent: _____________   ', { size: 9 }),
              createTextRun('Signature of CIC: _____________   ', { size: 9 }),
              createTextRun('Date: _____________', { size: 9 }),
            ],
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });
  
  return await Packer.toBlob(doc);
}

export async function downloadBlankFormWord(): Promise<void> {
  const blob = await generateBlankFormWord();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'STC_Profile_Form.docx';
  link.click();
  URL.revokeObjectURL(url);
}
