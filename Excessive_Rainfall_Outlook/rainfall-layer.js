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

var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'http://127.0.0.1:8082/ExcessiveRain_Day1_latest.kml',
    crossOrigin: 'anonymous',
    format: new ol.format.KML({
      extractStyles: false,
      extractAttributes: true
    }),
    projection: 'EPSG:3857'  
  }),
  style: styleFunction
});

var rainStyles = {
  mrgl: new ol.style.Style({
    fill: new ol.style.Fill({color: [128,230,128]})
  }),
  slgt: new ol.style.Style({
    fill: new ol.style.Fill({color: [247,247,128]})
  }),
  mdt: new ol.style.Style({
    fill: new ol.style.Fill({color: [255,128,128]})
  }),
  high: new ol.style.Style({
    fill: new ol.style.Fill({color: [255,128,255]})
  }),
}

function styleFunction(feature) {
  var outlook = feature.get('OUTLOOK');
  if (outlook === 'Marginal (5-10%)') {
    return rainStyles.mrgl;
  } else if (outlook === 'Slight (10-20%)') {
    return rainStyles.slgt;
  } else if (outlook === 'MDT (20-50%)') {
    return rainStyles.mdt;
  } else if (outlook === 'High (50-100%)') {
    return rainStyles.high;
  }
  // var style = new ol.style.Style({
  //   stroke: new ol.style.Stroke({ color: 'black', width: 2 }),
  // });
  return style;
}


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
    return;
  }
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});

var featureHover;
map.on('pointermove', function (evt) {
  featureHover = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    console.log(feature);
    textDescription = feature.get('OUTLOOK');
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

