// elements that make up the popup

// var container = $('#popup');
var container = document.getElementById('popup');
// var content = $('#popup-content');
var content = document.getElementById('popup-content');
// var closer = $('#popup-closer');
// var closer = document.getElementById('popup-closer');

// create an overlay to anchor the popup to the  map

var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

// basemap grayscale
var basemap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'OSM',
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
    })
});


// Current Tiger with State, County, County Labels as Images - superior labeling/cartography
var wmsCurrentTigerImage = new ol.layer.Image({
    source: new ol.source.ImageArcGISRest({
        params: {
            'LAYERS':"show:84,86,87"
        },
        url: 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer'
    })
})

const testLayer = new ol.layer.Image({
    name: 'testLayer',
    source: new ol.source.ImageWMS({
      url: 'https://dev-hvx.hurrevac.com/geoserver/wms',
      params: {
        'LAYERS': `aux:wsp_cumulative_2019`,
        'CQL_FILTER': `ref_time = '2019-09-01 00:00:00' and offset = '120' and windspeed = '34kt'`
      },
      projection: 'EPSG:3857',
      serverType: 'geoserver',
      crossOrigin: 'anonymous',
    }),
  });

var map = new ol.Map({
    layers: [wmsCurrentTigerImage, testLayer],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        zoom: 3
    }),
    overlays: [overlay]
});

var parser = new ol.format.WMSGetFeatureInfo();
var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();


map.on('singleclick', function (evt) {
    console.log(evt.coordinate);
    var url = testLayer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
      {
        'INFO_FORMAT': 'application/vnd.ogc.gml',
      });
    $.ajax({
      type: 'GET',
      url: url
    }).done(function (data) {
        console.log(data);
      var features = parser.readFeatures(data);
      console.log(features);
      if (features.length > 0) {
        console.log(features);
        var prob = features[0].H.GRAY_INDEX;
        console.log(prob);
        overlay.setPosition(evt.coordinate);
        content.innerText = features[0].H.GRAY_INDEX;
        container.style.display = 'block';
      } else {
        featureOverlay.getSource().clear();
        container.style.display = 'none';
      }
  
    })
  });
