var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})

var map = new ol.Map({
  layers: [raster],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-97.6114, 38.8403], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5,
  }),
});