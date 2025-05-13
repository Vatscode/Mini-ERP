// NetSuite-like permission system
const PERMISSIONS = {
  ADMINISTRATOR: {
    level: 4,
    permissions: ['CREATE', 'READ', 'WRITE', 'DELETE', 'APPROVE']
  },
  MANUFACTURING_MANAGER: {
    level: 3,
    permissions: ['CREATE', 'READ', 'WRITE', 'APPROVE']
  },
  MANUFACTURING_USER: {
    level: 2,
    permissions: ['CREATE', 'READ', 'WRITE']
  },
  INVENTORY_MANAGER: {
    level: 2,
    permissions: ['READ', 'WRITE']
  },
  BASIC_USER: {
    level: 1,
    permissions: ['READ']
  }
};

// Permission check middleware factory
const checkPermission = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.context?.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          error: 'Authentication required',
          type: 'AUTHENTICATION_REQUIRED'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          type: 'INSUFFICIENT_PERMISSION'
        });
      }

      // Add permission context to request
      req.permissionContext = {
        role: userRole,
        level: PERMISSIONS[userRole].level,
        permissions: PERMISSIONS[userRole].permissions
      };

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Permission check failed',
        type: 'PERMISSION_ERROR'
      });
    }
  };
};

// Check specific permission
const hasPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.context?.user?.role;
    
    if (!userRole || !PERMISSIONS[userRole].permissions.includes(permission)) {
      return res.status(403).json({
        error: `Required permission: ${permission}`,
        type: 'INSUFFICIENT_PERMISSION'
      });
    }

    next();
  };
};

// Check permission level
const requireLevel = (minimumLevel) => {
  return (req, res, next) => {
    const userRole = req.context?.user?.role;
    
    if (!userRole || PERMISSIONS[userRole].level < minimumLevel) {
      return res.status(403).json({
        error: `Required permission level: ${minimumLevel}`,
        type: 'INSUFFICIENT_LEVEL'
      });
    }

    next();
  };
};

// Subsidiary restriction middleware (mimicking NetSuite's subsidiary restriction)
const restrictToSubsidiary = (subsidiaryField = 'subsidiaryId') => {
  return (req, res, next) => {
    const userSubsidiaries = req.context?.user?.subsidiaries || [];
    
    if (req.method === 'GET') {
      // Add subsidiary filter to query
      req.query[subsidiaryField] = { $in: userSubsidiaries };
    } else if (req.body[subsidiaryField]) {
      // Check if user has access to the subsidiary
      if (!userSubsidiaries.includes(req.body[subsidiaryField])) {
        return res.status(403).json({
          error: 'No permission for this subsidiary',
          type: 'SUBSIDIARY_RESTRICTION'
        });
      }
    }

    next();
  };
};

// Custom field permissions
const checkCustomFieldPermissions = (formId) => {
  return (req, res, next) => {
    const userRole = req.context?.user?.role;
    const customFields = req.body.customFields || {};

    // Filter out restricted custom fields
    Object.keys(customFields).forEach(fieldId => {
      const field = getCustomFieldConfig(fieldId);
      if (field && !field.allowedRoles.includes(userRole)) {
        delete customFields[fieldId];
      }
    });

    req.body.customFields = customFields;
    next();
  };
};

// Helper function to get custom field configuration
const getCustomFieldConfig = (fieldId) => {
  // This would typically come from a database or configuration file
  const customFieldConfigs = {
    custfield_approval_status: {
      allowedRoles: ['ADMINISTRATOR', 'MANUFACTURING_MANAGER']
    },
    custfield_quality_notes: {
      allowedRoles: ['ADMINISTRATOR', 'MANUFACTURING_MANAGER', 'MANUFACTURING_USER']
    }
  };

  return customFieldConfigs[fieldId];
};

module.exports = {
  checkPermission,
  hasPermission,
  requireLevel,
  restrictToSubsidiary,
  checkCustomFieldPermissions,
  PERMISSIONS
}; 