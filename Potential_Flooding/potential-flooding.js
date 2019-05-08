
var codes = [];

// codes.push('nne320i1');
// codes.push('w320i1');
codes.push('e320i1');
// codes.push('s320i1');
// codes.push('nnw320i1');
// codes.push('wnw320i1');
// codes.push('ene320i1');
var surgeLayers = [];


for (var i = 0; i < codes.length; i++) {
  var imgSource = new ol.source.ImageWMS({
      url: 'http://localhost:8080/geoserver/wms',
      crossOrigin: 'anonymous',
      params: {'LAYERS': 'test:sf1', 'DIM_MAX_COLS': codes[i]},
      ratio: 1,
      serverType: 'geoserver'
  });
  surgeLayers.push(imgSource);
}

function getMaxPixel(pixel) {
  var max = pixel.reduce(function(final, current) {
    for (var i = 0; i < final.length; ++i) {
      if (current[i] > 200) {
        current[i] = final[i];
      } else if (current[i] > final[i]) {
          final[i] = current[i];
        }
    }
    // console.log(final);
    return final;
  });
  return max;
}


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


var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    new ol.layer.Image({
      source: surgeRaster
    }),
    // new ol.layer.Image({
    //   source: testSource
    // })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-81.97, 26.49]),
    zoom:5
  }),
});