

  var imgSource = new ol.source.TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {
        'LAYERS': 'nhp:ALBERTO_2018_adv10_e10_ResultRaster',
      },
      ratio: 1,
      serverType: 'geoserver'
  });

  var img2Source = new ol.source.TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {
        'LAYERS': 'nhp:FLORENCE_2018_adv60_e10_ResultRaster',
      },
      ratio: 1,
      serverType: 'geoserver'
  });

  var imgSource3 = new ol.source.ImageWMS({
    // crossOrigin: 'anonymous',
    url: 'http://localhost:8080/geoserver/wms',
    params: {
      'LAYERS': 'nhp:Alberto_flood_mosaic', 
      'DIM_FILE_NAME': 'adv10_'},
    ratio: 1,
    serverType: 'geoserver'
  });

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    // new ol.layer.Tile({
    //   source: imgSource
    // }),
    // new ol.layer.Tile({
    //   source: img2Source
    // }),
    new ol.layer.Image({
      source: imgSource3
    })
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
