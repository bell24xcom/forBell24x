import express from 'express';
import { categories } from '../../src/data/categories/index.js';
import { AICategoryService } from '../../src/services/AICategoryService.js';

export function setupCategoryRoutes(app: express.Application) {
  const router = express.Router();
  const aiService = new AICategoryService(process.env.PERPLEXITY_API_KEY || '');

  // Get all categories
  router.get('/', (req, res) => {
    res.json(categories);
  });

  // Search categories
  router.get('/search', (req, res) => {
    const { query, lang = 'en' } = req.query;
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }

    const searchTerm = query.toString().toLowerCase();
    const results = categories.filter(category => {
      const matchesName = category.name.toLowerCase().includes(searchTerm);
      const matchesDescription = category.description.toLowerCase().includes(searchTerm);
      const matchesSubcategories = category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm)
      );
      return matchesName || matchesDescription || matchesSubcategories;
    });

    res.json({
      success: true,
      data: results
    });
  });

  // Get category by ID
  router.get('/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    res.json(category);
  });

  // Get category by slug
  router.get('/slug/:slug', (req, res) => {
    const slug = req.params.slug;
    const category = categories.find(c => c.slug === slug);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    res.json(category);
  });

  // Get subcategories by category ID
  router.get('/:categoryId/subcategories', (req, res) => {
    const categoryId = req.params.categoryId;
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    res.json(category.subcategories);
  });

  // Get categories with filtering
  router.get('/filter', (req, res) => {
    const { lang = 'en', sortBy = 'name', order = 'asc' } = req.query;
    let filteredCategories = [...categories];

    // Apply sorting
    filteredCategories.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    res.json({
      success: true,
      data: filteredCategories
    });
  });

  // Add new category (admin only)
  router.post('/', async (req, res) => {
    const { name, description, subcategories, icon } = req.body;
    
    if (!name || !description || !subcategories || !icon) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // TODO: Implement actual database storage
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Category created successfully'
    });
  });

  app.use('/api/categories', router);
}
