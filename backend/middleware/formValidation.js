const { getFormConfig, validateFormData } = require('../config/customForms');

// Form validation middleware factory
const validateForm = (formId) => {
  return async (req, res, next) => {
    try {
      // Get form configuration
      const formConfig = getFormConfig(formId);
      if (!formConfig) {
        return res.status(400).json({
          error: 'Form configuration not found',
          type: 'INVALID_FORM'
        });
      }

      // Add form context to request
      req.formContext = {
        id: formId,
        config: formConfig
      };

      // Validate form data
      const validation = validateFormData(formId, req.body);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Form validation failed',
          type: 'VALIDATION_ERROR',
          details: validation.errors
        });
      }

      // Set default values for missing fields
      formConfig.fields.forEach(field => {
        if (field.defaultValue !== undefined && req.body[field.id] === undefined) {
          req.body[field.id] = field.defaultValue;
        }
      });

      // Handle sublist data if present
      formConfig.fields
        .filter(field => field.type === 'sublist')
        .forEach(sublist => {
          if (req.body[sublist.id]) {
            // Validate each sublist line
            req.body[sublist.id].forEach((line, index) => {
              sublist.columns.forEach(column => {
                if (column.mandatory && !line[column.id]) {
                  throw new Error(
                    `Line ${index + 1}: ${column.label} is required in ${sublist.label}`
                  );
                }
              });
            });
          }
        });

      next();
    } catch (error) {
      res.status(400).json({
        error: error.message,
        type: 'FORM_PROCESSING_ERROR'
      });
    }
  };
};

// Field level security middleware
const fieldLevelSecurity = (formId, operation) => {
  return (req, res, next) => {
    const formConfig = getFormConfig(formId);
    if (!formConfig) {
      return next();
    }

    // Remove restricted fields based on user role and operation
    const userRole = req.context.user.role;
    const restrictedFields = formConfig.fields
      .filter(field => {
        const fieldSecurity = field.security || {};
        return !fieldSecurity[operation]?.includes(userRole);
      })
      .map(field => field.id);

    // Remove restricted fields from request body
    restrictedFields.forEach(field => {
      delete req.body[field];
    });

    next();
  };
};

// Dynamic field display type middleware
const setFieldDisplayTypes = (formId) => {
  return (req, res, next) => {
    const formConfig = getFormConfig(formId);
    if (!formConfig) {
      return next();
    }

    // Add display type information to response
    res.locals.fieldDisplay = formConfig.fields.reduce((acc, field) => {
      acc[field.id] = {
        type: field.type,
        display: field.displayType || 'normal',
        label: field.label
      };
      return acc;
    }, {});

    next();
  };
};

module.exports = {
  validateForm,
  fieldLevelSecurity,
  setFieldDisplayTypes
}; 