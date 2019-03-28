
 var codes = [];

codes.push('w320i1');
codes.push('nnw320i1');
codes.push('wnw320i1');
codes.push('e320i1');
codes.push('ene320i1');
codes.push('nne320i1');
var surgeLayers = [];

 var surge_layers = [];

 for (var i = 0; i < codes.length; i++){
   var imgLayer = new ol.source.ImageWMS({
     crossOrigin: 'anonymous',
     url: 'http://localhost:8080/geoserver/wms',
     params: {'LAYERS': 'test:sf1', 'DIM_MAX_COLS': codes[i]},
     ratio: 1,
     serverType: 'geoserver'
   });

function getMaxPixel(pixel) {
  var max = pixel.reduce(function(final, current) {
    for (var i = 0; i < final.length; ++i) {
      if (current[i] > 200) {
        current[i] = final[i];
        if (current[i] > final[i]) {
          final[i] = current[i];
        }
      }
    }
    return final;
  });
  return max;
}
console.log(surgeLayers.length);
var surgeRaster = new ol.source.Raster({
  sources: surgeLayers,
  /**
   * Run calculations on pixel data.
   * @param {Array} pixels List of pixels (one per source).
   * @param {Object} data User data object.
   * @return {Array} The output pixel.
   */
  operation: function(pixels, data) {
    var value = getMaxPixel(pixels);
    pixel = value;
    return pixel;
  },
  lib: {
    getMaxPixel: getMaxPixel
  }
});

// surgeRaster.on('beforeoperations', function(event) {
//   console.log('before');
// });

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    new ol.layer.Image({
      source: surgeRaster
    })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-80.6114, 26.8403]),
    zoom: 8
  }),
});