
//  this is a prototype for using open layers and or WFS filters

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {WFS, GeoJSON} from 'ol/format';
import OSM from 'ol/source/OSM';
import {Fill, Stroke, Style} from 'ol/style';
import {getVectorContext} from 'ol/render';
import {fromLonLat} from 'ol/proj';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import {
  equalTo as equalToFilter,
  like as likeFilter,
  and as andFilter,
  within as withinFilter,
  bbox as bboxFilter,
  intersects as intersectsFilter
} from 'ol/format/filter';

// var geometry;
var vectorSource = new VectorSource();
var clipVectorSource = new VectorSource();
var wpVectorSource = new VectorSource();

var wpVector = new VectorLayer({
  source: wpVectorSource,
  // style: new Style({
  //   stroke: new Stroke({
  //     color: 'rgba(4, 26, 0, 1.0)',
  //     width: 2
  //   })
  // })
});

var clipVector = new VectorLayer({
  source: clipVectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(4, 26, 0, 1.0)',
      width: 2
    })
  })
});

var vector = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2
    })
  })
});

var base = new TileLayer({
  source: new OSM()
});

//  counties 
// var clipFeatureRequest = new WFS().writeGetFeature({
//   srsName: 'EPSG:3857',
//   featureNS: 'http://www.opengeospatial.net/cite',
//   featurePrefix: 'cite',
//   featureTypes: ['county500k_3857'],
//   outputFormat: 'application/json',
//   filter: likeFilter('STATEFP', '37*')
//   // filter: andFilter(
//   //   likeFilter('name', 'Mississippi*'),
//   //   equalToFilter('waterway', 'riverbank')
//   // )
// });

//  states 
var clipFeatureRequest = new WFS().writeGetFeature({
  srsName: 'EPSG:3857',
  featureNS: 'http://www.openplans.org/topp',
  featurePrefix: 'topp',
  featureTypes: ['states'],
  // propertyNames: ['the_geom'],
  outputFormat: 'application/json',
  filter: likeFilter('STATE_NAME', 'Virginia')
  // filter: andFilter(
  //   likeFilter('name', 'Mississippi*'),
  //   equalToFilter('waterway', 'riverbank')
  // )
});

console.log(clipFeatureRequest);
var stringRequest = new XMLSerializer().serializeToString(clipFeatureRequest);
console.log(stringRequest);


fetch('http://localhost:8080/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(clipFeatureRequest)
}).then(function(response) {
  return response.json();
}).then(function(json) {
  var features = new GeoJSON().readFeatures(json);
  console.log(features);
  console.log(features[0].getGeometryName());
  clipVectorSource.addFeatures(features);
  // map.getView().fit(vectorSource.getExtent());
});

var featureRequest = new WFS().writeGetFeature({
  srsName: 'EPSG:3857',
  featureNS: 'http://openstreemap.org',
  featurePrefix: 'osm',
  featureTypes: ['water_areas'],
  outputFormat: 'application/json',
  // filter: likeFilter('name', 'Mississippi*')
  filter: andFilter(
    likeFilter('name', 'Mississippi*'),
    equalToFilter('waterway', 'riverbank')
  )
});


fetch('https://ahocevar.com/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(featureRequest)
}).then(function(response) {
  return response.json();
}).then(function(json) {
  var features = new GeoJSON().readFeatures(json);
  vectorSource.addFeatures(features);
  // map.getView().fit(vectorSource.getExtent());
});



// var clipLayer = new VectorLayer({
//   // style: null,
//   style: new Style({
//         stroke: new Stroke({
//             color: 'rgba(4, 26, 0, 1.0)',
//             width: 3
//         })
//     }),
//   source: new VectorSource({
//     // url:'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:states20m&outputFormat=application/json&srsname=EPSG:3857',
//     // url:'http://localhost:8080/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=cite:USA_outline_20m&outputFormat=application/json&srsname=EPSG:3857',
//     url:'http://localhost:8080/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=cite:county500k_3857&outputFormat=application/json&srsname=EPSG:3857',
//     // url: 'https://openlayers.org/en/latest/examples/data/geojson/switzerland.geojson',
//     format: new GeoJSON()
//   })
// });


// var rainfall = new TileLayer({
//   name: 'Cumulative QPF Days 1-3',
//   metadata: {
//     type: 'query',
//     attribute: 'idp_issueddate'
//   },
//   legend: {
//     name: 'conditions-liquid-precip',
//     url: 'images/Legend-LiquidPrecipitationQPF.png'
//   },
//   source: new TileArcGISRest({
//     url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer',
//     params: {
//       layers: 'show:9',
//       time: ',' // unbounded time range to retrieve everything
//     },
//     crossOrigin: 'anonymous'
//   }),
//   visible: true
// });




var rvaCoords = fromLonLat([-77.43, 37.54]);
console.log(rvaCoords);
var url = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS'
// var xUrl = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS&filter=DWithin(GEOMETRY,POINT([-8619468.172123173,4514645.503284722]),50000,m)'

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



// map 
var map = new Map({
  layers: [base,  wpLayer, clipVector],
  target: 'map',
  view: new View({
    // center: fromLonLat([8.23, 46.86]),
    center: fromLonLat([-75, 33]),
    zoom: 4
  })
});

var style = new Style({
  fill: new Fill({
    color: 'black'
  })
});



// click event listener
document.getElementById("btn").addEventListener("click", function(e){
  
  var features = clipVectorSource.getFeatures();
  var geometry = features[0].getGeometry();
  var extent = geometry.getExtent();
  
  
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // open layer filters

  // working within filter
  // var wpFeatureRequest = new WFS(
  //   ).writeGetFeature({
  //     srsName: 'EPSG:3857',
  //     featureNS: 'nhp.ll.mit.edu',
  //     featurePrefix: 'nhp',
  //     featureTypes: ['va_vahes_evac_zones_vdem_chesapeake'],
  //     outputFormat: 'application/json',
  //     filter: withinFilter('geom', geometry, 'EPSG:3857')
  //   });

    // working filters 

    // var wpFeatureRequest = new WFS(
    //   ).writeGetFeature({
    //     srsName: 'EPSG:3857',
    //     featureNS: 'nhp.ll.mit.edu',
    //     featurePrefix: 'nhp',
    //     featureTypes: ['usace_districts'],
    //     outputFormat: 'application/json',
    //     // working bbox filter 
    //     // filter: bboxFilter('geom', extent, 'EPSG:3857')
    //     // working intersects filter
    //     // filter: intersectsFilter('geom', geometry, 'EPSG:3857')
    //     // )
    //   });
    
  fetch('https://dev-hvx.hurrevac.com/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(wpFeatureRequest)
}).then(function(response) {
  return response.json();
}).then(function(json) {
  var features = new GeoJSON().readFeatures(json);
  console.log(features);
  console.log(features[0].getGeometryName());
  wpVectorSource.addFeatures(features);
  map.addLayer(wpVector);
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


  // working clip in open layers
//   console.log(e);
//   map.removeLayer(wpLayer);
//   map.addLayer(wpLayer);

//   wpLayer.on('postrender', function(e) {
//   // console.log(e);
//   e.context.globalCompositeOperation = 'destination-in';
//   var vectorContext = getVectorContext(e);
//   // console.log(vectorContext);
//   clipVector.getSource().forEachFeature(function(feature) {
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

// clip in progress using WFS/WPS
});






