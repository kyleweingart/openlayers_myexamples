
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

var evacZoneSource = new ol.source.TileWMS({
  url: 'https://hvx-mapserver.hurrevac.com/geoserver/gwc/service/wms',
  params: { 
    'LAYERS': 'nhp:al_baldwinevaczones_baldwin',
    'TILED': true,
    'VERSION': '1.1.1',
    'FORMAT': 'image/png8'
  },
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

// add basemap grayscale
var basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: 'OSM',
    url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  })
});

// create vector layer to display features in vector source
var wmsLayer = new ol.layer.Tile({
  source: evacZoneSource,
  title: 'evacZone'
});

// create map
var map = new ol.Map({
  layers: [basemap, wmsLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
    zoom:7
  }),
  overlays: [overlay]
});

// create overlay for mouse click highlight of feature
var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector,
  map: map,
  style: highlightImage
});

var parser = new ol.format.WMSGetFeatureInfo();
var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();



// map.on('pointermove', function (e) {
//   if (e.dragging) {
//     return;
//   }
//   var pixel = map.getEventPixel(e.originalEvent);
//   var hit = map.forEachLayerAtPixel(pixel, function () {
//     return true;
//   });
//   map.getTarget().style.cursor = hit ? 'pointer' : '';
// });



// add click handler to the map to render the popup.

map.on('singleclick', function (evt) {
  var url = evacZoneSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
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
  })
});

