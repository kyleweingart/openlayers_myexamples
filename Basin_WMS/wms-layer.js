var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})
// create source from TileWMS source 

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

















