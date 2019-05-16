
 var codes = [];

codes.push('w320i1');
codes.push('nnw320i1');
codes.push('wnw320i1');
codes.push('e320i1');
codes.push('ene320i1');
codes.push('nne320i1');
var surgeLayers = [];
  
 // codes.push('nnw320i1');
 // codes.push('wnw320i1');
 
//  codes.push('e320i1');
 codes.push('w320i1');
//  codes.push('ene320i1');
//  codes.push('nne320i1');

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

 function getMaxDepth(inputs, data) {
   var dataArray = [];
   console.log(inputs[0].width);
   var width = inputs[0].width;
   var height = inputs[0].height;
   for (var i = 0; i < inputs.length; i++ ) {
     dataArray.push(inputs[i].data);
   }

   var max = dataArray.reduce(function(final, current) {
     for (var i = 0; i < final.length; ++i) {
       if (current[i] > final[i]) {
         final[i] = current[i];
       }
     }
     return final;
   });

   return {data: max, width: width, height: height};
 }

 var raster = new ol.source.Raster({
   sources: surge_layers,
   operationType: 'image',
   operation: getMaxDepth
 });

 var view = new ol.View({
   center: [-9018025.746879461, 2927045.4641722036],
     zoom: 8
 });

 var surgeImage = new ol.layer.Image({
   source: raster
 });

 var map = new ol.Map({
   layers: [
     new ol.layer.Tile({
       source: new ol.source.OSM()
     }),
     surgeImage
   ],
   target: 'map',
   view: view
 });

 raster.on('beforeoperations', function(event) {
   var data = event.data;
   console.log(data);
 });

var parser = new ol.format.WMSGetFeatureInfo();
var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();

map.on('singleclick', function (evt) {
  console.log(evt.coordinate);
  for (var i = 0; i < surge_layers.length; i++) {
  var url = surge_layers[i].getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    {
      'INFO_FORMAT': 'application/vnd.ogc.gml',
    });
  $.ajax({
    type: 'GET',
    url: url
  }).done(function (data) {
    var features = parser.readFeatures(data);
    if (features.length > 0) {
      console.log(features[0].H.GRAY_INDEX);
      // below works but has generalized data
      // geom = features[0].H.geom;
      // features[0].setGeometry(geom);
      // features[0].getGeometry().transform('EPSG:4326', 'EPSG:3857')
      // featureOverlay.getSource().clear();
      // featureOverlay.getSource().addFeatures(features);
      // overlay.setPosition(evt.coordinate);
      // content.innerText = features[0].H.zone_name;
      // container.style.display = 'block';
      // console.log(overlay);
    }
    // } else {
    //   featureOverlay.getSource().clear();
    //   container.style.display = 'none';
    // }

  })
}
});

//  map.on('singleclick', function(evt) {
//   var depths = [];
//   for (var i = 0; i < surge_layers.length; i++) {
//     var x = surge_layers[i].getGetFeatureInfoUrl(
//       evt.coordinate, viewResolution, 'EPSG:3857',
//       {'INFO_FORMAT': 'application/json', 'DIM_MAX_COLS': surge_layers[i].getParams()['DIM_MAX_COLS']}
//     );
//     var y = $.get(x, function(data, textStatus, jqXHR){
//       var featuredata = data.features[0].properties;
//     var surgeDepths = {"file": this.url.substring(this.url.indexOf('D'), this.url.indexOf('D') + 19), 
//     // "depth": data.features[0].properties['GRAY_INDEX'
//   }
//   console.log(featuredata);
//   console.log(surgeDepths);
//     depths.push(surgeDepths);
//   });
//   }
//   console.log(depths);
//    });

