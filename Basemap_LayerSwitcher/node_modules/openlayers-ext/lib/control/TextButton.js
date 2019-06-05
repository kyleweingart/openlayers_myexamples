/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple push button control drawn as text
 * @constructor
 * @extends {ol.control.Button}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.title title of the control
 *	@param {String} options.html html to insert in the control
 *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
ol.control.TextButton = function(options)
{	options = options || {};
    options.className = (options.className||"") + " ol-text-button";
    ol.control.Button.call(this, options);
};
ol.inherits(ol.control.TextButton, ol.control.Button);
