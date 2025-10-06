import { parseDataTables } from "../utils/pagination.js";

export function listWithSearch(Model, searchable = ["name","companyName"]) {
  return async (req, res) => {
    const { start, length, search, order } = parseDataTables(req.query);
    const filter = search
      ? { $or: searchable.map(f => ({ [f]: { $regex: search, $options: "i" } })) }
      : {};
    const [rows, total] = await Promise.all([
      Model.find(filter).sort(order).skip(start).limit(length),
      Model.countDocuments(filter)
    ]);
    res.json({ data: rows, recordsTotal: total, recordsFiltered: total });
  };
}

