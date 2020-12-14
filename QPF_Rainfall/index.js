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

  // var url = 'http://localhost:8080/geoserver/wms';

  // if (time === 'ERTOA') {
  //   // console.log('strength works')
  //   var layers = 'VAR0-2-227_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  // } else if (strength === 'MLTOA') {
  //   console.log('MLTOA works');
  //   var layers = 'VAR0-2-228_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  // } else if (strength === 'MLTOD') {
  //   var layers = 'VAR0-2-229_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  // } else if (strength === 'LRTOD') {
  //   var layers = 'VAR0-2-230_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  // } else if (strength === 'test') {
  //   var layers = 'cite:test.25'
  // }
  const url = hour_six;

  var layer = new VectorLayer({
    source: new VectorSource({
    //   url: 'https://data.hurrevac.com/excessive/Day_1_Excessive_Rainfall_Outlook_LATEST.kml',
    // url: hour_six,
    url: url,
      crossOrigin: 'anonymous',
      format: new KML({
        // extractStyles: false,
        extractAttributes: true
      }),
      projection: 'EPSG:3857',
    }),
    name: 'rainfallKML' + timePeriod
    // style: styleFunction
  });

  // var layer = new ol.layer.Tile({
  //   source: new ol.source.TileWMS({
  //     url: url,
  //     params: {
  //       // 'LAYERS': 'ncdc:' + layers,
  //       'LAYERS': layers,
  //       'TILED': true,
  //       'VERSION': '1.1.1',
  //       'FORMAT': 'image/png8',
  //       // 'projection': 'EPSG:4326'
  //       // 'TIME': '2018-10-10T00:00:00Z'
  //     }
  //   }),
  //   name: "Grib2 " + strength,
  //   serverType: 'geoserver',
  //   crossOrigin: 'anonymous',
  //   // projection: 'EPSG:4326'
  // });
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


  
  // var vector = new VectorLayer({
  //   source: new VectorSource({
  //   //   url: 'https://data.hurrevac.com/excessive/Day_1_Excessive_Rainfall_Outlook_LATEST.kml',
  //   url: hour_six,
  //     crossOrigin: 'anonymous',
  //     format: new KML({
  //       // extractStyles: false,
  //       extractAttributes: true
  //     }),
  //     projection: 'EPSG:3857'
  //   }),
  //   // style: styleFunction
  // });
  
  // var rainStyles = {
  //   default: new Style({
  //     stroke: new Stroke({ color: 'black', width: 2 })
  //   }),
  //   mrgl: new Style({
  //     fill: new Fill({ color: [128, 230, 128, .9] }),
  //     stroke: new Stroke({ color: [0, 139, 0, .9], width: 2 })
  //   }),
  //   slgt: new Style({
  //     fill: new Fill({ color: [247, 247, 128, .9] }),
  //     stroke: new Stroke({ color: [255, 130, 71, .9], width: 2 })
  //   }),
  //   mdt: new Style({
  //     fill: new Fill({ color: [255, 128, 128, .9] }),
  //     stroke: new Stroke({ color: [205, 0, 0, .9], width: 2 })
  //   }),
  //   high: new Style({
  //     fill: new Fill({ color: [255, 128, 255, .9] }),
  //     stroke: new Stroke({ color: [255, 0, 255, .9], width: 2 })
  //   }),
  // }
  
  // function styleFunction(feature) {
  //   var outlook = feature.get('OUTLOOK');
  //   if (outlook === 'Marginal (5-10%)') {
  //     return rainStyles.mrgl;
  //   } else if (outlook === 'Slight (10-20%)') {
  //     return rainStyles.slgt;
  //   } else if (outlook === 'Moderate (20-50%)') {
  //     return rainStyles.mdt;
  //   } else if (outlook === 'High (>50%)') {
  //     return rainStyles.high;
  //   } else {
  //     return rainStyles.default;
  //   }
  // }
  
  


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