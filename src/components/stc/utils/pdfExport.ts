import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { 
  FormData, 
  RespondentData, 
  DisciplineStrength,
  CoachRoster,
  GroundsmanRoster,
  AdminRoster,
  DisciplineFOPDetails,
  NonSanctionedFOP,
  DisciplineEquipmentDetail,
  EquipmentGap,
  DisciplineAthleteOrigin,
  DisciplineCompetitionData,
  AttachmentFile,
  VisionData
} from './formConfig';

interface ExportData {
  formData: FormData;
  respondent: RespondentData;
  centreName: string;
  centreId: string;
  disciplines: string[];
}

// SAI brand colors
const COLORS = {
  primary: [41, 98, 255] as [number, number, number],
  secondary: [59, 130, 246] as [number, number, number],
  accent: [16, 185, 129] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  light: [243, 244, 246] as [number, number, number],
};

export async function exportFormToPDF(data: ExportData): Promise<void> {
  const { formData, respondent, centreName, centreId } = data;
  // Format centre name with STC prefix in uppercase for professional look
  const formattedCentreName = centreName ? `STC ${centreName.toUpperCase()}` : 'STC';
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  
  // ============= HELPER FUNCTIONS =============
  
  const checkPageBreak = (requiredSpace: number = 30) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return 'Not provided';
    if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None';
    return String(value);
  };

  const formatRating = (rating: number | undefined, maxRating: number = 5): string => {
    if (rating === undefined || rating === null) return 'Not rated';
    return `${'★'.repeat(rating)}${'☆'.repeat(maxRating - rating)} (${rating}/${maxRating})`;
  };

  const addSectionHeader = (title: string, sectionNumber?: number) => {
    checkPageBreak(45);
    yPos += 5;
    doc.setFillColor(...COLORS.primary);
    doc.rect(14, yPos - 6, pageWidth - 28, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const headerText = sectionNumber ? `Section ${sectionNumber}: ${title}` : title;
    doc.text(headerText, 18, yPos + 1);
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
  };

  const addSubSectionHeader = (title: string) => {
    checkPageBreak(25);
    yPos += 3;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.secondary);
    doc.text(title, 14, yPos);
    yPos += 2;
    doc.setDrawColor(...COLORS.secondary);
    doc.line(14, yPos, 14 + doc.getTextWidth(title), yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
  };

  const addField = (label: string, value: unknown, indent: number = 0) => {
    checkPageBreak(12);
    const displayValue = formatValue(value);
    const xPos = 14 + indent;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(`${label}:`, xPos, yPos);
    doc.setFont('helvetica', 'normal');
    
    const labelWidth = doc.getTextWidth(`${label}: `);
    const maxWidth = pageWidth - 28 - labelWidth - indent;
    const lines = doc.splitTextToSize(displayValue, maxWidth);
    
    if (displayValue.startsWith('✓')) {
      doc.setTextColor(...COLORS.accent);
    } else if (displayValue.startsWith('✗')) {
      doc.setTextColor(...COLORS.muted);
    } else {
      doc.setTextColor(...COLORS.text);
    }
    
    doc.text(lines, xPos + labelWidth, yPos);
    yPos += lines.length * 5 + 3;
    doc.setTextColor(...COLORS.text);
  };

  const addNote = (text: string) => {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'italic');
    const lines = doc.splitTextToSize(text, pageWidth - 32);
    doc.text(lines, 18, yPos);
    yPos += lines.length * 4 + 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
  };

  // ============= COVER PAGE =============
  
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('STC Data Collection Report', pageWidth / 2, 40, { align: 'center' });
  
  // Centre name
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.text(centreName, pageWidth / 2, 55, { align: 'center' });
  
  // Meta info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  doc.text(`Centre ID: ${centreId}`, pageWidth / 2, 65, { align: 'center' });
  doc.text(`Assessment Year: ${respondent.assessment_year}`, pageWidth / 2, 72, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, pageWidth / 2, 79, { align: 'center' });
  
  // Quick Stats Box
  yPos = 95;
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(14, yPos, pageWidth - 28, 70, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Summary Statistics', pageWidth / 2, yPos + 10, { align: 'center' });
  
  yPos += 18;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  
  const totalSanctioned = formData.disciplines.reduce((sum, d) => 
    sum + d.sanctioned_res_boys + d.sanctioned_res_girls + d.sanctioned_nonres_boys + d.sanctioned_nonres_girls, 0);
  const totalExisting = formData.disciplines.reduce((sum, d) => 
    sum + d.existing_res_boys + d.existing_res_girls + d.existing_nonres_boys + d.existing_nonres_girls, 0);
  const totalResidential = formData.disciplines.reduce((sum, d) => 
    sum + d.existing_res_boys + d.existing_res_girls, 0);
  const totalNonResidential = formData.disciplines.reduce((sum, d) => 
    sum + d.existing_nonres_boys + d.existing_nonres_girls, 0);
  
  const statsCol1X = 25;
  const statsCol2X = pageWidth / 2 + 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`• Disciplines: ${formData.disciplines.length}`, statsCol1X, yPos);
  doc.text(`• Sanctioned Athletes: ${totalSanctioned}`, statsCol2X, yPos);
  yPos += 7;
  doc.text(`• Existing Athletes: ${totalExisting}`, statsCol1X, yPos);
  doc.text(`• Residential: ${totalResidential}`, statsCol2X, yPos);
  yPos += 7;
  doc.text(`• Non-Residential: ${totalNonResidential}`, statsCol1X, yPos);
  doc.text(`• Hostel: ${formData.hostel.hostel_available ? `Available (${formData.hostel.hostel_bed_capacity || 'N/A'} beds)` : 'Not Available'}`, statsCol2X, yPos);
  yPos += 7;
  doc.text(`• Coaches: ${formData.staff.coach_count_total || 0}`, statsCol1X, yPos);
  doc.text(`• Admin Staff: ${formData.staff.admin_staff_count_total || 0}`, statsCol2X, yPos);
  yPos += 7;
  doc.text(`• Equipment Quality: ${formatRating(formData.equipment.overall_equipment_quality_rating)}`, statsCol1X, yPos);
  doc.text(`• Status: ${formData.core.operational_status || 'Unknown'}`, statsCol2X, yPos);
  
  // Table of Contents
  yPos = 185;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Contents', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  const sections = [
    '1. Respondent Information',
    '2. Centre Identity & Status',
    '3. Disciplines & Athlete Strength',
    '4. Infrastructure & FoP',
    '5. Hostel & Amenities',
    '6. Human Resources',
    '7. Equipment & S&C',
    '8. Talent ID & Competitions',
    '9. Vision for STC',
    '10. Attachments'
  ];
  sections.forEach(s => {
    doc.text(`• ${s}`, 18, yPos);
    yPos += 6;
  });

  // ============= SECTION 1: RESPONDENT INFORMATION =============
  doc.addPage();
  yPos = 20;
  
  addSectionHeader('Respondent Information', 1);
  addField('Name', respondent.respondent_name);
  addField('Role', respondent.respondent_role);
  addField('Mobile', respondent.respondent_mobile);
  addField('Email', respondent.respondent_email);
  addField('Assessment Year', respondent.assessment_year);
  addField('Data Confidence Rating', formatRating(respondent.data_confidence_rating));
  addField('Consent to Accuracy', respondent.consent_accuracy);
  addField('Form Version', respondent.form_version);
  
  // ============= SECTION 2: CENTRE IDENTITY =============
  yPos += 5;
  addSectionHeader('Centre Identity & Status', 2);
  addField('STC Name', formattedCentreName);
  addField('State', formData.core.state);
  addField('Regional Centre', formData.core.rc_name);
  addField('Operational Status', formData.core.operational_status);
  
  if (formData.core.operational_status === 'Abeyance' || formData.core.operational_status === 'Non-Operational') {
    addField('Abeyance Since', formData.core.abeyance_since_date);
    addField('Abeyance Reasons', formData.core.abeyance_reasons);
    addField('Abeyance Notes', formData.core.abeyance_notes);
  }
  
  addField('Year of Inclusion', formData.core.year_inclusion);
  
  addSubSectionHeader('Centre In Charge (CIC)');
  addField('CIC Name', formData.core.cic_name);
  addField('CIC Designation', formData.core.cic_designation);
  addField('CIC Posted Since', formData.core.cic_posted_since);
  
  addSubSectionHeader('Location');
  addField('District', formData.core.district);
  addField('Pincode', formData.core.pincode);
  addField('Address', formData.core.address_line);
  if (formData.core.latitude && formData.core.longitude) {
    addField('Coordinates', `${formData.core.latitude}, ${formData.core.longitude}`);
  }

  // ============= SECTION 3: DISCIPLINES =============
  yPos += 5;
  addSectionHeader('Disciplines & Athlete Strength', 3);
  
  if (formData.disciplines.length > 0) {
    // Detailed discipline table
    checkPageBreak(60);
    
    const disciplineTableData = formData.disciplines.map((d: DisciplineStrength) => {
      const sanctionedTotal = d.sanctioned_res_boys + d.sanctioned_res_girls + d.sanctioned_nonres_boys + d.sanctioned_nonres_girls;
      const existingTotal = d.existing_res_boys + d.existing_res_girls + d.existing_nonres_boys + d.existing_nonres_girls;
      const variance = existingTotal - sanctionedTotal;
      
      return [
        d.discipline_name || d.discipline_code,
        `${d.sanctioned_res_boys}/${d.sanctioned_res_girls}`,
        `${d.sanctioned_nonres_boys}/${d.sanctioned_nonres_girls}`,
        sanctionedTotal.toString(),
        `${d.existing_res_boys}/${d.existing_res_girls}`,
        `${d.existing_nonres_boys}/${d.existing_nonres_girls}`,
        existingTotal.toString(),
        variance >= 0 ? `+${variance}` : variance.toString(),
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'San Res (B/G)', 'San NR (B/G)', 'San Total', 'Ex Res (B/G)', 'Ex NR (B/G)', 'Ex Total', 'Variance']],
      body: disciplineTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 35 },
        7: { fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
    
    // Discipline details
    formData.disciplines.forEach((d: DisciplineStrength) => {
      if (d.discipline_note || d.catchment_area || d.facility_availability_status || d.age_group) {
        addSubSectionHeader(d.discipline_name || d.discipline_code);
        if (d.age_group) addField('Age Group', d.age_group, 4);
        if (d.catchment_area) addField('Catchment Area', d.catchment_area, 4);
        if (d.facility_availability_status) addField('Facility Status', d.facility_availability_status, 4);
        if (d.fop_primary_type) addField('FoP Type', d.fop_primary_type, 4);
        if (d.fop_condition_rating) addField('FoP Condition', formatRating(d.fop_condition_rating), 4);
        if (d.equipment_adequacy_status) addField('Equipment Adequacy', d.equipment_adequacy_status, 4);
        if (d.discipline_note) addField('Notes', d.discipline_note, 4);
      }
    });
  } else {
    addField('Disciplines', 'No disciplines configured');
  }
  
  // Previous disciplines
  if (formData.had_previous_disciplines && formData.previous_disciplines?.length) {
    addSubSectionHeader('Previously Operational Disciplines');
    formData.previous_disciplines.forEach((pd, index) => {
      addField(`${index + 1}. ${pd.discipline_name}`, 
        `${pd.years_operational_from || '?'}-${pd.years_operational_to || '?'} | Res: ${pd.was_residential ? 'Yes' : 'No'}, NR: ${pd.was_nonresidential ? 'Yes' : 'No'} | Reason: ${pd.reason_discontinued || 'Not specified'}`);
    });
  }
  
  if (formData.new_discipline_suggestions) {
    addField('New Discipline Suggestions', formData.new_discipline_suggestions);
  }

  // ============= SECTION 4: INFRASTRUCTURE =============
  yPos += 5;
  addSectionHeader('Infrastructure & FoP', 4);
  
  addSubSectionHeader('Land & Ownership');
  addField('Land Area (acres)', formData.infrastructure.land?.land_area_acres);
  addField('Land Ownership', formData.infrastructure.land?.land_ownership);
  
  if (formData.infrastructure.land?.land_ownership !== 'Owned by SAI') {
    addField('MOU Signed', formData.infrastructure.land?.mou_signed);
    if (formData.infrastructure.land?.mou_signed) {
      addField('MOU Tenure (years)', formData.infrastructure.land?.mou_tenure_years, 4);
      addField('MOU Renewal Year', formData.infrastructure.land?.mou_renewal_year, 4);
    } else {
      addField('MOU Not Signed Reason', formData.infrastructure.land?.mou_not_signed_reason, 4);
    }
  }
  
  // Discipline-wise FoP
  if (formData.infrastructure.discipline_fops?.length) {
    addSubSectionHeader('Discipline-wise Field of Play');
    
    const fopTableData = formData.infrastructure.discipline_fops.map((fop: DisciplineFOPDetails) => [
      fop.discipline_name || fop.discipline_code,
      fop.fop_exclusive_to_sai ? 'Exclusive' : 'Shared',
      fop.fop_type || 'N/A',
      fop.fop_condition || 'N/A',
      fop.fop_construction_year?.toString() || 'N/A',
      fop.fop_renovation_status || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'Exclusive?', 'Type', 'Condition', 'Built', 'Renovation']],
      body: fopTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
    
    // Details for non-exclusive FoPs
    formData.infrastructure.discipline_fops.filter(f => !f.fop_exclusive_to_sai).forEach((fop: DisciplineFOPDetails) => {
      addNote(`${fop.discipline_name}: Owned by ${fop.fop_owned_by || 'N/A'}, ${fop.fop_distance_km || 'N/A'} km away, Travel: ${fop.fop_travel_mode || 'N/A'}`);
    });
  }
  
  // Non-sanctioned FOPs
  if (formData.infrastructure.has_non_sanctioned_fop && formData.infrastructure.non_sanctioned_fops?.length) {
    addSubSectionHeader('Non-Sanctioned FOPs');
    formData.infrastructure.non_sanctioned_fops.forEach((fop: NonSanctionedFOP, index) => {
      addField(`${index + 1}. ${fop.sport_name}`, 
        `Condition: ${fop.fop_condition || 'N/A'} | Renovation: ${fop.renovation_status || 'N/A'} | Consider for sanction: ${fop.consider_for_sanction ? 'Yes' : 'No'}`);
      if (fop.notes) addNote(fop.notes);
    });
  }
  
  addSubSectionHeader('General Facilities');
  addField('Warmup Area Available', formData.infrastructure.warmup_area_available);
  if (formData.infrastructure.warmup_area_description) {
    addField('Warmup Area Description', formData.infrastructure.warmup_area_description, 4);
  }
  addField('S&C / Gym Description', formData.infrastructure.snc_gym_description);
  
  // Indoor facilities
  if (formData.infrastructure.indoor_facilities?.has_indoor_facilities) {
    addSubSectionHeader('Indoor Facilities');
    const indoor = formData.infrastructure.indoor_facilities;
    addField('Description', indoor.description);
    addField('Area (sq ft)', indoor.area_sqft);
    addField('Construction Year', indoor.construction_year);
    addField('Condition', indoor.condition);
    addField('Renovation Status', indoor.renovation_status);
  }
  
  // Admin Block
  if (formData.infrastructure.admin_block) {
    addSubSectionHeader('Administrative Block');
    const ab = formData.infrastructure.admin_block;
    addField('Admin Block Available', ab.admin_block_available);
    if (ab.admin_block_available) {
      addField('Description', ab.admin_block_description, 4);
      addField('Number of Floors', ab.admin_block_floors, 4);
      addField('Area (sq ft)', ab.admin_block_area_sqft, 4);
      addField('Construction Year', ab.admin_block_construction_year, 4);
      addField('Condition', ab.admin_block_condition, 4);
      addField('Renovation Status', ab.admin_block_renovation_status, 4);
      addField('Sufficient Space for Staff', ab.sufficient_space_for_staff, 4);
      if (!ab.sufficient_space_for_staff) {
        addField('Insufficiency Note', ab.space_insufficiency_note, 8);
      }
      addField('Separate Accounts Room', ab.has_separate_accounts_room, 4);
      addField('Store Room', ab.has_store_room, 4);
      addField('Meeting Room', ab.has_meeting_room, 4);
      addField('Internet Connectivity', ab.internet_connectivity, 4);
      addField('IT Equipment Adequacy', ab.it_equipment_adequacy, 4);
    }
    if (ab.new_admin_block_needed) {
      addField('New Admin Block Needed', true);
      addField('Justification', ab.new_admin_block_justification, 4);
    }
  }
  
  addSubSectionHeader('Expansion & Environment');
  addField('Surplus Land Available', formData.infrastructure.surplus_land_available);
  if (formData.infrastructure.surplus_land_available) {
    addField('Surplus Land (acres)', formData.infrastructure.surplus_land_acres, 4);
    addField('Potential Use', formData.infrastructure.surplus_land_potential_use, 4);
  }
  addField('Weather Impacts Training', formData.infrastructure.weather_impacts_training);
  if (formData.infrastructure.weather_impacts_training) {
    addField('Weather Impact Description', formData.infrastructure.weather_impact_description, 4);
  }

  // ============= SECTION 5: HOSTEL =============
  yPos += 5;
  addSectionHeader('Hostel & Amenities', 5);
  
  addField('Hostel Available', formData.hostel.hostel_available);
  
  if (!formData.hostel.hostel_available) {
    addField('Residential Arrangement Note', formData.hostel.residential_arrangement_note);
  } else {
    addSubSectionHeader('Building Details');
    addField('Construction Year', formData.hostel.hostel_building_year);
    addField('Number of Floors', formData.hostel.number_of_floors);
    addField('Hostel Type', formData.hostel.hostel_type);
    
    addSubSectionHeader('Capacity');
    addField('Total Bed Capacity', formData.hostel.hostel_bed_capacity);
    addField('Current Occupancy', formData.hostel.current_hostel_occupancy);
    if (formData.hostel.gender_capacity) {
      addField('Male Beds', formData.hostel.gender_capacity.male_beds, 4);
      addField('Female Beds', formData.hostel.gender_capacity.female_beds, 4);
    }
    addField('Number of Rooms', formData.hostel.number_of_rooms);
    addField('Number of Dormitories', formData.hostel.number_of_dormitories);
    
    if (formData.hostel.room_type_breakup) {
      const rtb = formData.hostel.room_type_breakup;
      addSubSectionHeader('Room Type Breakup');
      if (rtb.single_bed_count) addField('Single Bed Rooms', rtb.single_bed_count, 4);
      if (rtb.two_bed_count) addField('Two Bed Rooms', rtb.two_bed_count, 4);
      if (rtb.three_bed_count) addField('Three Bed Rooms', rtb.three_bed_count, 4);
      if (rtb.four_bed_count) addField('Four Bed Rooms', rtb.four_bed_count, 4);
      if (rtb.dormitory_count) addField('Dormitory Rooms', rtb.dormitory_count, 4);
    }
    
    addSubSectionHeader('Gender Segregation');
    addField('Gender Segregation Present', formData.hostel.hostel_gender_segregation_present);
    addField('Segregation Type', formData.hostel.hostel_gender_segregation_type);
    if (formData.hostel.hostel_gender_segregation_note) {
      addField('Segregation Note', formData.hostel.hostel_gender_segregation_note);
    }
    
    addSubSectionHeader('Amenities & Utilities');
    addField('Amenities', formData.hostel.hostel_amenities);
    if (formData.hostel.hostel_amenities_other_note) {
      addField('Other Amenities', formData.hostel.hostel_amenities_other_note, 4);
    }
    addField('Water Supply', formData.hostel.water_supply);
    if (formData.hostel.water_supply_issue_note) {
      addField('Water Supply Issues', formData.hostel.water_supply_issue_note, 4);
    }
    addField('Power Backup', formData.hostel.power_backup_available);
    addField('Fire Safety Equipment', formData.hostel.fire_safety_equipment);
    
    addSubSectionHeader('Toilet & Sanitation');
    addField('Toilet Type', formData.hostel.toilet_type);
    addField('Functional Toilets Count', formData.hostel.functional_toilets_count);
    addField('Toilets Sufficient', formData.hostel.toilets_sufficient);
    if (!formData.hostel.toilets_sufficient) {
      addField('Insufficiency Note', formData.hostel.toilets_insufficiency_note, 4);
    }
    addField('Bathroom Ratio', formData.hostel.bathroom_ratio ? `1:${formData.hostel.bathroom_ratio}` : undefined);
    
    addSubSectionHeader('Dining & Mess');
    addField('Mess Operator', formData.hostel.mess_operator);
    if (formData.hostel.mess_operator === 'Outsourced') {
      addField('Contractor Name', formData.hostel.mess_contractor_name, 4);
    }
    addField('Dining Seating Capacity', formData.hostel.dining_seating_capacity);
    addField('Dining Area Quality', formData.hostel.dining_area_quality);
    
    addSubSectionHeader('Overall Quality');
    addField('Overall Hostel Quality', formData.hostel.overall_hostel_quality);
    addField('Improvement Needs', formData.hostel.hostel_improvement_needs);
    if (formData.hostel.improvement_other_note) {
      addField('Other Improvements', formData.hostel.improvement_other_note, 4);
    }
  }
  
  // New Hostel Requirement
  if (formData.hostel.new_hostel_requirement?.new_hostel_needed) {
    addSubSectionHeader('New Hostel Requirement');
    const nhr = formData.hostel.new_hostel_requirement;
    addField('New Hostel Needed', true);
    addField('Land Available', nhr.land_available_for_new_hostel);
    addField('Land Area (acres)', nhr.land_area_for_new_hostel_acres);
    addField('Beds Needed', nhr.beds_needed);
    addField('Justification', nhr.justification);
  }

  // ============= SECTION 6: HUMAN RESOURCES =============
  yPos += 5;
  addSectionHeader('Human Resources', 6);
  
  addSubSectionHeader('Coaching Staff');
  addField('Total Coaches', formData.staff.coach_count_total);
  
  if (formData.staff.coach_roster?.length) {
    checkPageBreak(50);
    const coachTableData = formData.staff.coach_roster.map((c: CoachRoster) => [
      c.staff_name || 'N/A',
      c.designation || 'N/A',
      c.sport_discipline || 'N/A',
      c.employment_nature || 'N/A',
      c.posted_since_date || 'N/A',
      c.course_level_completed || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Designation', 'Sport', 'Employment', 'Posted Since', 'Course Level']],
      body: coachTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  addSubSectionHeader('Groundsmen');
  addField('Total Groundsmen', formData.staff.groundsmen_count_total);
  
  if (formData.staff.groundsmen_roster?.length) {
    checkPageBreak(40);
    const groundsmenTableData = formData.staff.groundsmen_roster.map((g: GroundsmanRoster) => [
      g.staff_name || 'N/A',
      g.employment_nature || 'N/A',
      g.assigned_fop || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Employment', 'Assigned FoP']],
      body: groundsmenTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  addSubSectionHeader('Administrative Staff');
  addField('Total Admin Staff', formData.staff.admin_staff_count_total);
  
  if (formData.staff.admin_roster?.length) {
    checkPageBreak(40);
    const adminTableData = formData.staff.admin_roster.map((a: AdminRoster) => [
      a.staff_name || 'N/A',
      a.designation || 'N/A',
      a.employment_nature || 'N/A',
      a.posted_since_date || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Designation', 'Employment', 'Posted Since']],
      body: adminTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  addSubSectionHeader('Awareness & Knowledge');
  addField('AMS/NSRS Awareness', formData.staff.ams_nsrs_awareness);
  addField('POCSO/POSH Awareness', formData.staff.pocso_posh_awareness);
  addField('Procurement/Accounting Knowledge', formData.staff.procurement_accounting_knowledge);
  
  addSubSectionHeader('Support Staff');
  addField('Security Staff Count', formData.staff.security_staff_count);

  // ============= SECTION 7: EQUIPMENT =============
  yPos += 5;
  addSectionHeader('Equipment & S&C', 7);
  
  addSubSectionHeader('Sports Equipment Overview');
  addField('Overall Equipment Quality', formatRating(formData.equipment.overall_equipment_quality_rating));
  addField('Equipment Age Category', formData.equipment.equipment_age_category);
  addField('Procurement Year', formData.equipment.equipment_procurement_year);
  addField('Training Equipment Condition', formatRating(formData.equipment.training_equipment_condition_rating));
  addField('Competition Grade Available', formData.equipment.competition_grade_equipment_available);
  addField('Video Analysis System', formData.equipment.video_analysis_system_available);
  
  if (formData.equipment.equipment_upgrade_needs?.length) {
    addField('Upgrade Needs', formData.equipment.equipment_upgrade_needs);
  }
  
  // Discipline-wise Equipment
  if (formData.equipment.discipline_equipment?.length) {
    addSubSectionHeader('Discipline-wise Equipment');
    
    const eqTableData = formData.equipment.discipline_equipment.map((de: DisciplineEquipmentDetail) => [
      de.discipline_name || de.discipline_code,
      de.equipment_description || 'N/A',
      de.equipment_adequacy || 'N/A',
      de.utilization_level || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'Description', 'Adequacy', 'Utilization']],
      body: eqTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9 },
      styles: { fontSize: 8 },
      columnStyles: { 1: { cellWidth: 60 } },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
    
    // Utilization barriers
    formData.equipment.discipline_equipment
      .filter(de => de.utilization_barriers)
      .forEach((de: DisciplineEquipmentDetail) => {
        addNote(`${de.discipline_name} barriers: ${de.utilization_barriers}`);
      });
  }
  
  // Equipment Gaps
  if (formData.equipment.equipment_gaps?.length) {
    addSubSectionHeader('Equipment Gaps');
    
    const gapTableData = formData.equipment.equipment_gaps.map((gap: EquipmentGap) => [
      gap.discipline_code || 'General',
      gap.gap_item_name,
      gap.gap_qty_required?.toString() || 'N/A',
      gap.gap_priority || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'Item/Challenge', 'Qty Required', 'Priority']],
      body: gapTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  // S&C Setup
  addSubSectionHeader('Strength & Conditioning Setup');
  addField('S&C Setup Level', formData.equipment.snc_setup_level);
  addField('S&C Description', formData.equipment.snc_setup_description);
  addField('Equipment Categories', formData.equipment.snc_equipment_categories);
  addField('Equipment Condition', formData.equipment.snc_equipment_condition);
  addField('Structured Program', formData.equipment.snc_structured_program);
  addField('Methodologies Practiced', formData.equipment.snc_methodologies);
  addField('Utilization Level', formData.equipment.snc_utilization_level);
  if (formData.equipment.snc_utilization_level !== 'Fully Utilized' && formData.equipment.snc_utilization_barriers) {
    addField('Utilization Barriers', formData.equipment.snc_utilization_barriers, 4);
  }

  // ============= SECTION 8: TALENT =============
  yPos += 5;
  addSectionHeader('Talent ID & Competitions', 8);
  
  addSubSectionHeader('Athlete Origin (STC Level)');
  addField('Local Athletes Count', formData.talent.local_athletes_count);
  addField('Other State Athletes Count', formData.talent.other_state_athletes_count);
  
  const talentTotal = (formData.talent.local_athletes_count || 0) + (formData.talent.other_state_athletes_count || 0);
  const disciplineTotalExisting = formData.disciplines.reduce((sum, d) => 
    sum + d.existing_res_boys + d.existing_res_girls + d.existing_nonres_boys + d.existing_nonres_girls, 0);
  
  if (talentTotal > 0 && disciplineTotalExisting > 0 && talentTotal !== disciplineTotalExisting) {
    addNote(`⚠️ Mismatch: Section 2 total (${disciplineTotalExisting}) differs from origin total (${talentTotal})`);
  }
  
  if (formData.talent.origin_mismatch_note) {
    addField('Mismatch Explanation', formData.talent.origin_mismatch_note);
  }
  
  // Discipline-wise Origin
  if (formData.talent.discipline_origin?.length) {
    addSubSectionHeader('Discipline-wise Athlete Origin');
    
    const originTableData = formData.talent.discipline_origin.map((o: DisciplineAthleteOrigin) => [
      o.discipline_name || o.discipline_code,
      (o.local_athletes_count || 0).toString(),
      (o.other_state_athletes_count || 0).toString(),
      ((o.local_athletes_count || 0) + (o.other_state_athletes_count || 0)).toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'Local', 'Other State', 'Total']],
      body: originTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  addSubSectionHeader('Selection Trials');
  addField('Sufficient Publicity', formData.talent.trials_sufficient_publicity);
  if (formData.talent.trials_sufficient_publicity) {
    addField('Publicity Methods', formData.talent.trials_publicity_methods, 4);
  }
  addField('Good Turnout at Trials', formData.talent.trials_good_turnout);
  if (!formData.talent.trials_good_turnout && formData.talent.trials_poor_turnout_reasons) {
    addField('Poor Turnout Reasons', formData.talent.trials_poor_turnout_reasons, 4);
  }
  
  // Competition Participation
  if (formData.talent.discipline_competitions?.length) {
    addSubSectionHeader('Competition Participation');
    
    const compTableData = formData.talent.discipline_competitions.map((c: DisciplineCompetitionData) => [
      c.discipline_name || c.discipline_code,
      `${c.state_participants_current || 0}/${c.state_medals_current || 0}`,
      `${c.national_participants_current || 0}/${c.national_medals_current || 0}`,
      `${c.international_participants_current || 0}/${c.international_medals_current || 0}`,
      `${c.state_participants_5yr || 0}/${c.state_medals_5yr || 0}`,
      `${c.national_participants_5yr || 0}/${c.national_medals_5yr || 0}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Discipline', 'State (P/M)', 'National (P/M)', 'Intl (P/M)', '5yr State (P/M)', '5yr National (P/M)']],
      body: compTableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
    addNote('P = Participants, M = Medals');
  }
  
  if (formData.talent.notable_achievements) {
    addSubSectionHeader('Notable Achievements');
    const achievementLines = doc.splitTextToSize(formData.talent.notable_achievements, pageWidth - 32);
    doc.text(achievementLines, 18, yPos);
    yPos += achievementLines.length * 5 + 5;
  }

  // ============= SECTION 9: VISION FOR STC =============
  yPos += 5;
  addSectionHeader(`Vision for ${formattedCentreName}`, 9);
  
  addSubSectionHeader('STC Strengths');
  if (formData.vision?.strengths?.strength_1) addField('Strength 1', formData.vision.strengths.strength_1);
  if (formData.vision?.strengths?.strength_2) addField('Strength 2', formData.vision.strengths.strength_2);
  if (formData.vision?.strengths?.strength_3) addField('Strength 3', formData.vision.strengths.strength_3);
  
  addSubSectionHeader('Critical Challenges');
  if (formData.vision?.challenges?.challenge_1) addField('Challenge 1', formData.vision.challenges.challenge_1);
  if (formData.vision?.challenges?.challenge_2) addField('Challenge 2', formData.vision.challenges.challenge_2);
  if (formData.vision?.challenges?.challenge_3) addField('Challenge 3', formData.vision.challenges.challenge_3);
  
  if (formData.vision?.vision_statement) {
    addSubSectionHeader('Vision Statement');
    checkPageBreak(40);
    const visionLines = doc.splitTextToSize(formData.vision.vision_statement, pageWidth - 32);
    doc.text(visionLines, 18, yPos);
    yPos += visionLines.length * 5 + 5;
  }
  
  // Strategic Roadmap Table
  const hasStrategicSuggestions = 
    formData.vision?.short_term_actions?.point_1 ||
    formData.vision?.medium_term_suggestions?.point_1 ||
    formData.vision?.long_term_suggestions?.point_1;
  
  if (hasStrategicSuggestions) {
    addSubSectionHeader('Strategic Roadmap');
    
    const roadmapData = [
      [
        'Short-Term (6m-1yr)',
        formData.vision?.short_term_actions?.point_1 || '-',
        formData.vision?.short_term_actions?.point_2 || '-',
        formData.vision?.short_term_actions?.point_3 || '-',
      ],
      [
        'Medium-Term (1-3yr)',
        formData.vision?.medium_term_suggestions?.point_1 || '-',
        formData.vision?.medium_term_suggestions?.point_2 || '-',
        formData.vision?.medium_term_suggestions?.point_3 || '-',
      ],
      [
        'Long-Term (3-5yr)',
        formData.vision?.long_term_suggestions?.point_1 || '-',
        formData.vision?.long_term_suggestions?.point_2 || '-',
        formData.vision?.long_term_suggestions?.point_3 || '-',
      ],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Timeframe', 'Suggestion 1', 'Suggestion 2', 'Suggestion 3']],
      body: roadmapData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 50 },
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  addSubSectionHeader('NCOE Upgrade Assessment');
  const ncoeLabels: Record<string, string> = {
    'yes': 'Yes - Ready for upgrade',
    'no': 'No - Not ready at this time',
    'not_sure': 'Potentially - With improvements',
  };
  addField('Fit for NCOE Upgrade', ncoeLabels[formData.vision?.fit_for_ncoe_upgrade || ''] || 'Not assessed');
  if (formData.vision?.ncoe_upgrade_justification) {
    addField('Justification', formData.vision.ncoe_upgrade_justification);
  }
  
  if (formData.vision?.other_comments) {
    addSubSectionHeader('Additional Comments');
    const commentLines = doc.splitTextToSize(formData.vision.other_comments, pageWidth - 32);
    doc.text(commentLines, 18, yPos);
    yPos += commentLines.length * 5 + 5;
  }

  // ============= SECTION 10: ATTACHMENTS =============
  if (formData.attachments.length > 0) {
    yPos += 5;
    addSectionHeader('Attachments', 10);
    addField('Total Attachments', formData.attachments.length);
    
    // Group by file type
    const groupedAttachments: Record<string, AttachmentFile[]> = {};
    formData.attachments.forEach(att => {
      const type = att.file_type || 'Other';
      if (!groupedAttachments[type]) groupedAttachments[type] = [];
      groupedAttachments[type].push(att);
    });
    
    Object.entries(groupedAttachments).forEach(([type, files]) => {
      addSubSectionHeader(type);
      files.forEach((att, index) => {
        const uploadDate = att.uploaded_at ? new Date(att.uploaded_at).toLocaleDateString('en-IN') : 'N/A';
        addField(`${index + 1}. ${att.caption || 'Untitled'}`, `Uploaded: ${uploadDate}${att.discipline_code ? ` | Discipline: ${att.discipline_code}` : ''}`);
      });
    });
  }

  // ============= FOOTER ON ALL PAGES =============
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Page ${i} of ${pageCount} | ${centreName} | Generated: ${new Date().toLocaleString('en-IN')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `STC_Report_${centreId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
