import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : null;

    if (!name || !image) {
      return res.status(400).json({ message: "Name and image are required" });
    }

    const category = new Category({ name, image });
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
