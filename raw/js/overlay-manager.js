/*global $,document */
'use strict';

/**
 * Control the overlay for a page
 * @param {object} options {adfree, zones, promos}
 * @param {string} url     current page url.
 */
var OverlayManager = function OverlayManager(options, url, adfree) {

	var noOptions = !url || !options || typeof options !== 'object';

	this.adfree = adfree || false;
	this.$window = $(window);
	this.$body = $('body');


	//Quick stop if there are no options passed in
	if (noOptions) {
		this.errorLog('Current URL | Data object has not been provided');

		return false;
	}

   //default params for object
	this.defaults = {
		zones: null,
		cookieTime: 1,
		cookieValue: 'true',
		cookieName: 'LiveEvent',
		width: '100%',
		height: '100%',
		backgroundColor: '0,0,0',
		opacity: '0.8',
		onAdfree: false
	};

	//Set current url value
	this.defaults.currentUrl = url;

	this.setDefaults(options);
};

/**
 * ID for the overlay
 * @type {String}
 */
OverlayManager.prototype.OVERLAY_ID = 'OverlayModal';

/**
 * ID for the overlay frame
 * @type {String}
 */
OverlayManager.prototype.FRAME_ID = 'OverlayFrame';

/**
 * Set options for the overlay
 * @param {object} options [contains all the zone information]
 */
OverlayManager.prototype.setDefaults = function setDefaults(options) {
	if (!options[0] || !options[0].promos) {
		this.errorLog('data zones not provided.');
		this.errorLog('expected obj[0].promos');

		return;
	}
	this.options = $.extend(this.options, this.defaults, options);
	//After all options are set check zones for promos and check for overlay
	if (this.options) {
		this.overlayCheck();
	}
};


OverlayManager.prototype.adFreeCheck = function adFreeCheck() {
	if (!this.adfree || 'true' === this.promo.parameters.onAdfree) {
		this.setSize();
	}
};

/**
 * Check includes and excludes to see if the overlay should live on the page
 */
OverlayManager.prototype.overlayCheck = function overlayCheck() {
	var i,
		x,
		includes,
		inlcudeLength,
		excludes,
		excludeLength,
		matchMaker,
		include,
		includeMatch,
		other,
		promos = this.options[0].promos,
		count = promos.length;

	for (i = 0; i < count; i++) {
		include = true;

		if (promos[i].parameters && promos[i].parameters.includes) {
			includeMatch = this.checkIncludes(promos[i].parameters.includes.split(','));

			//early escape if url is matched in includes
			if (includeMatch) {
				matchMaker = i;
				break;
			}
		} else {
			matchMaker = i;
		}

		if (promos[i].parameters && promos[i].parameters.excludes && !includeMatch) {
			include = this.checkExcludes(promos[i].parameters.excludes.split(','));

			if (include) {
				matchMaker = i;
			}

		} else {
			matchMaker = i;
		}
	}

	if (include) {
		this.promo = this.options[0].promos[matchMaker];
		this.adFreeCheck();
	}
};

/**
 * check to see if the overlay is blocked on this page.
 * @param  {string} excludes [url]
 * @return {boolean}
 */
OverlayManager.prototype.checkExcludes = function checkExcludes(excludes) {
	var x,
		excludeLength = excludes.length,
		url = this.options.currentUrl,
		include = true;

	for (x = 0; x < excludeLength; x++) {

		if (!!url.match(excludes[x])) {
			include = false;
			break;
		}

	}

	return include;
};

/**
 * check to see if the overlay is to appear on this page.
 * @param  {string} includes [url]
 * @return {boolean}
 */
OverlayManager.prototype.checkIncludes = function checkIncludes(includes) {
	var x,
		url = this.options.currentUrl,
		includeMatch = false,
		includeLength = includes.length;

	for (x = 0; x < includeLength; x++) {

		if (url.match(includes[x])) {
			includeMatch = true;
			break;
		}

	}

	return includeMatch;
};

/**
 * set the size of the frame.
 */
OverlayManager.prototype.setSize = function setSize() {
	var units,
		_height,
		_width,
		width = this.promo.parameters.width || this.options.width,
		height = this.promo.parameters.height || this.options.height;

	this.frame = {
		width: parseInt(width, 10),
		height: parseInt(height, 10),
		units: width.replace(parseInt(width, 10), ''),
		image: this.promo.parameters.imageOnly === 'true' ? true : false,
		path: this.promo.customIncludeUrl ? this.promo.customIncludeUrl : null,
		link: this.promo.parameters.imageLink ? this.promo.parameters.imageLink : null
	};

	//If there is no path then we do not need to add the overlay
	if (this.frame.path) {
		this.buildPromo();
	}

};

/**
 * build the promo and check if a cookie is needed.
 */
OverlayManager.prototype.buildPromo = function buildPromo() {
	if ('true' === this.promo.parameters.deferCookie) {
		console.log('defer cookie');
		this.createMask();
	} else {
		this.cookieStatus();
	}
};

/**
 * checks to see if there currently is a cookie set.
 * if there is not set the cookie.
 */
OverlayManager.prototype.cookieStatus = function cookieStatus() {
	if (!this.checkCookie()) {
		this.setCookie();
	}
};

/**
 * check to see the status of the current cookie
 * @return {boolean}
 */
OverlayManager.prototype.checkCookie = function checkCookie() {
	var x,
		current = document.cookie.split(';'),
		count = current.length;

	for (x = 0; x < count; x++) {

		if (current[x] !== '' && current[x].indexOf(this.options.cookieName) > -1) {
			return true;
		}

	}

	return false;
};


/**
 * set a cookie when needed
 */
OverlayManager.prototype.setCookie = function setCookie() {
	var promo = this.promo.parameters,
		expires,
		cookie,
		thisDate = new Date();

	this.options.cookieName = promo.cookieName ? promo.cookieName : this.options.cookieName;
	this.options.cookieValue = promo.cookieValue ? promo.cookieValue : this.options.cookieValue;
	this.options.cookieTime = promo.cookieTime ? promo.cookieTime : this.options.cookieTime;
	thisDate.setTime(thisDate.getTime() + (this.options.cookieTime * 24 * 60 * 60 * 1000));
	expires = 'expires=' + thisDate.toUTCString();
	cookie = this.options.cookieName + '=' + this.options.cookieValue + ';' + expires + ';' + 'path=/';

	if (document.cookie = cookie) {
		this.createMask();
	}
};

/**
 * Create the overlay container for the iframe, upon success will fire createFrame
 */
OverlayManager.prototype.createMask = function createMask() {
	//Setup the mask
	var mask = document.createElement('div');
	mask.id = this.OVERLAY_ID;
	mask.className = 'overlayMask';
	mask.style.position = 'fixed';
	mask.style.backgroundColor = 'rgba(' + this.options.backgroundColor + ', ' + this.options.opacity + ')';
	mask.style.border = 'none';
	mask.style.width = '100%';
	mask.style.height = '100%';
	mask.style.top = '0';
	mask.style.left = '0';
	mask.style.zIndex = 2147483654;

	//Check the mask is created before adding the frame
	if (this.setupListeners() && this.$body.append(mask)) {
		this.createFrame();
	}
};

/**
 * Create frame container for overlay, if frame is successfully created setup listeners
 */
OverlayManager.prototype.createFrame = function createFrame() {
	var frame = this.frame.image ? document.createElement('img') : document.createElement('iframe'),
		size = this.frame;

	frame.id = this.FRAME_ID;
	frame.style.position = 'fixed';
	frame.style.backgroundColor = 'transparent';
	frame.style.border = 'none';
	frame.style.width = size.width + size.units;
	frame.style.height = size.height + size.units;
	frame.style.zIndex = 10;
	frame.allowTransparency = 'true';
	frame.frameBorder = 0;
	frame.scrolling = 'no';
	frame.src = size.path;

	if ('%' === size.units) {
		frame.style.top = ((100 - size.height) / 2) + size.units;
		frame.style.left = ((100 - size.width) / 2) + size.units;
	} else {
		frame.style.top = '50%';
		frame.style.left = '50%';
		frame.style.marginLeft = '-' + Math.floor(size.width / 2) + size.units;
		frame.style.marginTop = '-' + Math.floor(size.height / 2) + size.units;
	}

	this.$body.find('#' + this.OVERLAY_ID).append(frame);
};

/**
 * setup listners for closing overlay
 */
OverlayManager.prototype.setupListeners = function setupListeners() {
	var success = true;

	if (this.$body.hasClass('activeOverlay')) {
		success = false;
	}

	this.$body.toggleClass('activeOverlay', true);
	this.$window.bind('overlay.kill', $.proxy(this.remove, this));

	return success;
 };

/**
 * remove listeners and overlay
 */
OverlayManager.prototype.remove = function remove() {
	if (!this.$body.hasClass('activeOverlay')) {
		return;
	}

	this.$body.toggleClass('activeOverlay', false).find('#' + this.OVERLAY_ID).remove();
	this.$window.unbind('overlay.kill');
};

/**
 * log errors to console
 */
OverlayManager.prototype.errorLog = function errorLog(message) {
	console.error('OverlayManager -> ' + message);
};
