# OverlayManager

OverlayManager is an object for injecting content into a page as an overlay forcing users to interact with the overlay to gain access to the site

# Usage
Usage it is used by creating a new instance, and passing any configuration overrided required. 
```javascript
var om = new OverlayManager({
	zones: {},
    url: 'string'
})
```
# Required
 * **jQuery**: jQuery must be running on host site. version 1.7.2>=
 * **zones**: This object contains all other required information & optional information.
 * **currentURL**: This is the url of the current page being loaded.
 * **overlayPath**: This is the url of the overlay you would like to appear over the page.

# Options
 * **cookieValue**: Value to set in cookie, default: true.
 * **cookieTime**: How many days you want the cookie to live for, default: 1 (day).
 * **cookieName**: Name of the cookie to be set, default: LiveEvent.
 * **includes**: csv or regex for urls. If the current url is in this list the overlay will appear and stop the process of looking for a better fit. 
 * **excludes**: csv or regex for urls. If the current url is here the overlay will not appear on the current page. 
 * **deferCookie**: true | false value to not look for the current cooke. default: false
 * **backgroundColor** Color, default: #000
 * **opacity** Background Opacity, default: 0.8.


# Notes
If the current url is not in either includes | excludes of any zone the first zone overlay will be used

# Dependencies
OverlayManage requires user to have jQuery installed

# CLOSING
Fire this on the event you want to close the overlay with
window.parent.$(window.parent).trigger('overlay.kill');
