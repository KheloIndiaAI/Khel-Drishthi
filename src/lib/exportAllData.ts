import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";

/** Every public table included in a full portal data export. */
export const ALL_EXPORT_TABLES: string[] = [
  // Core sports
  'sports', 'disciplines', 'events', 'event_overlap', 'eco_categories',
  // Infrastructure
  'centres', 'centre_sport_links', 'regional_centres', 'region_state_mappings',
  // Capacity
  'ncoe_capacity', 'stc_capacity',
  // STC assessment
  'stc_detailed_data', 'stc_discipline_strength', 'stc_competition_summary',
  'stc_equipment_gaps', 'stc_staff_roster',
  // Performance & history
  'olympic_medals', 'olympic_participation', 'olympic_timeline',
  // Collaboration & forms
  'sport_notes', 'form_definitions', 'form_submissions',
  // Admin / access
  'profiles', 'user_roles', 'user_centre_assignments', 'user_region_assignments',
  'user_table_permissions', 'access_requests', 'audit_logs',
];

/** Convert an array of rows to CSV text (quotes escaped, objects JSON-encoded). */
export function rowsToCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\n');
}

/** Fetch every row from a table using 1000-row batching to bypass PostgREST limits. */
export async function fetchAllRows(tableName: string): Promise<Record<string, unknown>[]> {
  const batchSize = 1000;
  const all: Record<string, unknown>[] = [];
  let from = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: batch, error } = await supabase
      .from(tableName as never)
      .select('*')
      .range(from, from + batchSize - 1);
    if (error) throw error;
    if (!batch || batch.length === 0) break;
    all.push(...(batch as Record<string, unknown>[]));
    if (batch.length < batchSize) break;
    from += batchSize;
  }
  return all;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function todayStamp() {
  return new Date().toISOString().split('T')[0];
}

export interface ExportProgress {
  table: string;
  index: number;
  total: number;
}

export interface DataExportResult {
  zip: JSZip;
  counts: Record<string, number>;
  totalRows: number;
  errors: string[];
}

/**
 * Fetch all tables and place their CSVs inside a JSZip instance.
 * Tables that fail are recorded as __ERROR.txt entries instead of aborting.
 */
export async function buildDataExport(
  tables: string[] = ALL_EXPORT_TABLES,
  onProgress?: (p: ExportProgress) => void,
  zip: JSZip = new JSZip(),
): Promise<DataExportResult> {
  const counts: Record<string, number> = {};
  const errors: string[] = [];
  let totalRows = 0;

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    onProgress?.({ table: t, index: i + 1, total: tables.length });
    try {
      const rows = await fetchAllRows(t);
      counts[t] = rows.length;
      totalRows += rows.length;
      zip.file(`data/${t}.csv`, rowsToCSV(rows));
    } catch (err) {
      errors.push(`${t}: ${String(err)}`);
      zip.file(`data/${t}__ERROR.txt`, `Failed to export ${t}: ${String(err)}`);
    }
  }

  const readme = [
    'Khel Drishti — Portal Data Export',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Tables included (rows):',
    ...tables.map(t => `  - ${t}: ${counts[t] !== undefined ? counts[t].toLocaleString() : 'export failed'}`),
    '',
    `Total rows: ${totalRows.toLocaleString()}`,
    errors.length ? `\nErrors:\n${errors.map(e => '  - ' + e).join('\n')}` : '',
    '',
    'All files are UTF-8 CSV with a header row. JSON columns are serialised as JSON strings.',
  ].join('\n');
  zip.file('README.txt', readme);

  return { zip, counts, totalRows, errors };
}
