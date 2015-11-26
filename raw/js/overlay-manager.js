/*global $,document */
'use strict';

/**
 * Control the overlay for a page
 * @param {object} options {adfree, zones, promos}
 * @param {string} adfree  true|false is current page adfree
 */
var OverlayManager = function OverlayManager(overlayObj, adfree) {
	//Quick stop if there are no options passed in
	if (!overlayObj || typeof overlayObj !== 'object') {
		this.logging('Data object has not been provided', 'error');
		return false;
	}

	this.zones = overlayObj[0].promos;

	// Is current page adfree
	this.adfree = adfree || false;

	//Set objects needed through out
	this.$window = $(window);
	this.$body = $('body');

	this.batting();
};

/**
 * ID for the overlay frame
 * @type {String}
 */
OverlayManager.prototype.FRAME_ID = 'OverlayFrame';

/**
 * ID for the overlay
 * @type {String}
 */
OverlayManager.prototype.OVERLAY_ID = 'OverlayModal';

/**
 * [adFreeCheck description]
 * @return {[type]} [description]
 */
OverlayManager.prototype.adFreeCheck = function adFreeCheck() {
	if (!this.adfree || this.adfree === this.options.onAdfree){
		return true;
	}
	return false;
};

/**
 * all function calls needed for overlay
 */
OverlayManager.prototype.batting = function batting(){
	var iShow;
	var iMatch = this.overlayCheck();

	if (typeof iMatch !== 'object') {
		this.logging('no match provided', 'yarn');
		return false;
	}

	this.setOptions(iMatch);

	if (this.adFreeCheck() && this.cookieStatus()) {
		this.createMask();
	}

	this.setupListeners();
};

/**
 * Check provided url to see if it is an image
 * @return {Boolean} [return true if image false if not]
 */
OverlayManager.prototype.checkContents = function checkContents(){
	var iImage = this.options.customIncludeUrl.split('.');
	iImage = iImage[iImage.length - 1].toLowerCase();

	if (iImage === 'jpg' || iImage === 'png' || iImage === 'gif') {
		return true;
	}

	return false;
};

/**
 * check to see the status of the current cookie
 * @return {boolean}
 */
OverlayManager.prototype.checkCookie = function checkCookie(cookieMatch) {
	if (!cookieMatch) {return false;}
	var i,
		current = document.cookie.split(';'),
		count = current.length;

	for (i = 0; i < count; i++) {
		if (current[i] !== '' && current[i].indexOf(cookieMatch) > -1) {
			return true;
		}
	}

	return false;
};

/**
 * [checkDevice description]
 * @param  {[type]} device [description]
 * @return {[type]}        [description]
 */
OverlayManager.prototype.checkDevice = function checkDevice(device) {
	var i =0,
	count = device.length;
	//document.cookie = 'current_device=site-tablet.com;100000000;path=/';


	for (;i < count; i++) {
		if (this.checkCookie(device[i])) {
			this.logging('Device cookie match', 'warn');
			return true;
		} else if (this.deviceSize(device[i])) {
			this.logging('Device size match', 'warn');
			return true;
		}
	}

	return false;
};

/**
 * Create frame container for overlay, if frame is successfully created setup listeners
 */
OverlayManager.prototype.createFrame = function createFrame() {
	var content = this.checkContents();
	var height = parseInt(this.options.height, 10);
	var units = this.options.height.replace(height, '');
	var frame = content? document.createElement('img') : document.createElement('iframe');

	frame.id = this.FRAME_ID;
	frame.style.width = this.options.width;
	frame.style.height = this.options.height;
	frame.style.backgroundColor = 'transparent';
	frame.style.position = 'relative';
	frame.style.border = 'none';
	frame.style.zIndex = 10;
	frame.style.verticalAlign = 'center';
	frame.allowTransparency = 'true';
	frame.frameBorder = 0;
	frame.scrolling = 'no';
	frame.src = this.options.customIncludeUrl;

	if ('%' === units) {
		frame.style.top = ((100 - height) / 2) + units;
	} else {
		frame.style.top = '50%';
		frame.style.marginTop = '-' + Math.floor(height / 2) + units;
	}

	if (content && this.options.link) {
		this.$body.find('#' + this.OVERLAY_ID).append(
			$('<a>').attr('href',this.options.link)
			.append(frame)
			).show();
	} else {
		this.$body.find('#' + this.OVERLAY_ID).append(frame).show();
	}
};

/**
 * checks to see if there currently is a cookie set.
 * if there is not set the cookie.
 */
OverlayManager.prototype.cookieStatus = function cookieStatus() {
	if (this.options.deferCookie) {
		this.logging(this.options.cookieName + ' cookie has been defered', 'warn');
		return true;
	}

	if (!this.checkCookie(this.options.cookieName)) {
		return this.setCookie();
	} else {
		this.logging(this.options.cookieName + 'cookie has already been set', 'warn');
	}
};

/**
 * Create the close button to close the overlay container
 */
OverlayManager.prototype.createClose = function createClose() {
	var close = {
		'width':'35px',
		'height':'35px',
		'color':'white',
		'border':'2px solid white',
		'background':'black',
		'border-radius':'25px',
		'text-decoration':'none',
		'display': 'block',
		'font': '30px/1 Arial',
		'font-weight': 'Bold',
		'position': 'absolute',
		'right': '1%',
		'top': '2%',
		'zIndex': '99999'
	};
	this.$body.find('#' + this.OVERLAY_ID).append(
		$('<a>').attr('href','#').text('x').css(close).on('click',$.proxy(this.remove, this))
	);
};

/**
 * Create the overlay container for the iframe, upon success will fire createFrame
 */
OverlayManager.prototype.createMask = function createMask() {
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
	mask.style.textAlign = 'center';
	mask.style.zIndex = 2147483654;
	//mask.style.display = 'none';

	//Check the mask is created before adding the frame
	if (this.$body.append(mask)) {
		this.createClose();
		this.createFrame();
	}
};

/**
 * defaults for overlay
 * @type {Object}
 */
OverlayManager.prototype.defaults = {
	cookieTime: 1,
	cookieValue: 'true',
	cookieName: 'OverlayCookie',
	width: '100%',
	height: '100%',
	backgroundColor: '0,0,0',
	opacity: '0.8',
	onAdfree: false,
	deferCookie: false,
	currentUrl: window.location.href
};

/**
 * [sizeDevice description]
 * @return {[type]} [description]
 */
OverlayManager.prototype.deviceSize = function deviceSize(current) {
	var deviceMax , deviceMin;
	var device = 'desktop';
	var deviceW = this.$body.width();

	if (window.matchMedia('(orientation: landscape)').matches) {

		//iPad size
		deviceMax = 1024;
		deviceMin = 668;

	} else {
		// iPhone 6
		deviceMax = 768;
		deviceMin = 375;

	}

	if (deviceW <= deviceMin) {
		device = 'mobile';
	} else if (deviceW <= deviceMax) {
		device = 'tablet';
	}

	if (current === device) {
		return true;
	}

	return false;
};

/**
 * log messages to console
 */
OverlayManager.prototype.logging = function logging(message, type) {
	if (!console) { return false; }

	if (typeof message !== 'object') {
		if (type === 'error'){
			console.error('OverlayManager -> ' + message);
		} else if (type === 'warn') {
			console.warn('OverlayManager -> ' + message);
		} else {
			console.log('OverlayManager -> ' + message);
		}
	} else {
		if (type === 'error') {
			console.error('OverlayManager Obj-> ', message);
		} else if (type === 'warn') {
			console.warn('OverlayManager Obj-> ', message);
		 } else {
			console.log('OverlayManager Obj-> ', message);
		}
	}
};

OverlayManager.prototype.matchCheck = function matchCheck(value) {
	var i, valueLength, url;
	if (!value) {
		return false;
	}

	valueLength = value.length;
	url = this.defaults.currentUrl;

	for (i = 0; i < valueLength; i++) {
		if (url.match(value[i])) {
			return true;
		}
	}

	return false;
};

/**
 * Check includes and excludes to see if the overlay should live on the page
 */
OverlayManager.prototype.overlayCheck = function overlayCheck() {
	var i, iMatch, zone;
	var promos = this.zones;
	var count = promos.length;

	for (i = 0; i < count; i++) {
		// Early escape when no parameters are set.
		if (!promos[i].parameters) {
			iMatch = i;
			continue;
		}
		zone = promos[i].parameters;

		if (zone.device && !this.checkDevice(zone.device.split(','))) {
			continue;
		}

		if (zone.includes) {
			// If include match we need not process any other.
			if (this.matchCheck(zone.includes.split(','))) {
				iMatch = i;
				break;
			}
			continue;
		}

		if (zone.excludes) {
			// If excludes match we need to break out of this check.
			if (this.matchCheck(zone.excludes.split(','))) {
				continue;
			}
		}

		iMatch = i;
	}

	if (iMatch !== undefined) {
		this.logging('Matching page overlay', 'warn');
		return promos[iMatch];
	}
	return false;
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
	this.logging('Closing overlay', 'warn');
};

/**
 * [runLoop description]
 * @param  {[type]} contents [description]
 * @param  {[type]} check    [description]
 * @return {[type]}          [description]
 */
OverlayManager.prototype.runLoop = function runLoop(contents, check) {
	// Run through array and check for cookie value.
	//
	//
	// take current size and checks includes.
	contents.forEach(function(current){
		if (check === current) {
			return true;
		}
	});

	return false;
};

/**
 * set a cookie when needed
 */
OverlayManager.prototype.setCookie = function setCookie() {
	var expires,
		cookie,
		thisDate = new Date();

	thisDate.setTime(thisDate.getTime() + (this.options.cookieTime * 24 * 60 * 60 * 1000));
	expires = 'expires=' + thisDate.toUTCString();
	cookie = this.options.cookieName + '=' + this.options.cookieValue + ';' + expires + ';' + 'path=/';

	if (document.cookie = cookie) {
		return true;
	}
	return false;
};

/**
 * Set options for the overlay
 * @param {object} options [contains all the zone information]
 */
OverlayManager.prototype.setOptions = function setOptions(data) {
	if (!data) {
		this.logging('No data options provided', 'error');
		return false;
	}

	if (data.parameters) {
		this.options = $.extend(this.options, this.defaults, data.parameters);
		this.options.customIncludeUrl = data.customIncludeUrl;

	} else {
		this.options = $.extend(this.options, this.defaults, data);
	}

	this.logging(this.options, 'warn');

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
