

  var imgSource = new ol.source.TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {
        'LAYERS': 'nhp:GORDON_2018_adv08_e10_ResultRaster',
        'VERSION:': '1.1.1',
        'FORMAT': 'image/gif'
      },
      projection: 'EPSG:3857',
      ratio: 1,
      serverType: 'geoserver'
  });

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    new ol.layer.Tile({
      source: imgSource
    }),
    // new ol.layer.Image({
    //   source: testSource
    // })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-81.97, 26.49]),
    zoom:5
  }),
});

// source: new ol.source.ImageWMS({
//   url: 'http://localhost:8080/geoserver/nhp/wms',
//   params: {
//       'LAYERS': 'nhp:geotiff_data',
//       'VERSION': '1.1.1',
//       'FORMAT': 'image/gif'
//   },
//   projection: 'EPSG:3857',