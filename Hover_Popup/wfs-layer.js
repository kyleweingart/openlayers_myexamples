var serviceUrl = 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/' +
  'NOS_Observations/CO_OPS_Stations/FeatureServer/';

var layer = '0';

var esrijsonFormat = new ol.format.EsriJSON();

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

// Add a click handler to hide the popup.

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// create vector source from ESRI REST Feature Server - add features to source

var vectorSource = new ol.source.Vector({
  loader: function (extent, resolution, projection) {
    var url = serviceUrl + layer + '/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
        extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
        ',"spatialReference":{"wkid":102100}}') +
      '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
      '&outSR=102100';
    $.ajax({
      url: url, dataType: 'jsonp', success: function (response) {
        if (response.error) {
          alert(response.error.message + '\n' +
            response.error.details.join('\n'));
        } else {
          // dataProjection will be read from document
          var features = esrijsonFormat.readFeatures(response, {
            featureProjection: projection
          });
          if (features.length > 0) {
            vectorSource.addFeatures(features);
          }
        }
      }
    });
  },
  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
    tileSize: 512
  }))
});

// create vector layer to display features in vector source
var vector = new ol.layer.Vector({
  source: vectorSource,
  style: tideStyle
});

// add basemap
var raster = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  })
});

// create map
var map = new ol.Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-97.6114, 38.8403], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5
  }),
  overlays: [overlay]
});

// create overlay for mouseover highlight of feature
var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector,
  map: map,
  style: highlightStyle
});

// switch between styles when feature mouseover event is called
var highlight;
var displayFeatureInfo = function (pixel, coordinates) {

  var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    // console.log(feature)
    return feature;
  });

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

// mouseover event listener
map.on('pointermove', function (e) {
  if (e.dragging) {
    $(element).popover('destroy');
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
  displayFeatureInfo(pixel);
});


// add click handler to the map to render the popup.
var featureHover;
map.on('pointermove', function(evt) {
  featureHover = map.forEachFeatureAtPixel(evt.pixel, function(feature,layer) {
  console.log(feature);
  return feature;
  });

  if (featureHover) {
    console.log(featureHover.getProperties().name) 
    overlay.setPosition(evt.coordinate);
    content.innerHTML = featureHover.getProperties().name;
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
  // var coordinate = evt.coordinate;
  // var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
      // coordinate, 'EPSG:3857', 'EPSG:4326'));

  // content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
  //     '</code>';
  // overlay.setPosition(coordinate);
});

