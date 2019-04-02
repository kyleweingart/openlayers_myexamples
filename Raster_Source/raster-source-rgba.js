
 var codes = [];
 
 codes.push('nnw320i1');
 codes.push('wnw320i1');
 codes.push('w320i1');
 codes.push('e320i1');
 codes.push('ene320i1');
 codes.push('nne320i1');

 var surge_layers = [];

 for (var i = 0; i < codes.length; i++){
   var imgLayer = new ol.source.ImageWMS({
     crossOrigin: 'anonymous',
     url: 'http://localhost:8080/geoserver/wms',
     params: {'LAYERS': 'test:sf1', 'DIM_MAX_COLS': codes[i]},
     ratio: 1,
     serverType: 'geoserver'
   });

   surge_layers.push(imgLayer);
 }
 

 function getMaxDepth(inputs, data) {
   var dataArray = [];
   var width = inputs[0].width;
   var height = inputs[0].height;
   for (var i = 0; i < inputs.length; i++ ) {
     dataArray.push(inputs[i].data);
   }

   //Maps RGB values to levels. Must correspond to style
   var colorMap = {};
   colorMap[[[parseInt('00',16)],[parseInt('00',16)],[parseInt('FF',16)]]] = 1;  //#0000FF - Depth 1
   colorMap[[[parseInt('00',16)],[parseInt('55',16)],[parseInt('FF',16)]]] = 2;  //#0055FF - Depth 2
   colorMap[[[parseInt('00',16)],[parseInt('AA',16)],[parseInt('FF',16)]]] = 3;  //#00AAFF - Depth 3
   colorMap[[[parseInt('00',16)],[parseInt('FF',16)],[parseInt('FF',16)]]] = 4;  //#00FFFF - Depth 4
   colorMap[[[parseInt('55',16)],[parseInt('FF',16)],[parseInt('AA',16)]]] = 5;  //#55FFAA - Depth 5
   colorMap[[[parseInt('AA',16)],[parseInt('FF',16)],[parseInt('55',16)]]] = 6;  //#AAFF55 - Depth 6
   colorMap[[[parseInt('FF',16)],[parseInt('FF',16)],[parseInt('00',16)]]] = 7;  //#FFFF00 - Depth 7
   colorMap[[[parseInt('FF',16)],[parseInt('AA',16)],[parseInt('00',16)]]] = 8;  //#FF5500 - Depth 8
   colorMap[[[parseInt('FF',16)],[parseInt('55',16)],[parseInt('00',16)]]] = 9;  //#FFAA00 - Depth 9
   colorMap[[[parseInt('FF',16)],[parseInt('00',16)],[parseInt('00',16)]]] = 10; //#FF0000 - Depth 10
   colorMap[[[parseInt('AA',16)],[parseInt('00',16)],[parseInt('00',16)]]] = 11; //#AA0101 - Depth 11

   function within(val, target, range) {
       return (val > target - range && val < target + range)
   }
   
   function toExactVal(val) {
     var range = 5;
     if (within(val, parseInt('FF',16), range)) {
       return parseInt('FF',16)
     } else if (within(val, parseInt('AA',16), range)) {
       return parseInt('AA',16)
     } else if (within(val, parseInt('55',16), range)) {
       return parseInt('55',16)
     } else  {
       return 0;
     }
   }
   function toDepth(rgb, colorMap) {
     var exact_rgb = [toExactVal(rgb[0]),toExactVal(rgb[1]),toExactVal(rgb[2])];
     var depth = colorMap[exact_rgb];
     if (typeof depth === "undefined") {
       depth = 0;
     }
     return depth;
   }

   var max = dataArray.reduce(function(final, current) {
     console.log(final.length);
     for (var i = 0; i < final.length; i = i+4) {
       //Only compare if current isn't completely transparent
       if (current[i+3] > 0) {
         var current_rgba = [current[i], current[i+1], current[i+2], current[i+3]];
         var final_rgba = [final[i], final[i+1], final[i+2], final[i+3]];

         var current_depth = toDepth(current_rgba, colorMap);
         var final_depth = toDepth(final_rgba, colorMap);

         if (typeof current_depth === "undefined") {
           current_depth = 0;
         }
         if (typeof final_depth === "undefined") {
           final_depth = 0;
         }

         if (current_depth > final_depth) {
           final[i] = current[i];     //R
           final[i+1] = current[i+1]; //G
           final[i+2] = current[i+2]; //B
           final[i+3] = current[i+3]; //A
         }
       }
     }
     return final;
   });
   console.log(max);
  //  work on solution to only return final max so artifacts do not get rendered
   return {data: max, width: width, height: height};
 }

 var raster = new ol.source.Raster({
   sources: surge_layers,
   operationType: 'image',
   operation: getMaxDepth,
   threads: 0

 });

 var view = new ol.View({
   center: [-9018025.746879461, 2927045.4641722036],
     zoom: 10
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

 surgeImage.on('beforeoperations', function(event) {
   var data = event.data;
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
    }
  })
}
});



