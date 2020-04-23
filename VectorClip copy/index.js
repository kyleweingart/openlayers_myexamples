
//  this is a prototype for using open layers to clip a layer based on another layer
//  issues if there are multiple features in the layer - for example states only worked if 
//  selected one state

import './node_modules/ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import {Fill, Stroke, Style} from 'ol/style';
import {getVectorContext} from 'ol/render';
import {fromLonLat} from 'ol/proj';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import GeometryCollection from 'ol/geom/GeometryCollection';


// function test() {
//   console.log('test');
// };

var base = new TileLayer({
  source: new OSM()
});

var clipLayer = new VectorLayer({
  style: null,
  // style: new Style({
  //       stroke: new Stroke({
  //           color: 'rgba(4, 26, 0, 1.0)',
  //           width: 3
  //       })
  //   }),
  source: new VectorSource({
    // url:'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:states20m&outputFormat=application/json&srsname=EPSG:3857',
    url:'http://localhost:8080/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=cite:USA_outline_20m&outputFormat=application/json&srsname=EPSG:3857',
    // url: 'https://openlayers.org/en/latest/examples/data/geojson/switzerland.geojson',
    format: new GeoJSON()
  })
});


var rainfall = new TileLayer({
  name: 'Cumulative QPF Days 1-3',
  metadata: {
    type: 'query',
    attribute: 'idp_issueddate'
  },
  legend: {
    name: 'conditions-liquid-precip',
    url: 'images/Legend-LiquidPrecipitationQPF.png'
  },
  source: new TileArcGISRest({
    url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer',
    params: {
      layers: 'show:9',
      time: ',' // unbounded time range to retrieve everything
    },
    crossOrigin: 'anonymous'
  }),
  visible: true
});



var url = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS'

var wpLayer = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: url,
        // strategy: ol.loadingstrategy.all,
        projection: 'EPSG:3857',
        useSpatialIndex: false

    }),
    style: function(feature) {
        // console.log(feature);
        var val = feature.get('prob');
        // console.log(val);
        var fillColor = [0, 0, 0, 0];
        val = (val >= 10) ? (Math.floor(val / 10) * 10) : (val >= 5) ? 5 : 0;

        switch (val) {
            case 5:
                fillColor = [255, 247, 236, .8];
                break;
            case 10:
                fillColor = [254, 232, 200, .8];
                break;
            case 20:
                fillColor = [253, 212, 158, .8];
                break;
            case 30:
                fillColor = [253, 187, 132, .8];
                break;
            case 40:
                fillColor = [252, 141, 89, .8];
                break;
            case 50:
                fillColor = [239, 101, 72, .8];
                break;
            case 60:
                fillColor = [215, 48, 31, .8];
                break;
            case 70:
                fillColor = [179, 0, 0, .8];
                break;
            case 80:
                fillColor = [127, 0, 0, .8];
                break;
            case 90:
                fillColor = [100, 0, 0, .8];
                break;
        }
        return [new Style({
            fill: new Fill({
              color: fillColor
            })
          })];
    },
    visible: true,
});

var style = new Style({
  fill: new Fill({
    color: 'black'
  })
});

// wpLayer.on('postrender', function(e) {
//   // console.log(e);
//   e.context.globalCompositeOperation = 'destination-in';
//   var vectorContext = getVectorContext(e);
//   // console.log(vectorContext);
//   clipLayer.getSource().forEachFeature(function(feature) {
//     // console.log(feature);
//     // console.log(feature.values_.name);
//       vectorContext.drawFeature(feature, style);
//     // if (feature.values_.name === 'Florida'){
//     //     console.log('Florida');
//     //     vectorContext.drawFeature(feature, style);
//     // }
//   });
//   e.context.globalCompositeOperation = 'source-over';
// });

// rainfall.on('postrender', function(e) {
//   console.log(e);
//   e.context.globalCompositeOperation = 'destination-in';
//   var vectorContext = getVectorContext(e);
//   console.log(vectorContext);
//   clipLayer.getSource().forEachFeature(function(feature) {
//     // console.log(feature);
//     // console.log(feature.values_.name);
//       vectorContext.drawFeature(feature, style);
//     // if (feature.values_.name === 'Florida'){
//     //     console.log('Florida');
//     //     vectorContext.drawFeature(feature, style);
//     // }
//   });
//   e.context.globalCompositeOperation = 'source-over';
// });

base.on('postrender', function(e) {
  console.log(e);
  e.context.globalCompositeOperation = 'destination-in';
  var vectorContext = getVectorContext(e);
  // console.log(vectorContext);
  clipLayer.getSource().forEachFeature(function(feature) {
    // console.log(feature);
    // console.log(feature.values_.name);
      vectorContext.drawFeature(feature, style);
    // if (feature.values_.name === 'Florida'){
    //     console.log('Florida');
    //     vectorContext.drawFeature(feature, style);
    // }
  });
  e.context.globalCompositeOperation = 'source-over';
});

var map = new Map({
  layers: [base, clipLayer, wpLayer],
  target: 'map',
  view: new View({
    // center: fromLonLat([8.23, 46.86]),
    center: fromLonLat([-75, 33]),
    zoom: 4
  })
});

document.getElementById("btn").addEventListener("click", function(e){
  console.log(e);
  map.removeLayer(wpLayer);
  map.addLayer(wpLayer);

  wpLayer.on('postrender', function(e) {
  // console.log(e);
  e.context.globalCompositeOperation = 'destination-in';
  var vectorContext = getVectorContext(e);
  // console.log(vectorContext);
  clipLayer.getSource().forEachFeature(function(feature) {
    // console.log(feature);
    // console.log(feature.values_.name);
      vectorContext.drawFeature(feature, style);
    // if (feature.values_.name === 'Florida'){
    //     console.log('Florida');
    //     vectorContext.drawFeature(feature, style);
    // }
  });
  e.context.globalCompositeOperation = 'source-over';
});
  console.log("Hello World");
    var features = wpLayer.getSource().getFeatures();
    var wpFeaturesColl = wpLayer.getSource().getFeaturesCollection();
    console.log(features);
    console.log(wpFeaturesColl);
});

// function getGeometryFeatures() {
//   console.log('here');
// };



