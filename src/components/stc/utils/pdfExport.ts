import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FormData, RespondentData, DisciplineStrength } from './formConfig';

interface ExportData {
  formData: FormData;
  respondent: RespondentData;
  centreName: string;
  centreId: string;
  disciplines: string[];
}

export async function exportFormToPDF(data: ExportData): Promise<void> {
  const { formData, respondent, centreName, centreId, disciplines } = data;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  
  // Helper function to add page if needed
  const checkPageBreak = (requiredSpace: number = 30) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Helper to add section header
  const addSectionHeader = (title: string) => {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 98, 255);
    doc.text(title, 14, yPos);
    yPos += 8;
    doc.setDrawColor(41, 98, 255);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
  };

  // Helper to add key-value pair
  const addField = (label: string, value: string | number | boolean | undefined | null) => {
    checkPageBreak(10);
    const displayValue = value === undefined || value === null || value === '' 
      ? 'Not provided' 
      : typeof value === 'boolean' 
        ? (value ? 'Yes' : 'No') 
        : String(value);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    
    const labelWidth = doc.getTextWidth(`${label}: `);
    const maxWidth = pageWidth - 28 - labelWidth;
    const lines = doc.splitTextToSize(displayValue, maxWidth);
    doc.text(lines, 14 + labelWidth, yPos);
    yPos += lines.length * 5 + 3;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('STC Data Collection Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(centreName, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Centre ID: ${centreId}`, pageWidth / 2, yPos, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, yPos + 5, { align: 'center' });
  yPos += 20;
  doc.setTextColor(0, 0, 0);

  // Section 1: Respondent Information
  addSectionHeader('1. Respondent Information');
  addField('Name', respondent.respondent_name);
  addField('Role', respondent.respondent_role);
  addField('Mobile', respondent.respondent_mobile);
  addField('Email', respondent.respondent_email);
  addField('Assessment Year', respondent.assessment_year);
  yPos += 5;

  // Section 2: Centre Identity
  addSectionHeader('2. Centre Identity & Status');
  addField('STC Name', formData.core.stc_name);
  addField('State', formData.core.state);
  addField('Regional Centre', formData.core.rc_name);
  addField('Operational Status', formData.core.operational_status);
  addField('Year of Inclusion', formData.core.year_inclusion);
  addField('CIC Name', formData.core.cic_name);
  addField('CIC Designation', formData.core.cic_designation);
  addField('District', formData.core.district);
  addField('Pincode', formData.core.pincode);
  yPos += 5;

  // Section 3: Disciplines & Athlete Strength
  addSectionHeader('3. Disciplines & Athlete Strength');
  
  if (formData.disciplines.length > 0) {
    checkPageBreak(50);
    
    const tableData = formData.disciplines.map((d: DisciplineStrength) => [
      d.discipline_name || d.discipline_code,
      `${d.sanctioned_res_boys + d.sanctioned_res_girls + d.sanctioned_nonres_boys + d.sanctioned_nonres_girls}`,
      `${d.existing_res_boys + d.existing_res_girls + d.existing_nonres_boys + d.existing_nonres_girls}`,
      d.fop_primary_type || 'N/A',
      d.equipment_adequacy_status || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'Sanctioned', 'Existing', 'FoP Type', 'Equipment Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 98, 255], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    addField('Disciplines', 'No disciplines configured');
  }

  // Section 4: Infrastructure
  addSectionHeader('4. Infrastructure');
  addField('Land Area (acres)', formData.infrastructure.land?.land_area_acres);
  addField('Land Ownership', formData.infrastructure.land?.land_ownership);
  addField('MOU Signed', formData.infrastructure.land?.mou_signed);
  addField('Warmup Area Available', formData.infrastructure.warmup_area_available);
  addField('Surplus Land Available', formData.infrastructure.surplus_land_available);
  addField('Surplus Land (acres)', formData.infrastructure.surplus_land_acres);
  
  // Admin Block
  if (formData.infrastructure.admin_block) {
    const ab = formData.infrastructure.admin_block;
    addField('Admin Block Available', ab.admin_block_available);
    addField('Admin Block Condition', ab.admin_block_condition);
    addField('Internet Connectivity', ab.internet_connectivity);
  }
  yPos += 5;

  // Section 5: Hostel Facilities
  addSectionHeader('5. Hostel Facilities');
  addField('Hostel Available', formData.hostel.hostel_available);
  addField('Hostel Type', formData.hostel.hostel_type);
  addField('Total Bed Capacity', formData.hostel.hostel_bed_capacity);
  addField('Current Occupancy', formData.hostel.current_hostel_occupancy);
  addField('Number of Rooms', formData.hostel.number_of_rooms);
  addField('Number of Floors', formData.hostel.number_of_floors);
  addField('Gender Segregation', formData.hostel.hostel_gender_segregation_present);
  addField('Water Supply', formData.hostel.water_supply);
  addField('Power Backup', formData.hostel.power_backup_available);
  addField('Fire Safety Equipment', formData.hostel.fire_safety_equipment);
  addField('Mess Operator', formData.hostel.mess_operator);
  addField('Dining Seating Capacity', formData.hostel.dining_seating_capacity);
  addField('Overall Hostel Quality', formData.hostel.overall_hostel_quality);
  
  if (formData.hostel.hostel_amenities?.length) {
    addField('Amenities', formData.hostel.hostel_amenities.join(', '));
  }
  yPos += 5;

  // Section 6: Human Resources
  addSectionHeader('6. Human Resources');
  addField('Total Coaches', formData.staff.coach_count_total);
  addField('Total Groundsmen', formData.staff.groundsmen_count_total);
  addField('Admin Staff Total', formData.staff.admin_staff_count_total);
  addField('Security Staff Count', formData.staff.security_staff_count);
  addField('AMS/NSRS Awareness', formData.staff.ams_nsrs_awareness);
  addField('POCSO/POSH Awareness', formData.staff.pocso_posh_awareness);
  addField('Procurement/Accounting Knowledge', formData.staff.procurement_accounting_knowledge);
  
  // Coach roster summary
  if (formData.staff.coach_roster?.length) {
    addField('Number of Coach Records', formData.staff.coach_roster.length);
  }
  yPos += 5;

  // Section 7: Equipment
  addSectionHeader('7. Equipment');
  addField('Overall Equipment Quality Rating', formData.equipment.overall_equipment_quality_rating ? `${formData.equipment.overall_equipment_quality_rating}/5` : undefined);
  addField('Equipment Age Category', formData.equipment.equipment_age_category);
  addField('Training Equipment Condition', formData.equipment.training_equipment_condition_rating ? `${formData.equipment.training_equipment_condition_rating}/5` : undefined);
  addField('S&C Setup Level', formData.equipment.snc_setup_level);
  addField('S&C Equipment Condition', formData.equipment.snc_equipment_condition);
  addField('S&C Structured Program', formData.equipment.snc_structured_program);
  addField('S&C Utilization Level', formData.equipment.snc_utilization_level);
  
  if (formData.equipment.equipment_upgrade_needs?.length) {
    addField('Upgrade Needs', formData.equipment.equipment_upgrade_needs.join(', '));
  }
  
  if (formData.equipment.equipment_gaps?.length) {
    checkPageBreak(30);
    addField('Equipment Gaps', `${formData.equipment.equipment_gaps.length} items identified`);
    formData.equipment.equipment_gaps.forEach((gap, index) => {
      addField(`  Gap ${index + 1}`, `${gap.gap_item_name} (Qty: ${gap.gap_qty_required}, Priority: ${gap.gap_priority})`);
    });
  }
  yPos += 5;

  // Section 8: Talent
  addSectionHeader('8. Talent');
  addField('Local Athletes Count', formData.talent.local_athletes_count);
  addField('Other State Athletes Count', formData.talent.other_state_athletes_count);
  addField('Trials Sufficient Publicity', formData.talent.trials_sufficient_publicity);
  addField('Good Turnout at Trials', formData.talent.trials_good_turnout);
  
  if (formData.talent.trials_publicity_methods?.length) {
    addField('Publicity Methods', formData.talent.trials_publicity_methods.join(', '));
  }
  if (formData.talent.trials_poor_turnout_reasons) {
    addField('Poor Turnout Reasons', formData.talent.trials_poor_turnout_reasons);
  }
  if (formData.talent.notable_achievements) {
    addField('Notable Achievements', formData.talent.notable_achievements);
  }
  yPos += 5;

  // Section 9: Attachments
  if (formData.attachments.length > 0) {
    addSectionHeader('9. Attachments');
    addField('Total Attachments', formData.attachments.length);
    formData.attachments.forEach((att, index) => {
      addField(`Attachment ${index + 1}`, `${att.file_type}${att.caption ? ` - ${att.caption}` : ''}`);
    });
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | ${centreName} | Generated on ${new Date().toLocaleString('en-IN')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `STC_Report_${centreId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
