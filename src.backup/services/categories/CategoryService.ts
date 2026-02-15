import { Category, SubCategory, CategoryStats } from '../../components/dashboard/types/categories';

// Mock data for categories
const mockCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic components and devices',
    icon: '🔌',
    totalRfqs: 150,
    activeRfqs: 45,
    subcategories: [
      {
        id: 'semiconductors',
        name: 'Semiconductors',
        description: 'Semiconductor components and chips',
        parentId: 'electronics',
        totalRfqs: 60,
        activeRfqs: 20,
        lastUpdated: new Date('2024-03-15')
      },
      {
        id: 'pcb',
        name: 'Printed Circuit Boards',
        description: 'PCB manufacturing and assembly',
        parentId: 'electronics',
        totalRfqs: 40,
        activeRfqs: 15,
        lastUpdated: new Date('2024-03-14')
      },
      {
        id: 'components',
        name: 'Electronic Components',
        description: 'Resistors, capacitors, and other components',
        parentId: 'electronics',
        totalRfqs: 50,
        activeRfqs: 10,
        lastUpdated: new Date('2024-03-13')
      }
    ]
  },
  {
    id: 'machinery',
    name: 'Industrial Machinery',
    description: 'Industrial equipment and machinery',
    icon: '⚙️',
    totalRfqs: 200,
    activeRfqs: 75,
    subcategories: [
      {
        id: 'cnc',
        name: 'CNC Machines',
        description: 'CNC machining and equipment',
        parentId: 'machinery',
        totalRfqs: 80,
        activeRfqs: 30,
        lastUpdated: new Date('2024-03-15')
      },
      {
        id: 'automation',
        name: 'Automation Systems',
        description: 'Industrial automation solutions',
        parentId: 'machinery',
        totalRfqs: 70,
        activeRfqs: 25,
        lastUpdated: new Date('2024-03-13')
      },
      {
        id: 'robotics',
        name: 'Industrial Robotics',
        description: 'Robotic systems and components',
        parentId: 'machinery',
        totalRfqs: 50,
        activeRfqs: 20,
        lastUpdated: new Date('2024-03-12')
      }
    ]
  },
  {
    id: 'raw-materials',
    name: 'Raw Materials',
    description: 'Industrial raw materials and supplies',
    icon: '🏭',
    totalRfqs: 180,
    activeRfqs: 60,
    subcategories: [
      {
        id: 'metals',
        name: 'Metals & Alloys',
        description: 'Various metals and metal alloys',
        parentId: 'raw-materials',
        totalRfqs: 70,
        activeRfqs: 25,
        lastUpdated: new Date('2024-03-15')
      },
      {
        id: 'plastics',
        name: 'Plastics & Polymers',
        description: 'Plastic materials and polymers',
        parentId: 'raw-materials',
        totalRfqs: 60,
        activeRfqs: 20,
        lastUpdated: new Date('2024-03-14')
      },
      {
        id: 'chemicals',
        name: 'Industrial Chemicals',
        description: 'Chemical compounds and solutions',
        parentId: 'raw-materials',
        totalRfqs: 50,
        activeRfqs: 15,
        lastUpdated: new Date('2024-03-13')
      }
    ]
  },
  {
    id: 'packaging',
    name: 'Packaging Solutions',
    description: 'Industrial packaging and materials',
    icon: '📦',
    totalRfqs: 120,
    activeRfqs: 40,
    subcategories: [
      {
        id: 'containers',
        name: 'Containers & Boxes',
        description: 'Various types of containers and boxes',
        parentId: 'packaging',
        totalRfqs: 45,
        activeRfqs: 15,
        lastUpdated: new Date('2024-03-15')
      },
      {
        id: 'materials',
        name: 'Packaging Materials',
        description: 'Packaging materials and supplies',
        parentId: 'packaging',
        totalRfqs: 40,
        activeRfqs: 15,
        lastUpdated: new Date('2024-03-14')
      },
      {
        id: 'equipment',
        name: 'Packaging Equipment',
        description: 'Packaging machinery and tools',
        parentId: 'packaging',
        totalRfqs: 35,
        activeRfqs: 10,
        lastUpdated: new Date('2024-03-13')
      }
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    description: 'Logistics and transportation services',
    icon: '🚚',
    totalRfqs: 160,
    activeRfqs: 55,
    subcategories: [
      {
        id: 'warehousing',
        name: 'Warehousing',
        description: 'Warehouse solutions and services',
        parentId: 'logistics',
        totalRfqs: 60,
        activeRfqs: 20,
        lastUpdated: new Date('2024-03-15')
      },
      {
        id: 'transport',
        name: 'Transport Services',
        description: 'Transportation and delivery services',
        parentId: 'logistics',
        totalRfqs: 50,
        activeRfqs: 20,
        lastUpdated: new Date('2024-03-14')
      },
      {
        id: 'equipment',
        name: 'Logistics Equipment',
        description: 'Logistics equipment and tools',
        parentId: 'logistics',
        totalRfqs: 50,
        activeRfqs: 15,
        lastUpdated: new Date('2024-03-13')
      }
    ]
  }
];

// Featured RFQs for new users
const featuredRfqs = [
  {
    id: 'rfq-001',
    title: 'High-Precision CNC Machining Services',
    category: 'machinery',
    subcategory: 'cnc',
    description: 'Looking for CNC machining services for aerospace components',
    budget: '$50,000 - $100,000',
    deadline: new Date('2024-04-15'),
    isFeatured: true
  },
  {
    id: 'rfq-002',
    title: 'Semiconductor Manufacturing Equipment',
    category: 'electronics',
    subcategory: 'semiconductors',
    description: 'Need semiconductor manufacturing equipment for new facility',
    budget: '$200,000 - $500,000',
    deadline: new Date('2024-04-20'),
    isFeatured: true
  }
];

// Trending categories based on recent activity
const trendingCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    growth: 25,
    activeRfqs: 45
  },
  {
    id: 'machinery',
    name: 'Industrial Machinery',
    growth: 20,
    activeRfqs: 75
  },
  {
    id: 'raw-materials',
    name: 'Raw Materials',
    growth: 15,
    activeRfqs: 60
  }
];

class CategoryService {
  async getCategories(): Promise<Category[]> {
    return mockCategories;
  }

  async getCategoryStats(): Promise<CategoryStats> {
    const categories = await this.getCategories();
    const totalRfqs = categories.reduce((sum, cat) => sum + cat.totalRfqs, 0);
    const activeRfqs = categories.reduce((sum, cat) => sum + cat.activeRfqs, 0);
    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);

    return {
      totalCategories: categories.length,
      totalSubcategories,
      totalRfqs,
      activeRfqs,
      topCategories: categories.sort((a, b) => b.activeRfqs - a.activeRfqs).slice(0, 5),
      recentActivity: [
        {
          categoryId: 'electronics',
          categoryName: 'Electronics',
          action: 'new',
          timestamp: new Date('2024-03-15T10:00:00')
        },
        {
          categoryId: 'machinery',
          categoryName: 'Industrial Machinery',
          action: 'update',
          timestamp: new Date('2024-03-15T09:30:00')
        }
      ]
    };
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find(cat => cat.id === id) || null;
  }

  async getSubcategoriesByCategoryId(categoryId: string): Promise<SubCategory[]> {
    const category = await this.getCategoryById(categoryId);
    return category?.subcategories || [];
  }

  async searchCategories(query: string): Promise<Category[]> {
    const categories = await this.getCategories();
    const searchTerm = query.toLowerCase();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      category.description.toLowerCase().includes(searchTerm) ||
      category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm) ||
        sub.description.toLowerCase().includes(searchTerm)
      )
    );
  }

  async getFeaturedRfqs() {
    return featuredRfqs;
  }

  async getTrendingCategories() {
    return trendingCategories;
  }

  async filterCategoriesByDateRange(startDate: Date, endDate: Date): Promise<Category[]> {
    const categories = await this.getCategories();
    return categories.filter(category => 
      category.subcategories.some(sub => 
        sub.lastUpdated >= startDate && sub.lastUpdated <= endDate
      )
    );
  }
}

export const categoryService = new CategoryService(); 