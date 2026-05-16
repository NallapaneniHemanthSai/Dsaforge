import catalog from './catalog.json';

export const sheets = catalog.sheets;
export const problems = catalog.problems;
export const TOTAL_PROBLEMS = problems.length;

export const getProblemById = (id) => problems.find((p) => p.id === id);

export const getProblemTitle = (id) => getProblemById(id)?.title ?? id;

export const getSheetCounts = () => {
  const counts = { all: problems.length };
  sheets.forEach((s) => {
    counts[s.id] = problems.filter((p) => p.sheet === s.id).length;
  });
  return counts;
};

export const getTopicsForSheet = (sheetId) => {
  const filtered = sheetId === 'all' ? problems : problems.filter((p) => p.sheet === sheetId);
  return [...new Set(filtered.map((p) => p.topic))].sort();
};

/** Group problems by section subheading for a sheet */
export const getSectionsForSheet = (sheetId) => {
  const filtered = sheetId === 'all' ? problems : problems.filter((p) => p.sheet === sheetId);
  const map = new Map();
  filtered.forEach((p) => {
    const key = p.section || 'General';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  });
  return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
};

export const getSheetById = (id) => sheets.find((s) => s.id === id);
