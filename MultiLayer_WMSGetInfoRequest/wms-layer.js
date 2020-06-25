
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

var toaArrivalGraphic = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'http://127.0.0.1:8082/MultiLayer_WMSGetInfoRequest/AL682014_34_earliest_reasonable_toa_34.kml',
    format: new ol.format.KML({
      extractStyles: false,
      extractAttributes: true
    }),
    projection: 'EPSG:3857',
  }),
  // maxResolution: 10000,
  // style: styleFunction
});

// add basemap grayscale
var basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: 'OSM',
    url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  })
});


// create map
var map = new ol.Map({
  layers: [basemap, toaArrivalGraphic],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
    zoom: 4
  }),
  overlays: [overlay]
});

var parser = new ol.format.WMSGetFeatureInfo();
var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();

var toaTodSource = new ol.source.ImageWMS({
  url: 'https://dev-hvx.hurrevac.com/geoserver/wms',
  params: {
    'LAYERS': 'aux:TOA227,aux:TOA228,aux:TOD229,aux:TOD230,aux:TOA227,aux:TOA228,aux:TOD229,aux:TOD230',
    'CQL_FILTER': `stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '34kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '34kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '34kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '34kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '50kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '50kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '50kt';
    stormid = 'AL052019' AND adv = 'adv032' AND windspeed = '50kt'`,
    'FEATURE_COUNT': 8,
  },
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});


// add click handler to the map to render the popup.
map.on('singleclick', function (evt) {
  console.log(evt.coordinate);
  var url = toaTodSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    {
      'INFO_FORMAT': 'application/json',
      // 'propertyName': 'GRAY_INDEX'
    });
  $.ajax({
    type: 'GET',
    url: url
  }).done(function (data) {
    console.log(data);
    if (data.features.length > 0) {
      overlay.setPosition(evt.coordinate);
      data.features.forEach(function(feature) {
        content.innerHTML += `<span>${feature.properties.GRAY_INDEX}</span><br>`;
      })
      // content.innerText = data.features[0].properties.GRAY_INDEX;
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  });
});



