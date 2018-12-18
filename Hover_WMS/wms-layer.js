
// create bigger stroke to be used with feature mouseclick event
var highlightImage = new ol.style.Style({
  stroke: new ol.style.Stroke({ color: 'gray', width: 2 }),
});

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

// create source from TileWMS source 

var wmsSource = new ol.source.TileWMS({
  url: 'https://ahocevar.com/geoserver/wms',
  params: { 'LAYERS': 'ne:ne' },
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

// create vector layer to display features in vector source
var wmsLayer = new ol.layer.Tile({
  source: wmsSource,
});

// create map
var map = new ol.Map({
  layers: [wmsLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [0, 0],
    zoom: 1
  }),
  overlays: [overlay]
});

// create overlay for mouseover highlight of feature
var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector,
  map: map,
  style: highlightImage
});

var parser = new ol.format.WMSGetFeatureInfo();
var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();

// switch between styles when feature mouseover event is called
// var highlight;
// var displayFeatureInfo = function (pixel, coordinates) {

//   var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
//     // console.log(feature)
//     return feature;
//   });

//   if (feature !== highlight) {
//     if (highlight) {
//       featureOverlay.getSource().removeFeature(highlight);
//     }
//     if (feature) {
//       featureOverlay.getSource().addFeature(feature);
//     }
//     highlight = feature;
//   }
// };

// mouseover event listener to show popup

var mouseCoordinates = [];

map.on('pointermove', function (e) {
  // mouseCoordinates = map.getEventPixel(e.originalEvent);
mouseCoordinates.push(e.coordinate);
clearTimeout();
setTimeout(function () {
  getUrl(mouseCoordinates.length - 1);
  // console.log(typeof(mouseCoordinates.length - 1));
}, 1000);
// return mouseCoordinates;
  // console.log(mouseCoordinates);
});

function getUrl(coordinates) {
  if (mouseCoordinates.length > 0) {
  var url = wmsSource.getGetFeatureInfoUrl(coordinates, viewResolution, viewProjection,
        { 'INFO_FORMAT': 'text/html', 'propertyName': 'name' });
  // console.log(url);    
  mouseCoordinates = [];
  } else {
    return;
  }
}

$('#map').mouseover(function () {
  clearTimeout();
  setTimeout(function () {
    console.log(mouseCoordinates);
  }, 5000);
});


// mouseover event listener to change cursor style on hover
map.on('pointermove', function (e) {
  if (e.dragging) {
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.forEachLayerAtPixel(pixel, function () {
    return true;
  });
  map.getTarget().style.cursor = hit ? 'pointer' : '';
  // if (hit) {
  //   var url = wmsSource.getGetFeatureInfoUrl(e.coordinate, viewResolution, viewProjection,
  //     { 'INFO_FORMAT': 'application/json', 'propertyName': 'name' });
  //   // adding the following lines would use url as the src data to display without the need for ajax request - however the control of display is not as good. 
  //   // content.innerText = '<object type="application/json" data="' + layerHover + '"></object>';
  //   // content.innerHTML = '<iframe seamless src="' + layerHover + '"></iframe>';
  //   $.ajax({
  //     type: 'GET',
  //     url: url
  //   }).done(function (data) {
  //     overlay.setPosition(e.coordinate);
  //     content.innerText = data.features[0].properties.name;
  //     container.style.display = 'block';
  //   });
  // } else {
  //   container.style.display = 'none';
  // }
});



// add click handler to the map to render the popup.

map.on('singleclick', function (evt) {
  var url = wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    {
      'INFO_FORMAT': 'application/json',
      'propertyName': 'name'
    });
  $.ajax({
    type: 'GET',
    url: url
  }).done(function (data) {
    if (data.features.length > 0) {
      overlay.setPosition(evt.coordinate);
      content.innerText = data.features[0].properties.name;
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  });
});

// add click handler to highlight the selected feature

map.on('singleclick', function (evt) {
  console.log(evt.coordinate);
  var url = wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    {
      'INFO_FORMAT': 'application/vnd.ogc.gml',
    });
  $.ajax({
    type: 'GET',
    url: url
  }).done(function (data) {
    var features = parser.readFeatures(data);
    console.log(features);
    featureOverlay.getSource().clear();
    featureOverlay.getSource().addFeatures(features);
    console.log(featureOverlay.getSource().getProjection());
  })
});

