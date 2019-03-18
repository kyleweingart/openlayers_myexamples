var basemap = new ol.layer.Tile({
  source: new ol.source.OSM()
})



var codes = [];

codes.push('w320i1');
//codes.push('nnw320i1');
//codes.push('wnw320i1');
codes.push('e320i1');
//codes.push('ene320i1');
//codes.push('nne320i1');
var surgeLayers = [];
console.log(surgeLayers);

for (var i = 0; i < codes.length; i++) {
  var imgLayer = new ol.layer.Image({
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ol.source.ImageWMS({
      url: 'http://localhost:8080/geoserver/wms',
      crossOrigin: 'anonymous',
      params: {'LAYERS': 'test:sf1', 'DIM_MAX_COLS': codes[i]},
      ratio: 1,
      serverType: 'geoserver'
    }),
  name: 'layer' + codes[i]
  });
  surgeLayers.push(imgLayer);
}

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

console.log(surgeLayers);
var surgeRaster = new ol.source.Raster({
  sources: surgeLayers,
  /**
   * Run calculations on pixel data.
   * @param {Array} pixels List of pixels (one per source).
   * @param {Object} data User data object.
   * @return {Array} The output pixel.
   */
  operation: function(pixels, data) {
    console.log('here');
    var value = getMaxPixel(pixels);
    pixel = value
    
    return pixel;
  },
  lib: {
    getMaxPixel: getMaxPixel
  }
});



// surge_raster.on('beforeoperations', function(event) {
//   console.log('before');
// });

var map = new ol.Map({
  layers: [basemap],
  // layers: [basemap, new ol.layer.Image({
  //   source: surgeRaster
  // })],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-97.6114, 38.8403], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5,
  }),
});