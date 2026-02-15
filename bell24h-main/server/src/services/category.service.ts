import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const buildCategoryTree = (categories, parentId = null) => {
  const categoryTree = [];
  const children = categories.filter(category => category.parentId === parentId);

  for (const child of children) {
    const grandchildren = buildCategoryTree(categories, child.id);
    if (grandchildren.length > 0) {
      child.children = grandchildren;
    }
    categoryTree.push(child);
  }

  return categoryTree;
};

export const getCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isEnabled: true,
    },
  });
  const categoryTree = buildCategoryTree(categories);
  return categoryTree;
};

export const getAllCategories = async () => {
  return prisma.category.findMany();
};

export const createCategory = async (data: { name: string; description?: string; parentId?: string; }) => {
    return prisma.category.create({
        data,
    });
}

export const updateCategory = async (id: string, data: { name?: string; description?: string; parentId?: string; isEnabled?: boolean }) => {
    return prisma.category.update({
        where: { id },
        data,
    });
}

export const deleteCategory = async (id: string) => {
    // Note: This is a simple delete. In a real-world scenario, you might want to handle subcategories (e.g., reassign them or delete them).
    // The schema is set to "SetNull" onDelete, so children will have their parentId set to null.
    return prisma.category.delete({
        where: { id },
    });
} 