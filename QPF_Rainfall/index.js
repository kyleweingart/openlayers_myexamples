import 'ol/ol.css';
import KML from 'ol/format/KML';
import {Map, View} from 'ol';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
// import {Fill, Stroke, Style} from 'ol/style';

const timeObject = {
  hourSix: require('./hourSix.kml'),
  dayOne: require('./dayOne.kml'),
  dayTwo: require('./dayTwo.kml'),
  dayThree: require('./dayThree.kml'),
  dayFourFive: require('./dayFourFive.kml'),
  daySixSeven: require('./daySixSeven.kml'),
  cumDayOneTwo: require('./cumDayOneTwo.kml'),
  cumDayOneTwoThree: require('./cumDayOneTwoThree.kml'),
  cumDayOneTwoThreeFourFive: require('./cumDayOneTwoThreeFourFive.kml'),
  cumDayOneTwoThreeFourFiveSixSeven: require('./cumDayOneTwoThreeFourFiveSixSeven.kml')
}

var createRainfallKMLLayer = (timePeriod) => {
  const url = timeObject[timePeriod];
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

var createGrib2Layer = (time) => {

  console.log('Grib2layer');
  var url = 'http://localhost:8080/geoserver/wms';

  if (time === '24') {
      var layers = 'Total_precipitation_surface_24_Hour_Accumulation'
  }   else if (time === '48') {
      var layers = 'Total_precipitation_surface_48_Hour_Accumulation'
  }   else if (time === '72') {
      var layers = 'Total_precipitation_surface_72_Hour_Accumulation'
  }

  var layer = new TileLayer({
      source: new TileWMS({
          url: url,
          params: {
              'LAYERS': 'nhp:' + layers,
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png8',
              'projection': 'EPSG:3857'
            //  ' TIME': '2018-10-10T00:00:00Z'
          }
      }),
      name: "rainfallGrib2" + time,
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
  });
  return layer;
}

var checkboxesRainfallGrib = document.forms["rainfallGrib2Form"].elements["rainfallGrib"];
for (var i = 0; i < checkboxesRainfallGrib.length; i++) {
  checkboxesRainfallGrib[i].onclick = function () {
    var timePeriod = this.value;
    if (this.checked === true) {
      const mapLayer = createGrib2Layer(timePeriod);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'rainfallGrib2' + timePeriod) {
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