import * as categoryService from '../services/category.service';

export const getCategoryTree = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.json({ data: categories });
  } catch (e) {
    next(e);
  }
};

export const getAllCategories = async (req, res, next) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({ data: categories });
    } catch (e) {
      next(e);
    }
  };

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (e) {
    next(e);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ data: updatedCategory });
  } catch (e) {
    next(e);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await categoryService.deleteCategory(req.params.id);
    res.json({ data: deletedCategory });
  } catch (e) {
    next(e);
  }
}; 