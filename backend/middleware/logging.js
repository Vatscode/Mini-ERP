// NetSuite-like script execution logging
class ScriptLog {
  constructor(scriptContext) {
    this.scriptContext = scriptContext;
    this.entries = [];
    this.startTime = Date.now();
  }

  debug(message) {
    this._log('DEBUG', message);
  }

  audit(title, details) {
    this._log('AUDIT', `${title}: ${details}`);
  }

  error(error) {
    this._log('ERROR', error instanceof Error ? error.stack : error.toString());
  }

  _log(level, message) {
    const timestamp = new Date().toISOString();
    const scriptInfo = this.scriptContext ? {
      scriptId: this.scriptContext.getCurrentScript().id,
      deploymentId: this.scriptContext.getCurrentScript().deploymentId,
      user: this.scriptContext.getCurrentUser()?.email
    } : {};

    this.entries.push({
      timestamp,
      level,
      message,
      ...scriptInfo,
      executionTime: Date.now() - this.startTime
    });
  }

  getEntries() {
    return this.entries;
  }
}

// Script execution logger middleware
const scriptLogger = (req, res, next) => {
  // Create new logger instance for this request
  const logger = new ScriptLog(req.context);

  // Add logger to request context
  req.log = logger;

  // Log request start
  logger.audit('Request Start', `${req.method} ${req.path}`);

  // Log request parameters
  if (Object.keys(req.query).length > 0) {
    logger.debug(`Query Parameters: ${JSON.stringify(req.query)}`);
  }
  if (Object.keys(req.body).length > 0) {
    logger.debug(`Request Body: ${JSON.stringify(req.body)}`);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    // Log response
    logger.audit('Response', `Status: ${res.statusCode}`);
    
    // Log execution time
    const executionTime = Date.now() - logger.startTime;
    logger.debug(`Execution Time: ${executionTime}ms`);

    // Store logs in response headers for debugging
    res.set('X-Script-Logs', JSON.stringify(logger.getEntries()));
    
    return originalSend.call(this, body);
  };

  // Error logging
  const originalError = res.error;
  res.error = function(error) {
    logger.error(error);
    return originalError.call(this, error);
  };

  next();
};

// Governance monitoring middleware (mimicking NetSuite's governance system)
const governanceMonitor = (req, res, next) => {
  const MAX_UNITS = 1000;
  let unitsConsumed = 0;

  // Add governance monitoring to request context
  req.governance = {
    getRemainingUsage: () => MAX_UNITS - unitsConsumed,
    getMaxUsage: () => MAX_UNITS,
    consumeUnits: (units) => {
      unitsConsumed += units;
      if (unitsConsumed > MAX_UNITS) {
        throw new Error('GOVERNANCE_EXCEEDED: Script execution usage limit exceeded');
      }
    }
  };

  // Monitor database operations
  const operations = {
    create: 20,
    update: 10,
    delete: 20,
    search: 5,
    read: 2
  };

  // Wrap Prisma client methods to monitor governance
  const prismaClient = req.context?.prisma;
  if (prismaClient) {
    Object.keys(operations).forEach(op => {
      const original = prismaClient[op];
      prismaClient[op] = async function(...args) {
        req.governance.consumeUnits(operations[op]);
        return original.apply(this, args);
      };
    });
  }

  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();

  // Add performance monitoring to request context
  req.performance = {
    marks: new Map(),
    measures: new Map(),
    
    mark: (name) => {
      req.performance.marks.set(name, process.hrtime(start));
    },
    
    measure: (name, startMark, endMark) => {
      const startTime = req.performance.marks.get(startMark);
      const endTime = req.performance.marks.get(endMark);
      
      if (startTime && endTime) {
        const duration = (endTime[0] - startTime[0]) * 1000 +
                        (endTime[1] - startTime[1]) / 1000000;
        req.performance.measures.set(name, duration);
      }
    }
  };

  // Add performance data to response headers
  res.on('finish', () => {
    const end = process.hrtime(start);
    const duration = end[0] * 1000 + end[1] / 1000000;
    
    res.set('X-Performance-Data', JSON.stringify({
      totalDuration: duration,
      measures: Object.fromEntries(req.performance.measures)
    }));
  });

  next();
};

module.exports = {
  scriptLogger,
  governanceMonitor,
  performanceMonitor
}; 