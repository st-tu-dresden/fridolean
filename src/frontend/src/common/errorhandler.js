// copied but modified from https://raw.githubusercontent.com/bedezign/yii2-audit/master/src/web/assets/javascript/logger.js

const jsLogger = new function() {
	// The url logs should be sent to. Filled in the capture function.
	this.logUrl = null;
	this.credentials = true;

	// The types that should be sent to the backend.
	this.captureTypes = ['warn', 'error', 'onerror'];

	// True if you also want any error to be forwarded to the appropriate console function
	this.consoleOutput = typeof window.console !== 'undefined' &&
		typeof window.console.log !== 'undefined' && typeof window.console.log.apply !== 'undefined';

	// True to pass on the error to the previously active handler
	this.chainErrors = true;

	let previousErrorHandler, errorHandler = function(message, file, line, col, error) {
		// Also send the the error object
		window.jsLogger.capture('onerror', message, {error: window.jsLogger.errorToString(error)}, file, line, col);
		if (typeof previousErrorHandler === 'function' && window.jsLogger.chainErrors)
			return previousErrorHandler(message, file, line, col, error);
	};

	this.info = function (message, data) {
		if (this.consoleOutput) console.info.apply(console, arguments);
		this.capture('info', message, data);
	};

	this.log = function(message, data) {
		if (this.consoleOutput) console.log.apply(console, arguments);
		this.capture('log', message, data);
	};

	this.warn = function (message, data) {
		if (this.consoleOutput) console.warn.apply(console, arguments);
		this.capture('warn', message, data);
	};

	this.error = function (message, data) {
		if (this.consoleOutput) console.error.apply(console, arguments);
		this.capture('error', message, data);
	};

	this.attachErrorHandler = function() {
		if (typeof previousErrorHandler !== 'function' || previousErrorHandler !== errorHandler)
			previousErrorHandler = window.onerror;
		window.onerror = errorHandler;
        const orig_cerror = console.error;
        console.error = function(message, data) {
			this.capture("error", message, data);
			orig_cerror.apply(console, arguments);
		}.bind(this);
        const orig_cwarn = console.warn;
        console.warn = function(message, data) {
			this.capture("warn", message, data);
			orig_cwarn.apply(console, arguments);
		}.bind(this);
	};

	this.capture = function(type, message, data, file, line, col) {
		if (!this.logUrl)
			this.logUrl = window.auditUrl || 'index.php?r=audit/js-log/index';

		if (window.XMLHttpRequest && this.captureTypes.indexOf(type.toLowerCase()) !== -1) {
			const xhr = new XMLHttpRequest();
			let log = {type: type, message: message, data: data, file: file, line: line, col: col};
			log.location = window.location.href;

			xhr.open('POST', this.logUrl);
			xhr.withCredentials = this.credentials;
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.send(JSON.stringify(log));
		}
		return true;
	};

	// Allow for stringify'ing Error objects (http://stackoverflow.com/a/18391400/50158)
	this.errorToString = function(err, filter, space) {
	  let plainObject = {};
	  if (Object.getOwnPropertyNames) Object.getOwnPropertyNames(err).forEach(function(key) { plainObject[key] = err[key];});
	  else for (const k in err) { if (err.hasOwnProperty(k)) plainObject.push(k); }
	  return JSON.stringify(plainObject, filter, space);
	};
}();

if (!window.jsLogger) {
	window.jsLogger = jsLogger;
}
export default jsLogger;
