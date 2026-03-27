export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
}

export const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic components and devices',
    subcategories: [
      {
        id: 'semiconductors',
        name: 'Semiconductors',
        description: 'Chips and electronic components',
        categoryId: 'electronics',
      },
      { id: 'pcb', name: 'PCB', description: 'Printed circuit boards', categoryId: 'electronics' },
      {
        id: 'connectors',
        name: 'Connectors',
        description: 'Electronic connectors',
        categoryId: 'electronics',
      },
    ],
  },
  {
    id: 'textiles',
    name: 'Textiles',
    description: 'Textile and fabric products',
    subcategories: [
      { id: 'cotton', name: 'Cotton', description: 'Cotton fabrics', categoryId: 'textiles' },
      {
        id: 'synthetic',
        name: 'Synthetic',
        description: 'Synthetic fabrics',
        categoryId: 'textiles',
      },
      { id: 'wool', name: 'Wool', description: 'Wool fabrics', categoryId: 'textiles' },
    ],
  },
  {
    id: 'machinery',
    name: 'Machinery',
    description: 'Industrial machinery and equipment',
    subcategories: [
      {
        id: 'manufacturing',
        name: 'Manufacturing',
        description: 'Manufacturing equipment',
        categoryId: 'machinery',
      },
      {
        id: 'packaging',
        name: 'Packaging',
        description: 'Packaging machinery',
        categoryId: 'machinery',
      },
      {
        id: 'automation',
        name: 'Automation',
        description: 'Automation equipment',
        categoryId: 'machinery',
      },
    ],
  },
  {
    id: 'chemicals',
    name: 'Chemicals',
    description: 'Chemical products and materials',
    subcategories: [
      {
        id: 'industrial',
        name: 'Industrial',
        description: 'Industrial chemicals',
        categoryId: 'chemicals',
      },
      {
        id: 'pharmaceutical',
        name: 'Pharmaceutical',
        description: 'Pharmaceutical chemicals',
        categoryId: 'chemicals',
      },
      {
        id: 'agricultural',
        name: 'Agricultural',
        description: 'Agricultural chemicals',
        categoryId: 'chemicals',
      },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Automotive parts and components',
    subcategories: [
      {
        id: 'engine',
        name: 'Engine Parts',
        description: 'Engine components',
        categoryId: 'automotive',
      },
      { id: 'body', name: 'Body Parts', description: 'Body components', categoryId: 'automotive' },
      {
        id: 'electrical',
        name: 'Electrical',
        description: 'Electrical components',
        categoryId: 'automotive',
      },
    ],
  },
];

export function getSubcategoriesByCategoryId(categoryId: string): Subcategory[] {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.subcategories : [];
}

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find(cat => cat.id === categoryId);
}

export function getAllSubcategories(): Subcategory[] {
  return categories.flatMap(cat => cat.subcategories);
}
