var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})
// create source from TileWMS source 

var createdLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS(/** @type {olx.source.TileWMSOptions} */ ({
    url: 'https://hvx-mapserver.hurrevac.com/geoserver/wms',
    params: {
      'LAYERS': 'nhp:Locations',
      'TILED': true,
      'VERSION': '1.1.0',
      'FORMAT': 'image/png8',
      'viewparams': 'typeid:' + locationtypeid + ';val:' + title + ';'
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  })),
});

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
  layers: [raster],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [0, 0],
    zoom: 1
  }),
  
});

















