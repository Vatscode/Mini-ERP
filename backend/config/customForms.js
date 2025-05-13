// Mimicking NetSuite's custom form configuration
const FormType = {
  BATCH: 'batch',
  RECIPE: 'recipe',
  INGREDIENT: 'ingredient',
  PRODUCT: 'product'
};

const FieldType = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  DATE: 'date',
  CHECKBOX: 'checkbox',
  SUBLIST: 'sublist'
};

const customForms = {
  // Batch Manufacturing Form
  batchManufacturing: {
    id: 'custform_batch_manufacturing',
    type: FormType.BATCH,
    name: 'Batch Manufacturing Form',
    fields: [
      {
        id: 'custfield_batch_number',
        label: 'Batch Number',
        type: FieldType.TEXT,
        mandatory: true,
        displayType: 'normal',
        defaultValue: 'AUTO'
      },
      {
        id: 'custfield_planned_quantity',
        label: 'Planned Quantity',
        type: FieldType.NUMBER,
        mandatory: true,
        displayType: 'normal'
      },
      {
        id: 'custfield_actual_quantity',
        label: 'Actual Quantity',
        type: FieldType.NUMBER,
        displayType: 'normal'
      },
      {
        id: 'custfield_status',
        label: 'Status',
        type: FieldType.SELECT,
        mandatory: true,
        options: [
          { value: 'pending', text: 'Pending' },
          { value: 'processing', text: 'In Process' },
          { value: 'completed', text: 'Completed' },
          { value: 'qc_failed', text: 'QC Failed' }
        ]
      },
      {
        id: 'custfield_ingredients',
        label: 'Ingredients',
        type: FieldType.SUBLIST,
        columns: [
          { id: 'item', label: 'Item', type: FieldType.SELECT },
          { id: 'quantity', label: 'Quantity', type: FieldType.NUMBER },
          { id: 'available', label: 'Available', type: FieldType.NUMBER }
        ]
      }
    ],
    tabs: [
      {
        id: 'maintab',
        label: 'Main',
        fields: ['custfield_batch_number', 'custfield_planned_quantity', 'custfield_status']
      },
      {
        id: 'detailstab',
        label: 'Details',
        fields: ['custfield_actual_quantity', 'custfield_ingredients']
      }
    ]
  },

  // Recipe Form
  recipeForm: {
    id: 'custform_recipe',
    type: FormType.RECIPE,
    name: 'Recipe Form',
    fields: [
      {
        id: 'custfield_recipe_name',
        label: 'Recipe Name',
        type: FieldType.TEXT,
        mandatory: true
      },
      {
        id: 'custfield_recipe_ingredients',
        label: 'Ingredients',
        type: FieldType.SUBLIST,
        columns: [
          { id: 'ingredient', label: 'Ingredient', type: FieldType.SELECT },
          { id: 'quantity', label: 'Quantity', type: FieldType.NUMBER },
          { id: 'unit', label: 'Unit', type: FieldType.SELECT }
        ]
      }
    ]
  }
};

// Function to get form configuration
const getFormConfig = (formId) => {
  return Object.values(customForms).find(form => form.id === formId);
};

// Function to validate form data against configuration
const validateFormData = (formId, data) => {
  const form = getFormConfig(formId);
  if (!form) return { valid: false, errors: ['Form not found'] };

  const errors = [];
  form.fields.forEach(field => {
    if (field.mandatory && !data[field.id]) {
      errors.push(`${field.label} is required`);
    }

    if (field.type === FieldType.SELECT && data[field.id]) {
      const validOption = field.options?.some(opt => opt.value === data[field.id]);
      if (!validOption) {
        errors.push(`Invalid value for ${field.label}`);
      }
    }

    if (field.type === FieldType.NUMBER && data[field.id]) {
      const num = Number(data[field.id]);
      if (isNaN(num)) {
        errors.push(`${field.label} must be a number`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// Function to generate default values for a form
const getFormDefaults = (formId) => {
  const form = getFormConfig(formId);
  if (!form) return {};

  const defaults = {};
  form.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaults[field.id] = field.defaultValue;
    }
  });

  return defaults;
};

module.exports = {
  FormType,
  FieldType,
  customForms,
  getFormConfig,
  validateFormData,
  getFormDefaults
}; 