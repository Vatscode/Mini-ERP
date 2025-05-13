const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { NetSuiteError, ErrorType } = require('./errorHandler');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new NetSuiteError('Authentication required', ErrorType.PERMISSION_ERROR);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new NetSuiteError('User not found', ErrorType.PERMISSION_ERROR);
    }

    // Set up NetSuite-like execution context
    req.context = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      runtime: {
        getCurrentUser: () => req.context.user,
        getCurrentScript: () => ({
          id: 'customscript_erp_api',
          deploymentId: 'customdeploy_erp_api',
          type: 'RESTLET'
        }),
        getCurrentSession: () => ({
          id: req.sessionID,
          startTime: new Date()
        })
      },
      // Add Prisma client to context for database operations
      prisma
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new NetSuiteError('Invalid token', ErrorType.PERMISSION_ERROR));
    } else {
      next(error);
    }
  }
};

// Login handler
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // In a real application, you would hash the password and compare with stored hash
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new NetSuiteError('Invalid credentials', ErrorType.PERMISSION_ERROR);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create initial admin user
const createAdminUser = async () => {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMINISTRATOR' }
    });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'System Administrator',
          role: 'ADMINISTRATOR',
          // In a real application, this would be a hashed password
          password: 'admin123'
        }
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = {
  authMiddleware,
  login,
  createAdminUser
}; 