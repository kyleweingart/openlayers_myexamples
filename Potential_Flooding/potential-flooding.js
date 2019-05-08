

  var imgSource = new ol.source.TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {
        'LAYERS': 'nhp:GORDON_2018_adv08_e10_ResultRaster',
      },
      ratio: 1,
      serverType: 'geoserver'
  });

  var img2Source = new ol.source.TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {
        'LAYERS': 'nhp:HERMINE_2016_adv21_e10_ResultRaster',
      },
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
    new ol.layer.Tile({
      source: img2Source
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
