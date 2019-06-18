var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})
// create source from TileWMS source 

var locationtypeid = 1;
var title = "Texas";
var grid = 'tx3'

var basinLayer = new ol.layer.Tile({
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

var leveeLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS(/** @type {olx.source.TileWMSOptions} */ ({
    url: 'https://hvx-mapserver.hurrevac.com/geoserver/wms',
    params: {
      'LAYERS': 'nhp:levee_view',
      'TILED': true,
      'VERSION': '1.1.0',
      'FORMAT': 'image/png8',
      'viewparams': 'grid:' + grid +';'
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  })),
});




// create map
var map = new ol.Map({
  layers: [raster, basinLayer, leveeLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [0, 0],
    zoom: 1
  }),
  
});

















