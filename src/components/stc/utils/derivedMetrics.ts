import type { FormData } from "./formConfig";

export interface DerivedKPIs {
  // Strength totals
  total_sanctioned: number;
  total_existing: number;
  total_vacancies: number;
  total_surplus: number;
  
  // Rates
  overall_utilization_rate: number | null;
  vacancy_rate: number | null;
  residential_pressure: number | null;
  
  // Hostel
  residential_occupancy_rate: number | null;
  
  // Coaches
  coach_athlete_ratio: number | null;
  coach_coverage_ratio: number | null;
  
  // Competitions
  competition_participation_rate: number | null;
  
  // Per-discipline totals
  discipline_totals: Array<{
    discipline_code: string;
    sanctioned_total: number;
    existing_total: number;
    utilization_rate: number | null;
    vacancy_total: number;
    surplus_total: number;
  }>;
}

export function computeDerivedKPIs(formData: FormData, disciplines: string[]): DerivedKPIs {
  // Compute per-discipline totals
  const disciplineTotals = formData.disciplines.map(d => {
    const sanctioned_res_total = (d.sanctioned_res_boys || 0) + (d.sanctioned_res_girls || 0);
    const sanctioned_nonres_total = (d.sanctioned_nonres_boys || 0) + (d.sanctioned_nonres_girls || 0);
    const sanctioned_total = sanctioned_res_total + sanctioned_nonres_total;

    const existing_res_total = (d.existing_res_boys || 0) + (d.existing_res_girls || 0);
    const existing_nonres_total = (d.existing_nonres_boys || 0) + (d.existing_nonres_girls || 0);
    const existing_total = existing_res_total + existing_nonres_total;

    const utilization_rate = sanctioned_total > 0 
      ? existing_total / sanctioned_total 
      : null;

    const vacancy_total = Math.max(0, sanctioned_total - existing_total);
    const surplus_total = Math.max(0, existing_total - sanctioned_total);

    return {
      discipline_code: d.discipline_code,
      sanctioned_total,
      existing_total,
      utilization_rate,
      vacancy_total,
      surplus_total,
    };
  });

  // Aggregate totals
  const total_sanctioned = disciplineTotals.reduce((sum, d) => sum + d.sanctioned_total, 0);
  const total_existing = disciplineTotals.reduce((sum, d) => sum + d.existing_total, 0);
  const total_vacancies = disciplineTotals.reduce((sum, d) => sum + d.vacancy_total, 0);
  const total_surplus = disciplineTotals.reduce((sum, d) => sum + d.surplus_total, 0);

  const overall_utilization_rate = total_sanctioned > 0 
    ? total_existing / total_sanctioned 
    : null;

  const vacancy_rate = total_sanctioned > 0 
    ? total_vacancies / total_sanctioned 
    : null;

  // Residential pressure
  const total_existing_res = formData.disciplines.reduce((sum, d) => 
    sum + (d.existing_res_boys || 0) + (d.existing_res_girls || 0), 0);
  const total_sanctioned_res = formData.disciplines.reduce((sum, d) => 
    sum + (d.sanctioned_res_boys || 0) + (d.sanctioned_res_girls || 0), 0);
  const residential_pressure = total_sanctioned_res > 0 
    ? total_existing_res / total_sanctioned_res 
    : null;

  // Hostel occupancy
  const residential_occupancy_rate = formData.hostel.hostel_bed_capacity && formData.hostel.hostel_bed_capacity > 0
    ? total_existing_res / formData.hostel.hostel_bed_capacity
    : null;

  // Coach ratios
  const coach_athlete_ratio = formData.staff.coach_count_total > 0
    ? total_existing / formData.staff.coach_count_total
    : null;

  const coach_coverage_ratio = disciplines.length > 0 && formData.staff.coach_count_total > 0
    ? formData.staff.coach_count_total / disciplines.length
    : null;

  // Competition participation
  const competition_participation_rate = total_existing > 0 && formData.talent.athletes_participated_count
    ? formData.talent.athletes_participated_count / total_existing
    : null;

  return {
    total_sanctioned,
    total_existing,
    total_vacancies,
    total_surplus,
    overall_utilization_rate,
    vacancy_rate,
    residential_pressure,
    residential_occupancy_rate,
    coach_athlete_ratio,
    coach_coverage_ratio,
    competition_participation_rate,
    discipline_totals: disciplineTotals,
  };
}
