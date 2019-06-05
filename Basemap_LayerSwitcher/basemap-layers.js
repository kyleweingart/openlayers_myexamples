// example built using http://viglino.github.io/ol-ext/examples/control/map.switcher.html



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
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/bright/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Dark Matter",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Satellite Hybrid",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Pastel",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.jpg?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Positron",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Streets",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Topo",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Topographique",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/topographique/{z}/{x}/{y}.jpg?key=ObSsrALQoq76W5lDXT4v',
        crossOrigin: 'anonymous'
      })
    }), 
    new ol.layer.Tile({
      title: "Voyager",
      baselayer: true,
      visible: false,
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/voyager/{z}/{x}/{y}.png?key=ObSsrALQoq76W5lDXT4v',
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
  layers: [baselayers],
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

















