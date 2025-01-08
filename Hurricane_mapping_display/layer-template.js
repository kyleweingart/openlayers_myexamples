fetch('./error_cone.geojson')
.then(response => {
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON file: ${response.statusText}`);
  }
  return response.json();
})


var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})

var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    // url: 'https://data.hurrevac.com/excessive/Day_1_Excessive_Rainfall_Outlook_LATEST.kml',
    url: 'http://localhost:8082/Excessive_Rainfall_Outlook/Excessive_Rain_Day1_latest.kml',
    crossOrigin: 'anonymous',
    format: new ol.format.KML({
      extractStyles: false,
      extractAttributes: true
    }),
    projection: 'EPSG:3857'
  }),
  style: styleFunction
});

var rainStyles = {
  default: new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'black', width: 2 })
  }),
  mrgl: new ol.style.Style({
    fill: new ol.style.Fill({ color: [128, 230, 128, .9] }),
    stroke: new ol.style.Stroke({ color: [0, 139, 0, .9], width: 2 })
  }),
  slgt: new ol.style.Style({
    fill: new ol.style.Fill({ color: [247, 247, 128, .9] }),
    stroke: new ol.style.Stroke({ color: [255, 130, 71, .9], width: 2 })
  }),
  mdt: new ol.style.Style({
    fill: new ol.style.Fill({ color: [255, 128, 128, .9] }),
    stroke: new ol.style.Stroke({ color: [205, 0, 0, .9], width: 2 })
  }),
  high: new ol.style.Style({
    fill: new ol.style.Fill({ color: [255, 128, 255, .9] }),
    stroke: new ol.style.Stroke({ color: [255, 0, 255, .9], width: 2 })
  }),
}

function styleFunction(feature) {
  var outlook = feature.get('OUTLOOK');
  if (outlook === 'Marginal (5-10%)') {
    return rainStyles.mrgl;
  } else if (outlook === 'Slight (10-20%)') {
    return rainStyles.slgt;
  } else if (outlook === 'Moderate (20-50%)') {
    return rainStyles.mdt;
  } else if (outlook === 'High (>50%)') {
    return rainStyles.high;
  } else {
    return rainStyles.default;
  }
}


var map = new ol.Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  
  view: new ol.View({
    center: [0, 3000000],
    zoom: 2

  }),
});



  


