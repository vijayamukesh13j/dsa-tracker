import { Problem } from '../types/problem';

/**
 * Triggers a browser download of text content
 */
export function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Export complete database as JSON
 */
export function exportDatabaseToJson(problems: Problem[]): void {
  const exportPayload = {
    version: 1,
    appName: 'DSA Mastery & Spaced Repetition Tracker',
    exportedAt: new Date().toISOString(),
    totalProblems: problems.length,
    problems,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `dsa_tracker_backup_${dateStr}.json`, 'application/json');
}

/**
 * Escape CSV fields properly
 */
function escapeCsv(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export problems to CSV for Excel / Google Sheets
 */
export function exportProblemsToCsv(problems: Problem[]): void {
  const headers = [
    'ID',
    'Title',
    'Problem Number',
    'URL',
    'Platform',
    'Difficulty',
    'Patterns',
    'Confidence (1-5)',
    'Date First Solved',
    'Last Revision Date',
    'Next Revision Date',
    'Revision Count',
    'Solve Time (Mins)',
    'Time Complexity',
    'Space Complexity',
    'Key Intuition',
    'Mistakes / Edge Cases',
  ];

  const rows = problems.map((p) => [
    escapeCsv(p.id),
    escapeCsv(p.title),
    escapeCsv(p.problemNumber || ''),
    escapeCsv(p.url),
    escapeCsv(p.platform),
    escapeCsv(p.difficulty),
    escapeCsv(p.patterns.join('; ')),
    escapeCsv(p.confidence),
    escapeCsv(p.dateFirstSolved),
    escapeCsv(p.lastRevisionDate),
    escapeCsv(p.nextRevisionDate),
    escapeCsv(p.revisionCount),
    escapeCsv(p.solveTimeMinutes || ''),
    escapeCsv(p.notes?.timeComplexity || ''),
    escapeCsv(p.notes?.spaceComplexity || ''),
    escapeCsv(p.notes?.keyIntuition || ''),
    escapeCsv(p.notes?.mistakes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `dsa_problems_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Parse and validate JSON backup file
 */
export async function parseJsonBackupFile(
  file: File
): Promise<{ success: boolean; problems?: Problem[]; error?: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    let problems: Problem[] = [];
    if (Array.isArray(parsed)) {
      problems = parsed;
    } else if (parsed && Array.isArray(parsed.problems)) {
      problems = parsed.problems;
    } else {
      return { success: false, error: 'File does not contain a valid DSA problems array.' };
    }

    // Basic schema check
    const validProblems = problems.filter((p) => p && typeof p.title === 'string' && p.id);
    if (validProblems.length === 0 && problems.length > 0) {
      return { success: false, error: 'Problem records in file appear corrupted or missing required title/id fields.' };
    }

    return { success: true, problems: validProblems };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message || 'Failed to parse JSON file.' };
  }
}
