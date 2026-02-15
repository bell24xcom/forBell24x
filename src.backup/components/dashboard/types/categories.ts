export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  subcategories: SubCategory[];
  totalRfqs: number;
  activeRfqs: number;
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  parentId: string;
  totalRfqs: number;
  activeRfqs: number;
  lastUpdated: Date;
}

export interface CategoryStats {
  totalCategories: number;
  totalSubcategories: number;
  totalRfqs: number;
  activeRfqs: number;
  topCategories: Category[];
  recentActivity: {
    categoryId: string;
    categoryName: string;
    action: 'new' | 'update' | 'complete';
    timestamp: Date;
  }[];
} 