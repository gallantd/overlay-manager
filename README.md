# OverlayManager

OverlayManager is an object parser for determining the best fit for an overlay based on screen size and url

# Usage
Usage it is used by creating a new instance, and passing any configuration overrided required. 
```	
	jQuery
	var om = new OverlayManager(zones, adfree);
```
	zone => {Object} containg the information to check against. 
	adfree => {Boolean} if the current page is adfree. 

# Required
 * **jQuery**: jQuery must be running on host site. version 1.7.2>=
 * **zones**: This object contains all other required information & optional information.
 

# Options
 * **customIncludeUrl** URL to be used to load the contents
 * **cookieValue**: Value to set in cookie, default: true.
 * **cookieTime**: How many days you want the cookie to live for, default: 1 (day).
 * **cookieName**: Name of the cookie to be set, default: LiveEvent.
 * **includes**: csv or regex for urls. If the current url is in this list the overlay will appear and stop the process of looking for a better fit. 
 * **excludes**: csv or regex for urls. If the current url is here the overlay will not appear on the current page. 
 * **deferCookie**: true | false value to not look for the current cooke. default: false
 * **backgroundColor** Color, default: #000
 * **opacity** Background Opacity, default: 0.8.
 * **link** URL to have an image link to
 * **device** Devices you want the overlay to appear on
 * **onAdfree** Should the ovelay appear on adfree pages
 * **width** Width of the overlay contents
 * **height** Height of the ovelray contents


# Notes
Includes are used when you want an overlay only on one page
Excludes will block site or pages
If no match is made overlay will appear

# Dependencies
OverlayManage requires user to have jQuery installed

# CLOSING
Fire this on the event you want to close the overlay with
window.parent.$(window.parent).trigger('overlay.kill');
