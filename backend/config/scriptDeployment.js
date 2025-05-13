// Mimicking NetSuite's script deployment configuration
const ScriptType = {
  USER_EVENT: 'userEvent',
  SCHEDULED: 'scheduled',
  CLIENT: 'client',
  RESTLET: 'restlet'
};

const scriptDeployments = {
  batchProcessing: {
    scriptId: 'customscript_batch_processing',
    deploymentId: 'customdeploy_batch_processing',
    type: ScriptType.USER_EVENT,
    status: 'ACTIVE',
    triggers: ['beforeSubmit', 'afterSubmit'],
    audience: ['ADMINISTRATOR', 'MANUFACTURING_USER'],
    description: 'Handles batch record processing and inventory updates'
  },

  inventoryAudit: {
    scriptId: 'customscript_inventory_audit',
    deploymentId: 'customdeploy_inventory_audit',
    type: ScriptType.SCHEDULED,
    status: 'ACTIVE',
    schedule: {
      frequency: 'WEEKLY',
      dayOfWeek: 'MONDAY',
      timeOfDay: '00:00'
    },
    description: 'Weekly inventory audit and alerts'
  },

  recipeCalculator: {
    scriptId: 'customscript_recipe_calculator',
    deploymentId: 'customdeploy_recipe_calculator',
    type: ScriptType.CLIENT,
    status: 'ACTIVE',
    triggers: ['pageInit', 'fieldChanged', 'saveRecord'],
    description: 'Handles recipe calculations and validations'
  }
};

// Function to check if a script is active
const isScriptActive = (scriptId) => {
  const deployment = Object.values(scriptDeployments)
    .find(d => d.scriptId === scriptId);
  return deployment && deployment.status === 'ACTIVE';
};

// Function to get script configuration
const getScriptConfig = (scriptId) => {
  return scriptDeployments[scriptId] || null;
};

// Function to validate script execution context
const validateScriptContext = (scriptId, context) => {
  const deployment = Object.values(scriptDeployments)
    .find(d => d.scriptId === scriptId);
  
  if (!deployment) return false;
  
  switch (deployment.type) {
    case ScriptType.USER_EVENT:
      return deployment.triggers.includes(context);
    case ScriptType.SCHEDULED:
      return context === 'scheduled';
    case ScriptType.CLIENT:
      return deployment.triggers.includes(context);
    default:
      return false;
  }
};

module.exports = {
  ScriptType,
  scriptDeployments,
  isScriptActive,
  getScriptConfig,
  validateScriptContext
}; 