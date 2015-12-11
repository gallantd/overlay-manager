/*global $,document */
'use strict';

/**
 * Control the overlay for a page
 * @param {object} options {adfree, zones, promos}
 * @param {string} [adfree  true|false is current page adfree]
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

	//The order of exicution
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
 * Check if overlay should be on current page
 * @return {boolean} [true appear | false  block]
 */
OverlayManager.prototype.adFreeCheck = function adFreeCheck() {
	if (!this.adfree || this.adfree === this.options.onAdfree){
		return true;
	}
	return false;
};

/**
 * All checkes needed for overlay
 */
OverlayManager.prototype.batting = function batting(){
	var iShow;
	var iMatch = this.overlayCheck();

	// Make sure we are working with an object
	if (typeof iMatch !== 'object') {
		this.logging('no match provided', 'yarn');
		return false;
	}

	//Set options for current overlay.
	this.setOptions(iMatch);

	//Check for adfree and cookie
	if (this.adFreeCheck() && this.cookieStatus()) {
		//If all true create the overlays
		this.createMask();

		//Once the overlay is created set the listneres for closing
		this.setupListeners();
	}

};

/**
 * Check provided url to see if it is an image
 * @return {Boolean} [return true if image false if not]
 */
OverlayManager.prototype.checkContents = function checkContents() {
	var iImage = this.options.customIncludeUrl;
	return (iImage.match(/.(gif|jpg|png)$/) !== null);
};

/**
 * check to see the status of the current cookie
 * @return {boolean} [true cookie exist | false no cookie]
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
 * Check screen based on coookie | size
 * @param  {Array} device [list of devices it should appear on]
 * @return {Boolean}      [true appear | falas don't]
 */
OverlayManager.prototype.checkDevice = function checkDevice(device) {
	var i,
	count = device.length;

	//Run through the device list looking for a match
	for (i = 0;i < count; i++) {
		if (this.checkCookie(device[i])) {
			this.logging('Device cookie match', 'warn');
			return true;
		} else if (this.deviceSize(device[i])) {
			this.logging('Device size match', 'warn');
			return true;
		}
	}

	// if not match return false to block the page
	return false;
};

/**
 * Create frame container for overlay
 * Set either iframe | image (image can have anchor)
 */
OverlayManager.prototype.createFrame = function createFrame() {
	// check to see if frame is an image
	var content = this.checkContents();
	var height = parseInt(this.options.height, 10);
	var units = this.options.height.replace(height, '');
	var frame = content? document.createElement('img') : document.createElement('iframe');

	//Setup the fram styles
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

	//Center the frame on the page
	if ('%' === units) {
		frame.style.top = ((100 - height) / 2) + units;
	} else {
		frame.style.top = '50%';
		frame.style.marginTop = '-' + Math.floor(height / 2) + units;
	}

	//if the contents are an image check for a link
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
 * Checks to defer cookie if not check the cookie
 */
OverlayManager.prototype.cookieStatus = function cookieStatus() {
	if (this.options.deferCookie) {
		this.logging(this.options.cookieName + ' cookie has been defered', 'warn');
		return true;
	}

	// Checck for cookie
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
 * Create the overlay container for the iframe | image
 * upon success will fire createFrame and close
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
	mask.style.display = 'none';

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
 * Current device based on screen size
 * @param  {string} current [current device]
 * @return {Boolean}        [true | false based on device match]
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
 * Log to console
 * @param  {string|object} message [what you want logged]
 * @param  {string} type    [warn|error|(empty)]
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

/**
 * Check the curren url for a match in value
 * @param  {array} value [array of urls]
 * @return {Boolean}     [true | false based on match]
 */
OverlayManager.prototype.matchCheck = function matchCheck(value) {
	var i, valueLength, url;
	if (!value) {
		return false;
	}

	valueLength = value.length;
	url = this.defaults.currentUrl;

	// Check values for a url match
	for (i = 0; i < valueLength; i++) {
		if (url.match(value[i])) {
			return true;
		}
	}

	return false;
};

/**
 * for each object passed in
 * check for device
 * check for include match
 * check for exclude match
 * @return {object|false} [return the best matching object]
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
		//set zone to current promot pramas to be checked
		zone = promos[i].parameters;

		//Check device size
		if (zone.device && !this.checkDevice(zone.device.split(','))) {
			continue;
		}

		// Check includes
		if (zone.includes) {
			// If include match we need not process any other.
			if (this.matchCheck(zone.includes.split(','))) {
				iMatch = i;
				break;
			}
			continue;
		}

		// Check excludes
		if (zone.excludes) {
			// If excludes match we need to break out of this check.
			if (this.matchCheck(zone.excludes.split(','))) {
				continue;
			}
		}

		iMatch = i;
	}

	// return match if there is one
	if (iMatch !== undefined) {
		this.logging('Matching page overlay', 'warn');
		return promos[iMatch];
	}

	// No match found
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
 * Check throug an array to find a match
 * @param  {array} contents [list of value to check against]
 * @param  {string} check   [string to match against]
 * @return {Boolea}         [true | false based on match]
 */
OverlayManager.prototype.runLoop = function runLoop(contents, check) {
	contents.forEach(function(current){
		if (check === current) {
			return true;
		}
	});

	return false;
};

/**
 * Set a cookie when needed
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
 * Setup listners for closing overlay
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
