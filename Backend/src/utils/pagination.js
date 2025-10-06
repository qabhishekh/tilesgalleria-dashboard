export function parseDataTables(query) {
  const start = parseInt(query.start || 0, 10);
  const length = Math.min(parseInt(query.length || 10, 10), 100);
  const search = (query.search || "").trim();
  const orderField = query["order[field]"] || query.sort || "createdAt";
  const orderDir = (query["order[dir]"] || query.order || "desc").toLowerCase() === "asc" ? 1 : -1;
  return { start, length, search, order: { [orderField]: orderDir } };
}
