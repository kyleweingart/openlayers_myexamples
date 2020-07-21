
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
    layers: [basemap, wmsCurrentTigerImage, testLayer],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        zoom: 3
    }),
});
