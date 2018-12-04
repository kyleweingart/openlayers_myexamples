// var serviceUrl = 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/' +
//   'NOS_Observations/CO_OPS_Stations/FeatureServer/';

// var layer = '0';



// create triangle shape
var image = new ol.style.RegularShape({
  points: 3,
  radius: 10,
  fill: new ol.style.Fill({ color: '#2f4f4f' }),
  stroke: new ol.style.Stroke({ color: '#6d8383', width: 1 })
});

// apply shape to style
var tideStyle = new ol.style.Style({
  image: image
});

// create bigger shape to be used with mouseover event
var highlightImage = new ol.style.RegularShape({
  points: 3,
  radius: 15,
  fill: new ol.style.Fill({ color: 'black' }),
  stroke: new ol.style.Stroke({ color: 'gray', width: 2 }),
});

// apply shape to new style
var highlightStyle = new ol.style.Style({
  image: highlightImage
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

// create vector source from ESRI REST Feature Server - add features to source

var wmsSource = new ol.source.TileWMS({
  url: 'https://ahocevar.com/geoserver/wms',
  params: { 'LAYERS': 'ne:ne' },
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

// create vector layer to display features in vector source
var wmsLayer = new ol.layer.Tile({
  source: wmsSource,
  // style: tideStyle
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
// var featureOverlay = new ol.layer.Vector({
//   source: new ol.source.Vector,
//   map: map,
//   style: highlightStyle
// });

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

// mouseover event listener
map.on('pointermove', function (e) {
  if (e.dragging) {
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.forEachLayerAtPixel(pixel, function () {
    return true;
  });
  map.getTarget().style.cursor = hit ? 'pointer' : '';
  if (hit) {
    var layerHover = wmsSource.getGetFeatureInfoUrl(e.coordinate, viewResolution, viewProjection,
      { 'INFO_FORMAT': 'text/html' , 'propertyName': 'name'});
    overlay.setPosition(e.coordinate);
    content.innerHTML ='<object type="text/html" data="' + layerHover + '"></object>';
    // content.innerHTML = '<iframe seamless src="' + layerHover + '"></iframe>';
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
});


var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();

// add click handler to the map to render the popup.

map.on('singleclick', function (evt) {
  
  var url = wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    { 'INFO_FORMAT': 'text/html',
  'propertyName': 'name' });
  if (url) {
    console.log(url);
    overlay.setPosition(evt.coordinate);
    content.innerHTML = '<iframe seamless src="' + url + '"></iframe>';
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
});

