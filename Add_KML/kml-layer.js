// add basemap
var raster = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  })
});

var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'http://127.0.0.1:8082/AL682014_34_earliest_reasonable_toa_34.kml',
    format: new ol.format.KML(),
  })
});

// var vector = new ol.layer.Vector({
//   source: new ol.source.Vector({
//     url: 'https://openlayers.org/en/v3.20.1/examples/data/kml/2012-02-10.kml',
//     format: new ol.format.KML()
//   })
// });
// create map
var map = new ol.Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-97.6114, 38.8403], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5
  })
});

var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
  console.log(feature);
  return feature;
});



