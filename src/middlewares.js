const expressRateLimit = require('express-rate-limit');

const permittedRequestsPerInterval = 50;
const intervalMinutes = 60;
const rateLimitRejectionMessage = {
  message: `We have recieved too many requests from this IP address, in order to safegaurd the integrity of the system, future requests will be refused. Please try again after ${intervalMinutes} minutes.`,
};

/**
 * Middleware that provides rate limiting for GET requests.
 * 
 * @param {*} req the request.
 * @param {*} res the response.
 * @param {*} next the next middleware to be executed if request is allowed to proceed.
 */
const getRouteApiLimiter = expressRateLimit({
  windowMs: intervalMinutes * 60 * 1000,
  max: permittedRequestsPerInterval,
  message: rateLimitRejectionMessage,
});

/**
 * Middleware that provides logging.
 * 
 * @param {*} req the request.
 * @param {*} res the response.
 * @param {*} next the next middleware to be executed if request is allowed to proceed.
 */
function loggingMiddleware(req, res, next) {
  console.log(`${Date.now()}: ${req.method} request to '${req.path}' received from req.ip: ${req.ip}, req.secure: ${req.secure}`);
  next();
}

/**
 * Provides for Cross-Origin-Resource-Sharing
 * 
 * @param {*} req the request.
 * @param {*} res the response.
 * @param {*} next the next middleware to be executed if request is allowed to proceed.
 */
function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

/**
 * Checks that search requests have 1+ of the following parameters:
 *  1. searchString: a string of length 1 - 50.
 * 
 * @param {*} req the request.
 * @param {*} res the response.
 * @param {*} next the next middleware to be executed if request is allowed to proceed.
 */
function searchParamMiddleware(req, res, next) {
  const searchString = req.query.searchString;

  if(searchString){
    if(searchString.length > 50){
      res.status(422).send({
        message: `Error: The searchString parameter must be of length 1 - 50.`,
      });
      res.end();
    }else{
      next();
    }
    
  }else{
    res.status(422).send({
      message: `Error: The search param route requires a searchString parameter.`,
    });
    res.end();
  }
}

module.exports.corsMiddleware = corsMiddleware;
module.exports.loggingMiddleware = loggingMiddleware;
module.exports.getRouteApiLimiter = getRouteApiLimiter;
module.exports.searchParamMiddleware = searchParamMiddleware;
