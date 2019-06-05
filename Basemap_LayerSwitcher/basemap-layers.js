var baselayers = new ol.layer.Group({
  title: 'Base Layers',
  openInLayerSwitcher: true, 
  layers: [
    new ol.layer.Tile({
      title: "Basic",
      baselayer: true,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Bright",
      baselayer: true,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
  ]
})
// create source from TileWMS source 

var locationtypeid = 1;
var title = "Texas";

// var basinLayer = new ol.layer.Tile({
//   source: new ol.source.TileWMS(/** @type {olx.source.TileWMSOptions} */ ({
//     url: 'https://hvx-mapserver.hurrevac.com/geoserver/wms',
//     params: {
//       'LAYERS': 'nhp:Locations',
//       'TILED': true,
//       'VERSION': '1.1.0',
//       'FORMAT': 'image/png8',
//       'viewparams': 'typeid:' + locationtypeid + ';val:' + title + ';'
//     },
//     serverType: 'geoserver',
//     crossOrigin: 'anonymous'
//   })),
// });



// create map
var map = new ol.Map({
  layers: [raster, basinLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [0, 0],
    zoom: 1
  }),
  
});

var ctrl = new ol.control.LayerSwitcher();
ctrl.on('toggle', function(e) {
  console.log('Collapse layerswitcher', e.collapsed);
});
map.addControl(ctrl);

















