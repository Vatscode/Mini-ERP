const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: true,
        product: true
      }
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        ingredients: true,
        product: true
      }
    });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create new recipe
router.post('/', async (req, res) => {
  try {
    const { name, productId, version, ingredients } = req.body;
    const recipe = await prisma.recipe.create({
      data: {
        name,
        version,
        productId,
        ingredients: {
          create: ingredients
        }
      },
      include: {
        ingredients: true,
        product: true
      }
    });
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update recipe
router.put('/:id', async (req, res) => {
  try {
    const { name, version, ingredients } = req.body;
    const recipe = await prisma.recipe.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        version,
        ingredients: {
          deleteMany: {},
          create: ingredients
        }
      },
      include: {
        ingredients: true,
        product: true
      }
    });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    await prisma.recipe.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

module.exports = router; 