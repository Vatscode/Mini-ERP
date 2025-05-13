const prisma = require('../db');

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          recipes: true
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single product
  getProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          recipes: true
        }
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {
      const { name, description, sku } = req.body;
      const product = await prisma.product.create({
        data: {
          name,
          description,
          sku
        }
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, sku } = req.body;
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          sku
        }
      });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productController; 