import 'ol/ol.css';
import KML from 'ol/format/KML';
import {Map, View} from 'ol';
import VectorSource from 'ol/source/Vector';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import {Fill, Stroke, Style} from 'ol/style';


const hour_six = require('./6hr.kml');
// const hour_six = require('./6hr.kml');
// const hour_six = require('./6hr.kml');
// const hour_six = require('./6hr.kml');
// const hour_six = require('./6hr.kml');
// const hour_six = require('./6hr.kml');

var createRainfallKMLLayer = (timePeriod) => {
  const url = hour_six;

  var layer = new VectorLayer({
    source: new VectorSource({
    url: url,
      crossOrigin: 'anonymous',
      format: new KML({
        // extractStyles: false,
        extractAttributes: true
      }),
      projection: 'EPSG:3857',
    }),
    name: 'rainfallKML' + timePeriod
  });
  return layer;
}


var checkboxesRainfallKML = document.forms["rainfallKMLForm"].elements["rainfallKML"];
for (var i = 0; i < checkboxesRainfallKML.length; i++) {
  checkboxesRainfallKML[i].onclick = function () {
    var timePeriod = this.value;
    if (this.checked === true) {
      const mapLayer = createRainfallKMLLayer(timePeriod);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'rainfallKML' + timePeriod) {
          map.removeLayer(layer);
        }
      })

    }
  }
}

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
   
    zoom: 0
  })
});