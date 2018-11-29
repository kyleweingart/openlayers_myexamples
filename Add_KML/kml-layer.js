// elements that make up the popup

// var container = $('#popup');
var container = document.getElementById('popup');
// var content = $('#popup-content');
var content = document.getElementById('popup-content');
// var closer = $('#popup-closer');
var closer = document.getElementById('popup-closer');

// create an overlay to anchor the popup to the  map
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});


var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})

// add basemap grayscale
// var raster = new ol.layer.Tile({
//   source: new ol.source.XYZ({
//     attributions: 'OSM',
//     url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
//   })
// });

var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'http://127.0.0.1:8082/AL682014_34_earliest_reasonable_toa_34.kml',
    format: new ol.format.KML({
      extractStyles: false,
      extractAttributes: true
    }),
    projection: 'EPSG:3857',
  }),
  // maxResolution: 10000,
  style: styleFunction
});

// function to trim the description field in the kml
function trimDescription(feature) {
  var description = feature.get('description');
  if (description) {
    description = description.replace(/<(?:.|\n)*?>/gm, '');
    var trimDescription = description.trim();
    if (trimDescription !== 'Wind Speed Probability 5% contour') {
      var textDescription = trimDescription;
      return textDescription;
    }
  }
}

var getText = function (feature, resolution) {
  maxResolution = 10000;
  if (resolution > maxResolution) {
    textDescription = '';
  } else {
    textDescription = trimDescription(feature);
  }
  return textDescription;
}

var textSize = function (resolution) {
  if (resolution < 10000 && resolution > 6500){
    font = '16px Calibir, sans-serif';
  } else if (resolution < 6500 && resolution > 3000){
    font = '20px Calibir, sans-serif';
  } else if (resolution < 3000){
    font = '24px Calibir, sans-serif';
  }
  return font;
}

var getTextAngle = function (feature) {
  var angles = [];
  var geoms = feature.H.geometry.B;
  var geomsFilter = geoms.filter(geoms => geoms !== 0);
  geomsFilter = geomsFilter.map(geomsFilter => parseFloat(geomsFilter.toFixed(2)));
  // console.log(geomsFilter);
  for (var i = 0; i < geomsFilter.length - 3; i += 2) {
    var x = geomsFilter[i];
    // console.log('x: ' + x);
    var y = geomsFilter[i + 1];
    // console.log('y: ' + y);
    var ex = geomsFilter[i + 2];
    // console.log('ex: ' + ex);
    var ey = geomsFilter[i + 3];
    // console.log('ey: ' + ey);
    var disty = ey - y;
    // console.log('disty: ' + disty);
    var distx = ex - x;
    // console.log('distx: ' + distx);
    var theta = Math.atan2(disty, distx);
    // theta *= 180/Math.PI;
    // if (theta < 0) theta = 360 + theta;
    // console.log(theta);
    angles.push(theta);
  }
  var avgAngle = angles.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  ) / angles.length;
  // might be able to add a function that looks at the geomCoords and decides the proper orientation of the labels ( if storm is moving west vs east the labels should be stacked differently)
  var negAvgAngle = -Math.abs(avgAngle);
  return negAvgAngle;
}


var styleCache = {};
// refactor this code - look at label examples in openlayers docs
function styleFunction(feature, resolution) {
  var font = textSize(resolution);
  // var textFill = new ol.style.Fill({
  //   color: '#fff'
  // });
  // var textStroke = new ol.style.Stroke({
  //   color: 'rgba(0, 0, 0, 0.6)',
  //   width: 3
  // });
  if (!styleCache[font]) {}
  styleCache[font] = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'black', width: 2 }),
    text: new ol.style.Text({
      font: font,
      offsetX: -10,
      text: getText(feature, resolution),
      textAlign: 'center',
      // textBaseline: 'top',
      placement: 'line',
      rotation: getTextAngle(feature),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0.6'
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 3
      })
    }),

  })
  console.log(styleCache);
  return [styleCache[font]];
}


// function to get average angle of a line 
// all logic for this function has been pushed to the styleFunction- left here as an example
// function getAngle(layer) {
//   var geomCoords = [];
//   var geomAngles = [];
//   source = layer.getSource()
//   source.forEachFeature(function (feature) {
//     if (feature.H.description) {
//       var geoms = feature.H.geometry.B;
//       var geomsFilter = geoms.filter(geoms => geoms !== 0);
//       geomsFilter = geomsFilter.map(geomsFilter => parseFloat(geomsFilter.toFixed(2)));
//       geomCoords.push(geomsFilter);
//     }
//   })
//   for (var i = 0; i < geomCoords.length; i++) {
//     console.log(i);
//     var angles = [];
//     for (var j = 0; j < geomCoords[i].length - 3; j += 2) {
//       var x = geomCoords[i][j];
//       // console.log('x: ' + x);
//       var y = geomCoords[i][j + 1];
//       // console.log('y: ' + y);
//       var ex = geomCoords[i][j + 2];
//       // console.log('ex: ' + ex);
//       var ey = geomCoords[i][j + 3];
//       // console.log('ey: ' + ey);
//       var disty = ey - y;
//       // console.log('disty: ' + disty);
//       var distx = ex - x;
//       // console.log('distx: ' + distx);
//       var theta = Math.atan2(disty, distx);
//       // theta *= 180/Math.PI;
//       // if (theta < 0) theta = 360 + theta;
//       console.log(theta);
//       angles.push(theta);
//     }
//     // might be able to add a function that looks at the geomCoords and decides the proper orientation of the labels ( if storm is moving west vs east the labels should be stacked differently)
//     var avgAngle = angles.reduce(
//       (accumulator, currentValue) => accumulator + currentValue,
//       0
//     ) / angles.length;
//     geomAngles.push(avgAngle);

//   }

// }

// a good example of me struggling to get feature.description as a label for each feature - needed to do this inside the style function;

// function getText(layer) {
//   var descriptionText;
//   var source = layer.getSource();
//   source.forEachFeature(function (feature) {
//     if (feature.H.description == null) {
//       console.log('undefined');
//       descriptionText;
//     } else {
//       var description = (feature.H.description).replace(/<(?:.|\n)*?>/gm, '');
//       descriptionText = description.trim();
//       console.log(descriptionText);
//       // return descriptionText;
//     }
//   })
//   return descriptionText;
// }

var map = new ol.Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-97.6114, 38.8403], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5,

  }),
  overlays: [overlay]
});

map.on('pointermove', function (e) {
  if (e.dragging) {
    // $(element).popover('destroy');
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});

var featureHover;
map.on('pointermove', function (evt) {
  featureHover = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    textDescription = trimDescription(feature);
    if (textDescription !== undefined) {
      return feature;
    }
  });

  if (featureHover) {
    overlay.setPosition(evt.coordinate);
    content.innerHTML = textDescription;
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
});


