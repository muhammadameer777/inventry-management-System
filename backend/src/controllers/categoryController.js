import prisma from '../config/db.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: c.description,
      icon: c.icon || 'Sparkles',
      eventCount: c._count.events,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        events: true,
        _count: {
          select: { events: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Event category not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...category,
        eventCount: category._count.events,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A category named "${trimmedName}" already exists.`,
      });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || '',
        icon: icon || 'Sparkles',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: {
        ...category,
        eventCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name: name.trim() },
      });
      if (duplicate && duplicate.id !== id) {
        return res.status(409).json({
          success: false,
          message: `Category name "${name.trim()}" is already taken.`,
        });
      }
      slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim(), slug } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(icon ? { icon } : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Referential integrity check: do not delete if events depend on it
    if (category._count.events > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${category._count.events} active event(s) are assigned to it. Please reassign or delete these events first.`,
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
