import 'ol/ol.css';
import KML from 'ol/format/KML';
import {Map, View} from 'ol';
import VectorSource from 'ol/source/Vector';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import {Fill, Stroke, Style} from 'ol/style';


const kmlFile = require('./doc.kml');


  
  var vector = new VectorLayer({
    source: new VectorSource({
    //   url: 'https://data.hurrevac.com/excessive/Day_1_Excessive_Rainfall_Outlook_LATEST.kml',
    url: kmlFile,
      crossOrigin: 'anonymous',
      format: new KML({
        // extractStyles: false,
        extractAttributes: true
      }),
      projection: 'EPSG:3857'
    }),
    // style: styleFunction
  });
  
  var rainStyles = {
    default: new Style({
      stroke: new Stroke({ color: 'black', width: 2 })
    }),
    mrgl: new Style({
      fill: new Fill({ color: [128, 230, 128, .9] }),
      stroke: new Stroke({ color: [0, 139, 0, .9], width: 2 })
    }),
    slgt: new Style({
      fill: new Fill({ color: [247, 247, 128, .9] }),
      stroke: new Stroke({ color: [255, 130, 71, .9], width: 2 })
    }),
    mdt: new Style({
      fill: new Fill({ color: [255, 128, 128, .9] }),
      stroke: new Stroke({ color: [205, 0, 0, .9], width: 2 })
    }),
    high: new Style({
      fill: new Fill({ color: [255, 128, 255, .9] }),
      stroke: new Stroke({ color: [255, 0, 255, .9], width: 2 })
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
  
  
//   var map = new ol.Map({
//     layers: [raster, vector],
//     target: document.getElementById('map'),
//     view: new ol.View({
//       center: ol.proj.transform([-97.6114, 38.8403], 'EPSG:4326', 'EPSG:3857'),
//       zoom: 5,
//     }),
//   });

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }), vector
  ],
  view: new View({
    center: [0, 0],
   
    zoom: 0
  })
});