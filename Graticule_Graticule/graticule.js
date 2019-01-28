var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})

var map = new ol.Map({
  layers: [raster],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
    center: [0, 0],
    zoom: 1
  }),
});

var lonFormatter = function (lon) {
  console.log(lon);
  var formattedLon = Math.abs(Math.round(lon * 100) / 100);

  formattedLon += (lon < 0) ? '° W' : ((lon > 0) ? '° E' : '°');
  return formattedLon;
};

var latFormatter = function (lat) {

  var formattedLat = Math.abs(Math.round(lat * 100) / 100);
    formattedLat += (lat < 0) ? '° S' : ((lat > 0) ? '° N' : '°');
    return formattedLat;
  }


var graticule = new ol.Graticule({

  // The style to use for the lines, optional.
  strokeStyle: new ol.style.Stroke({
    color: 'rgba(255,120,0,0.8)',
    width: 2,
    lineDash: [0.5, 4]
  }),
  showLabels: true,

  // Override label position to top
  //  and its textbaseline to top.
  lonLabelFormatter: lonFormatter,
  lonLabelPosition: 1,
  lonLabelStyle: new ol.style.Text({
    font: '11px Calibri,sans-serif',
    textBaseline: 'top',
    offsetY: 3,
    fill: new ol.style.Fill({
      color: 'rgba(0,0,0,1)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(255,255,255,1)',
      width: 3
    })
  }),
  latLabelFormatter: latFormatter,
  // Tweak text size
  latLabelStyle: new ol.style.Text({
    font: '11px Calibri,sans-serif',
    textAlign: 'start',
    textBaseline: 'top',
    offsetX: 1,
    fill: new ol.style.Fill({
      color: 'rgba(0,0,0,1)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(255,255,255,1)',
      width: 3
    })
  })
});

graticule.setMap(map);



