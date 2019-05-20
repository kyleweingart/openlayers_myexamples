

var imgSource = new ol.source.TileWMS({
  url: 'http://localhost:8080/geoserver/wms',
  params: {
    'LAYERS': 'nhp:ALBERTO_2018_adv02_e10_ResultRaster',
  },
  ratio: 1,
  serverType: 'geoserver'
});

// var img2Source = new ol.source.TileWMS({
//     url: 'http://localhost:8080/geoserver/wms',
//     params: {
//       'LAYERS': 'nhp:FLORENCE_2018_adv60_e10_ResultRaster',
//     },
//     ratio: 1,
//     serverType: 'geoserver'
// });

var imgSource3 = new ol.source.ImageWMS({
  // crossOrigin: 'anonymous',
  url: 'http://localhost:8080/geoserver/wms',
  params: {
    'LAYERS': 'nhp:Alberto_flood_mosaic',
    'DIM_FILE_NAME': 'adv02_'
  },
  ratio: 1,
  serverType: 'geoserver'
});

var imgSource4 = new ol.source.TileWMS({
  url: 'http://localhost:8080/geoserver/wms',
  params: {
    'LAYERS': 'nhp:ALBERTO_2018_adv02_e10_ResultMaskRaster',
  },
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
    // new ol.layer.Image({
    //   source: imgSource3
    // }),
    new ol.layer.Tile({
      source: imgSource4
    })
    // new ol.layer.Image({
    //   source: testSource
    // })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-81.97, 26.49]),
    zoom: 5
  }),
});


var parser = new ol.format.WMSGetFeatureInfo();
var viewResolution = map.getView().getResolution();
var viewProjection = map.getView().getProjection();

map.on('singleclick', function (evt) {
  console.log(evt.coordinate);

  var url = imgSource3.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
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
      console.log(features[0].H.GRAY_INDEX);
    }
  })

  // var url2 = img2Source.getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
  //   {
  //     'INFO_FORMAT': 'application/vnd.ogc.gml',
  //   });
  // $.ajax({
  //   type: 'GET',
  //   url: url2
  // }).done(function (data) {
  //   var features = parser.readFeatures(data);
  //   console.log(features);
  //   if (features.length > 0) {
  //     console.log(features[0].H.GRAY_INDEX);
  //   }
  // })
})
