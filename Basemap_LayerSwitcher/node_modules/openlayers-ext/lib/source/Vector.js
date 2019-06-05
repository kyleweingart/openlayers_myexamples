(function () {
  var clear = ol.source.Vector.prototype.clear;
  /** Overwrite ol/source/Vector clear to fire clearstart / clearend event
   */
  ol.source.Vector.prototype.clear = function(opt_fast) {
    this.dispatchEvent({ type: 'clearstart' });
    clear.call(this, opt_fast)
    this.dispatchEvent({ type: 'clearend' });
  };
})();
