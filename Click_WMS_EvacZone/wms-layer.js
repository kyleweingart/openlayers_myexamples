
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

// var evacZoneSource = new ol.source.TileWMS({
//   url: 'https://hvx-mapserver.hurrevac.com/geoserver/gwc/service/wms',
//   params: {
//     'LAYERS': 'nhp:al_baldwinevaczones_baldwin',
//     'TILED': true,
//     'VERSION': '1.1.1',
//     'FORMAT': 'image/png8'
//   },
//   serverType: 'geoserver',
//   crossOrigin: 'anonymous'
// });

var evacZoneSource = new ol.source.TileWMS({
  url: 'https://dev-hvx.hurrevac.com/geoserver/wms',
  params: {
    'LAYERS': 'nhp:nchurricaneevaczones_beaufort',
    'TILED': true,
    'VERSION': '1.1.1',
    'FORMAT': 'image/png8'
  },
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

var usaceDistricts = new ol.source.TileWMS({
  url: 'https://hvx-mapserver.hurrevac.com/geoserver/gwc/service/wms',
  params: {
    'LAYERS': 'nhp:usace_districts',
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

var districtLayer = new ol.layer.Tile({
  source: usaceDistricts,
  title: 'usace-district'
});



// create map
var map = new ol.Map({
  layers: [basemap, wmsLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
    zoom: 7
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

map.on('pointermove', function (e) {
  if (e.dragging) {
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.forEachLayerAtPixel(pixel, function (layer) {
    return layer;
  }, null, function (layer) {
    var layerName = layer.get('title');
    return (layerName === 'evacZone');
  });
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});



// add click handler to the map to render the popup.
// this logic has been added to the below click event but I left this here to 
// show additional methods/formats

// map.on('singleclick', function (evt) {
//   var url = evacZoneSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
//     {
//       'INFO_FORMAT': 'application/json',
//       'propertyName': 'name'
//     });
//   $.ajax({
//     type: 'GET',
//     url: url
//   }).done(function (data) {
//     if (data.features.length > 0) {
//       overlay.setPosition(evt.coordinate);
//       content.innerText = data.features[0].properties.zone_name;
//       container.style.display = 'block';
//     } else {
//       container.style.display = 'none';
//     }
//   });
// });

// add click handler to highlight the selected feature

map.on('singleclick', function (evt) {
  console.log(evt.coordinate);
  var url = evacZoneSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    {
      'INFO_FORMAT': 'application/vnd.ogc.gml',
    });
  $.ajax({
    type: 'GET',
    url: url
  }).done(function (data) {
    var features = parser.readFeatures(data);
    if (features.length > 0) {
      console.log(features);
      // below works but has generalized data
      // geom = features[0].H.geom;
      // features[0].setGeometry(geom);
      features[0].getGeometry().transform('EPSG:4326', 'EPSG:3857')
      featureOverlay.getSource().clear();
      featureOverlay.getSource().addFeatures(features);
      overlay.setPosition(evt.coordinate);
      content.innerText = features[0].H.zone_name;
      container.style.display = 'block';
      console.log(overlay);
    } else {
      featureOverlay.getSource().clear();
      container.style.display = 'none';
    }

  })
});

// Try this same functionality out with WFS

