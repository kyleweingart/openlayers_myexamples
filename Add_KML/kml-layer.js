// elements that make up the popup

// var container = $('#popup');
var container = document.getElementById('popup');
// var content = $('#popup-content');
var content = document.getElementById('popup-content');
// var closer = $('#popup-closer');
var closer = document.getElementById('popup-closer');

// create an overlay to anchor the popup to the  map

var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
})


// add basemap grayscale
// var raster = new ol.layer.Tile({
//   source: new ol.source.XYZ({
//     attributions: 'OSM',
//     url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
//   })
// });

// add basemap
// var raster = new ol.layer.Tile({
//   source: new ol.source.XYZ({
//     attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
//       'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
//     url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
//       'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
//   })
// });



var vector = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'http://127.0.0.1:8082/AL682014_34_earliest_reasonable_toa_34.kml',
    format: new ol.format.KML({
      extractStyles: false,
      extractAttributes: true
    }),
    projection: 'EPSG:3857',
  }),
  style: styleFunction
});

function styleFunction(feature) {
  var style = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
    text: new ol.style.Text({
      font: '12px Calibir, sans-serif',
      text: getText(vector),
      textAlign: 'center',
      textBaseline: 'top',
      placement: 'line',
      rotation: 30
    }),

  })
  return style;
}


function getText(layer) {
  var descriptionText;
  var source = layer.getSource();
  source.forEachFeature(function (feature) {
    if (feature.H.description == null) {
      console.log('undefined');
      descriptionText;
    } else {
      var description = (feature.H.description).replace(/<(?:.|\n)*?>/gm, '');
      descriptionText = description.trim();
      console.log(descriptionText);
      // return descriptionText;
    }
  })
  return descriptionText;
}











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
      zoom: 5,
      overlays: [overlay]
    })
  });

  var displayFeatureInfo = function (pixel, coordinates) {

    var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      // console.log('feature');
      console.log(feature.H.description);
      return feature;
    });

  };

  map.on('pointermove', function (e) {
    if (e.dragging) {
      $(element).popover('destroy');
      return;
    }
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTarget().style.cursor = hit ? 'pointer' : '';
    // displayFeatureInfo(pixel);
  });

  var featureHover;
  map.on('pointermove', function (evt) {
    featureHover = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      console.log(feature);
      console.log(feature.H.description);
      return feature;
    });

    if (featureHover) {
      console.log('hovering');
      overlay.setPosition(evt.coordinate);
      content.innerHTML = featureHover.H.description;
      // content.innerHTML = featureHover.getProperties().name;
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  });

