
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
import GeometryCollection from 'ol/geom/GeometryCollection'
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


// layer used by open layer filter examples
var wpVector = new VectorLayer({
  source: wpVectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(4, 26, 0, 1.0)',
      width: 2
    })
  })
});

// state outlines - used to clip layers and filter
var clipVector = new VectorLayer({
  source: clipVectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(4, 26, 0, 1.0)',
      width: 2
    })
  })
});


// rivers 
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
//   filter: andFilter(
//     likeFilter('STATEFP', '37*'),
//     equalToFilter('NAME', 'Onslow')
//   )
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
});

// updating the request to xml from the ol wrapper
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

// ##############################################################################
// filter examples - same as official ol example
// var featureRequest = new WFS().writeGetFeature({
  //   srsName: 'EPSG:3857',
  //   featureNS: 'http://openstreemap.org',
  //   featurePrefix: 'osm',
  //   featureTypes: ['water_areas'],
  //   outputFormat: 'application/json',
  //   // filter: likeFilter('name', 'Mississippi*')
  //   filter: andFilter(
    //     likeFilter('name', 'Mississippi*'),
    //     equalToFilter('waterway', 'riverbank')
    //   )
    // });
    
    // fetch('https://ahocevar.com/geoserver/wfs', {
      //   method: 'POST',
      //   body: new XMLSerializer().serializeToString(featureRequest)
      // }).then(function(response) {
        //   return response.json();
        // }).then(function(json) {
          //   var features = new GeoJSON().readFeatures(json);
          //   vectorSource.addFeatures(features);
          //   // map.getView().fit(vectorSource.getExtent());
          // });
// ##############################################################################

// i cant seem to get the open layers filters to work using viewparams 
// empty feature collection gets returned

var url = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS'

// attempt to add Dwithin filter to end of url with no success 
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
  
  // get clip features 
  var features = clipVectorSource.getFeatures();
  
  // transform only necessary if clip features and features to clip by are not in same projection
  // var geometry = features[0].getGeometry().transform('EPSG:3857', 'EPSG:4326');
  var geometry = features[0].getGeometry();
  var coordinates = geometry.getCoordinates();
  
  // stringify keeps the array structure in nested arrays
  var stJSON = JSON.stringify(coordinates);
  console.log(stJSON)
  var extent = geometry.getExtent();


  // in progress - trying to somehow get Features Collection to work with WPS as text - not ideal - best would be do get a reference- do another WPS call, etc. 
  // var windProbFeatures = wpLayer.getSource().getFeaturesCollection();
  // var windsStringify = JSON.stringify(windProbFeatures);
  
  
  
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // open layer spatial filters

  // working within filter
  // within only returns if features are entirely within(inside) the withinFilter

  // var wpFeatureRequest = new WFS(
  //   ).writeGetFeature({
  //     srsName: 'EPSG:3857',
  //     featureNS: 'nhp.ll.mit.edu',
  //     featurePrefix: 'nhp',
  //     featureTypes: ['va_vahes_evac_zones_vdem_chesapeake'],
  //     outputFormat: 'application/json',
  //     filter: withinFilter('geom', geometry, 'EPSG:3857')
  //   });

    // additional working spatial filters 

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
    
//   fetch('https://dev-hvx.hurrevac.com/geoserver/wfs', {
//   method: 'POST',
//   body: new XMLSerializer().serializeToString(wpFeatureRequest)
// }).then(function(response) {
//   return response.json();
// }).then(function(json) {
//   var features = new GeoJSON().readFeatures(json);
//   console.log(features);
//   console.log(features[0].getGeometryName());
//   wpVectorSource.addFeatures(features);
//   map.addLayer(wpVector);
// });

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ************************************************************************
// working clip in open layers
//   console.log(e);
// map.removeLayer(wpLayer);
// map.addLayer(wpLayer);
// wpLayer.on('postrender', function(e) {
//   e.context.globalCompositeOperation = 'destination-in';
//   var vectorContext = getVectorContext(e);
//   clipVector.getSource().forEachFeature(function(feature) {
//     vectorContext.drawFeature(feature, style);
//   });
//   e.context.globalCompositeOperation = 'source-over';
// });
// ************************************************************************

// working WPS clip

//      var clipData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//   <ows:Identifier>gs:Clip</ows:Identifier>
//   <wps:DataInputs>
//     <wps:Input>
//       <ows:Identifier>features</ows:Identifier>
//       <wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">
//         <wps:Body>
//           <wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:tiger="http://www.census.gov">
//             <wfs:Query typeName="tiger:giant_polygon"/>
//           </wfs:GetFeature>
//         </wps:Body>
//       </wps:Reference>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>clip</ows:Identifier>
//       <wps:Data>
//         <wps:ComplexData mimeType="application/json"><![CDATA[{"type":"MultiPolygon","coordinates":[[[[-74.0121,40.6842],[-74.0082,40.6867],[-74.0084,40.686],[-74.0121,40.6842]]],[[[-74.0239,40.713],[-74.0233,40.7158],[-74.0225,40.7203],[-74.0219,40.7236],[-74.0215,40.7252],[-74.0215,40.7254],[-74.0211,40.7274],[-74.0211,40.7276],[-74.0207,40.729],[-74.0204,40.7303],[-74.0198,40.7328],[-74.0189,40.7364],[-74.0178,40.7407],[-74.0169,40.7441],[-74.0156,40.7493],[-74.0138,40.7566],[-74.0099,40.7626],[-74.0092,40.7636],[-74.0083,40.7649],[-74.0044,40.7703],[-74.0014,40.7744],[-74.0002,40.776],[-73.9976,40.7797],[-73.9972,40.7802],[-73.9956,40.7825],[-73.9947,40.7838],[-73.9929,40.7863],[-73.9916,40.7881],[-73.9912,40.7885],[-73.9899,40.7904],[-73.9881,40.793],[-73.9862,40.7956],[-73.9848,40.7974],[-73.9843,40.7982],[-73.9825,40.8007],[-73.9806,40.8033],[-73.9789,40.8057],[-73.9772,40.8081],[-73.9751,40.811],[-73.9712,40.8163],[-73.9681,40.8207],[-73.968,40.8208],[-73.966,40.8234],[-73.9657,40.8237],[-73.9651,40.8245],[-73.9637,40.8263],[-73.9632,40.8269],[-73.9623,40.8288],[-73.9615,40.8309],[-73.9599,40.8344],[-73.9586,40.8374],[-73.9576,40.8396],[-73.9555,40.8444],[-73.954,40.848],[-73.9521,40.8514],[-73.9521,40.8514],[-73.9483,40.8584],[-73.9483,40.8584],[-73.9457,40.8625],[-73.9382,40.8746],[-73.9381,40.8747],[-73.9334,40.8821],[-73.925,40.8791],[-73.9226,40.8788],[-73.9216,40.8783],[-73.9198,40.8766],[-73.9152,40.8756],[-73.9114,40.8793],[-73.9103,40.879],[-73.9095,40.8789],[-73.9086,40.8777],[-73.9072,40.8764],[-73.907,40.8735],[-73.9071,40.873],[-73.9086,40.8717],[-73.9098,40.8683],[-73.9143,40.8625],[-73.9193,40.8575],[-73.92,40.8567],[-73.921,40.8551],[-73.9212,40.8547],[-73.923,40.852],[-73.9239,40.8505],[-73.9273,40.8466],[-73.9282,40.8455],[-73.9304,40.8403],[-73.9306,40.8397],[-73.933,40.8357],[-73.9331,40.8348],[-73.9335,40.8332],[-73.9331,40.8282],[-73.9323,40.8195],[-73.9324,40.8142],[-73.9326,40.8115],[-73.9325,40.8089],[-73.9318,40.8079],[-73.9282,40.8038],[-73.9272,40.8026],[-73.9251,40.8025],[-73.923,40.8024],[-73.9216,40.8014],[-73.9199,40.7994],[-73.9136,40.7968],[-73.9125,40.7961],[-73.9107,40.7931],[-73.9103,40.7907],[-73.9121,40.7893],[-73.9153,40.7861],[-73.9172,40.7842],[-73.9191,40.7834],[-73.92,40.7826],[-73.921,40.7817],[-73.9248,40.7788],[-73.9257,40.7784],[-73.9263,40.7782],[-73.9283,40.7769],[-73.9299,40.7762],[-73.9318,40.7779],[-73.9344,40.7781],[-73.9359,40.7772],[-73.9364,40.7769],[-73.9377,40.7751],[-73.9379,40.7741],[-73.9375,40.7725],[-73.935,40.7717],[-73.9353,40.7705],[-73.9413,40.7669],[-73.9447,40.7629],[-73.9508,40.7552],[-73.9514,40.7545],[-73.9577,40.7478],[-73.9591,40.7461],[-73.9602,40.7445],[-73.9605,40.7441],[-73.9606,40.744],[-73.9614,40.7428],[-73.9626,40.739],[-73.9625,40.7368],[-73.9622,40.7326],[-73.9621,40.7325],[-73.9618,40.7316],[-73.9614,40.731],[-73.9612,40.7295],[-73.9612,40.7282],[-73.9614,40.7273],[-73.9616,40.725],[-73.9615,40.7239],[-73.9626,40.7227],[-73.9628,40.7226],[-73.9635,40.7216],[-73.9656,40.7189],[-73.9665,40.7179],[-73.9676,40.7165],[-73.9677,40.716],[-73.9684,40.7141],[-73.9685,40.713],[-73.9689,40.7126],[-73.969,40.7125],[-73.9696,40.7102],[-73.9699,40.7093],[-73.9696,40.7076],[-73.9703,40.7073],[-73.9728,40.7094],[-73.9755,40.7075],[-73.9792,40.7058],[-73.9831,40.7055],[-73.9842,40.7056],[-73.9865,40.705],[-73.9873,40.7052],[-73.9894,40.7051],[-73.9927,40.7055],[-73.9937,40.7045],[-73.9945,40.7043],[-73.9951,40.7031],[-73.9951,40.703],[-73.9967,40.7009],[-73.9975,40.6997],[-73.998,40.6988],[-73.9984,40.698],[-73.9988,40.6971],[-73.9994,40.6964],[-73.9995,40.6963],[-74.0003,40.695],[-74.0007,40.6944],[-74.001,40.6941],[-74.0013,40.6933],[-74.0013,40.6932],[-74.0017,40.6924],[-74.002,40.6918],[-74.0007,40.6906],[-74.002,40.6901],[-74.003,40.6904],[-74.0034,40.6896],[-74.0038,40.6889],[-74.0046,40.6882],[-74.0074,40.6873],[-74.0066,40.6887],[-74.0061,40.6896],[-74.0055,40.6908],[-74.0054,40.6911],[-74.003,40.6954],[-74.0024,40.6966],[-74.0019,40.6973],[-74.0007,40.6989],[-73.9988,40.7015],[-74.0017,40.7027],[-74.0038,40.7035],[-74.0041,40.7037],[-74.0068,40.702],[-74.0072,40.7017],[-74.009,40.7006],[-74.0099,40.7005],[-74.0135,40.7001],[-74.0138,40.7],[-74.0143,40.7003],[-74.0168,40.7018],[-74.018,40.7041],[-74.0181,40.7042],[-74.0195,40.7069],[-74.0195,40.707],[-74.0245,40.7094],[-74.0239,40.713]]],[[[-74.0271,40.6851],[-74.0254,40.688],[-74.0195,40.6934],[-74.0155,40.6934],[-74.015,40.693],[-74.0121,40.6907],[-74.0131,40.6878],[-74.0162,40.6871],[-74.02,40.6858],[-74.0254,40.6842],[-74.026,40.6845],[-74.0271,40.6851]]],[[[-74.0469,40.6911],[-74.0409,40.7001],[-74.04,40.7007],[-74.0394,40.7005],[-74.038,40.699],[-74.0434,40.6897],[-74.0445,40.6884],[-74.0464,40.6892],[-74.0473,40.6905],[-74.0469,40.6911]]]]}]]></wps:ComplexData>
//       </wps:Data>
//     </wps:Input>
//   </wps:DataInputs>
//   <wps:ResponseForm>
//     <wps:RawDataOutput mimeType="application/json">
//       <ows:Identifier>result</ows:Identifier>
//     </wps:RawDataOutput>
//   </wps:ResponseForm>
// </wps:Execute>`

// working WPS clip with dynamic clip coordinates - currently virginia state

//      var clipData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//   <ows:Identifier>gs:Clip</ows:Identifier>
//   <wps:DataInputs>
//     <wps:Input>
//       <ows:Identifier>features</ows:Identifier>
//       <wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">
//         <wps:Body>
//           <wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:tiger="http://www.census.gov">
//             <wfs:Query typeName="tiger:giant_polygon"/>
//           </wfs:GetFeature>
//         </wps:Body>
//       </wps:Reference>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>clip</ows:Identifier>
//       <wps:Data>
//         <wps:ComplexData mimeType="application/json"><![CDATA[{"type":"MultiPolygon","coordinates":${stJSON}}]]></wps:ComplexData>
//       </wps:Data>
//     </wps:Input>
//   </wps:DataInputs>
//   <wps:ResponseForm>
//     <wps:RawDataOutput mimeType="application/json">
//       <ows:Identifier>result</ows:Identifier>
//     </wps:RawDataOutput>
//   </wps:ResponseForm>
// </wps:Execute>`


// in progress - trying to get existing WFS wind probs feature collection into a format that i can use to clip the data 
// might need to do an additional geometrycollection process - but i'm not sure exactly how the formatting of the application/json and/or text/xml wfs 1.0/1.1 should be done
// need to find examples or ask for geosolution to give me some templates

 var getCollectGeoms = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>vec:CollectGeometries</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>features</ows:Identifier>
      <wps:Reference mimeType="application/json" xlink:href="https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&amp;version=2.0.0&amp;request=GetFeature&amp;typename=nhp:windprobs_view&amp;outputFormat=application/json&amp;srsname=EPSG:3857&amp;viewparams=date:1567393200;fcstHr:120;spd:TS" method="GET"/>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>`

var stJSONfeature;
// getting a response
// now what to feed the resonse to and how - should it be part of the then? 


// var geomResult = fetch('http://localhost:8080/geoserver/wps', {
//   method: 'POST',
//   // body: new XMLSerializer().serializeToString(wpFeatureRequest),
//   body: getCollectGeoms
// }).then(function(response) {
//   console.log('here');
//   return response.json();
// })


// geomResult.then(function(geom) {
//   stJSONfeature = JSON.stringify(geom.coordinates);
//   var test2clipData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//   <ows:Identifier>gs:Clip</ows:Identifier>
//   <wps:DataInputs>
//   <wps:Input>
//    <ows:Identifier>features</ows:Identifier>
//    <wps:Data>
//      <wps:ComplexData mimeType="application/json"><![CDATA[{"type":"MultiPolygon","coordinates":${stJSONfeature}}]]></wps:ComplexData>
//    </wps:Data>
//   </wps:Input>
//   <wps:Input>
//    <ows:Identifier>clip</ows:Identifier>
//    <wps:Data>
//      <wps:ComplexData mimeType="application/json"><![CDATA[{"type":"MultiPolygon","coordinates":${stJSON}}]]></wps:ComplexData>
//    </wps:Data>
//   </wps:Input>
//   </wps:DataInputs>
//   <wps:ResponseForm>
//   <wps:RawDataOutput mimeType="application/json">
//    <ows:Identifier>result</ows:Identifier>
//   </wps:RawDataOutput>
//   </wps:ResponseForm>
//   </wps:Execute>`;
//   console.log(test2clipData);
//   fetch('http://localhost:8080/geoserver/wps', {
//       method: 'POST',
//     //   // body: new XMLSerializer().serializeToString(wpFeatureRequest)
//       body: test2clipData
// }).then(function(response) {
//   console.log(stJSONfeature);
//   console.log(response);
//   console.log('here');
//   return response.json();
// })

var gsClip = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>gs:Clip</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>features</ows:Identifier>
      <wps:Reference mimeType="application/json" xlink:href="https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&amp;version=2.0.0&amp;request=GetFeature&amp;typename=nhp:windprobs_view&amp;outputFormat=application/json&amp;srsname=EPSG:3857&amp;viewparams=date:1567393200;fcstHr:120;spd:TS" method="GET"/>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>clip</ows:Identifier>
      <wps:Data>
        <wps:ComplexData mimeType="application/json"><![CDATA[{"type": "MultiPolygon", "coordinates": [[[[-8810305.95817735,4376020.73925568],[-8818403.22661816,4376536.62619956],[-8851046.10882042,4376242.1671376],[-8874105.38474079,4376274.45331254],[-8908237.05381292,4375877.46483011],[-8910913.28569108,4376169.69680749],[-8954017.75099911,4376711.50407177],[-8973581.37226959,4377578.03695902],[-8998862.58522619,4378429.11728094],[-9006129.96686314,4378674.98828475],[-9055317.26310658,4379735.73553419],[-9091462.59044767,4382062.45698513],[-9089507.48623087,4384545.27625857],[-9109168.84601427,4385089.72660467],[-9119120.02925475,4385369.03511902],[-9120345.65684838,4382920.41068753],[-9145377.84810409,4382810.32034355],[-9152332.86724987,4382661.13171036],[-9161259.79985556,4382346.53907837],[-9196210.22378247,4382311.60031752],[-9222812.79909479,4382242.27771709],[-9238049.32043865,4382277.21625157],[-9263009.37666432,4381833.97671349],[-9267179.40478944,4382090.04686262],[-9270145.17866315,4383550.33226252],[-9291203.598056,4383325.00936653],[-9314687.55783375,4383306.42910569],[-9311529.08992148,4385840.43678894],[-9298626.49302159,4392014.26388764],[-9290759.43328774,4392062.97280811],[-9284517.86075845,4393519.34723906],[-9282481.27067439,4395725.24312478],[-9275304.72574193,4398684.31901088],[-9262199.97264676,4402118.41995692],[-9254948.62101649,4402923.80981444],[-9253376.5671675,4404467.11119932],[-9253802.92081724,4408355.73774501],[-9247094.36302408,4418345.33172604],[-9244721.36543884,4419430.20417211],[-9234054.17523357,4420165.24798198],[-9225954.45776396,4424286.35811891],[-9224016.27410976,4429642.1677067],[-9224676.17605118,4435551.75781334],[-9218627.52019944,4439874.14103779],[-9208762.05296687,4443832.22734191],[-9208367.98196946,4448286.61682254],[-9207156.04667319,4449619.28097892],[-9208514.92369731,4452080.23988176],[-9208260.89261932,4454438.89389028],[-9191443.96846467,4466156.36136349],[-9189442.11006173,4466919.25206538],[-9173395.40546388,4474094.29826957],[-9167602.339163,4475467.00914579],[-9160379.04004441,4481670.84438237],[-9123715.63179317,4513390.90956923],[-9121030.16039727,4509948.39269429],[-9122426.44077029,4508037.44771861],[-9125590.91993507,4506617.68929754],[-9126902.26353662,4504328.52344655],[-9119391.87145127,4497168.1477197],[-9120069.58451122,4491032.62696997],[-9116767.51445582,4486671.7469641],[-9113056.12263277,4484553.08978626],[-9112484.49704754,4481974.12043314],[-9110281.37300526,4478961.90068301],[-9107664.69705467,4478127.20682693],[-9105135.51822384,4479192.48148484],[-9100593.4603605,4477108.343208],[-9099102.11314234,4474063.95100235],[-9095013.57088448,4471958.45561326],[-9091023.54637598,4467691.28262497],[-9078864.11839663,4467892.82488468],[-9073173.79998575,4471809.68709799],[-9072060.38243884,4474393.58014819],[-9069814.84567056,4474613.43187867],[-9061798.28386057,4478558.3964303],[-9060418.14481371,4482550.74690662],[-9056839.22318471,4486442.1223129],[-9051616.0013572,4480108.97816688],[-9041715.69112401,4472626.26195853],[-9032566.23085622,4477480.8752084],[-9019675.54514185,4479038.71375085],[-9015334.75291786,4481862.57764848],[-9014510.8773665,4480495.88964969],[-9013326.10402598,4479840.45736366],[-9009573.9692693,4481180.75084387],[-9000807.44804984,4486505.68863517],[-9000026.98709989,4488120.31805537],[-9003248.35052447,4493408.70192189],[-9000261.31462801,4498280.34856881],[-8994593.92803224,4496822.80775255],[-8994553.1850986,4493836.73552086],[-8991300.42957763,4493058.02159932],[-8990518.18751582,4490987.24287836],[-8988814.44270923,4492061.38562828],[-8988662.4916043,4493273.9204847],[-8986816.03521051,4493971.9445219],[-8984085.59074033,4493363.72788208],[-8972095.14574801,4501447.29752692],[-8966002.29605842,4504694.588086],[-8962218.65788585,4505513.16047415],[-8959894.0842791,4503486.48303131],[-8959773.52527057,4499737.53106193],[-8958434.12915735,4498189.93842814],[-8952936.61610452,4499884.0315012],[-8948809.89126132,4504205.52298614],[-8944785.91430813,4505660.86377251],[-8944268.7239539,4507775.78805812],[-8937634.75021957,4510578.34146659],[-8936834.69703924,4514102.62773158],[-8939904.10935888,4512995.20396898],[-8941863.44371633,4513701.56087591],[-8940840.86287391,4518379.57093937],[-8933012.09704489,4522618.64305854],[-8929954.59591076,4526464.90586167],[-8933905.54727799,4528775.36769285],[-8939082.79415581,4528753.43719861],[-8939520.27975463,4530398.21147897],[-8938500.25926048,4533106.13705597],[-8939324.91404828,4534677.18808729],[-8933416.29811596,4540780.79310459],[-8933934.37902611,4545170.33720675],[-8930133.82029094,4548215.6124165],[-8930488.81814708,4551526.78440484],[-8924684.61989712,4557248.94909631],[-8924754.30589835,4559676.08433794],[-8923394.53831831,4562079.5293053],[-8918775.22472835,4564061.0550828],[-8917437.60972698,4567359.64104961],[-8911684.3958038,4573144.74955887],[-8905639.07953678,4577977.3678271],[-8901853.77157185,4584865.71750302],[-8900854.12254453,4588929.21201511],[-8897601.36702355,4594013.08947317],[-8898384.38832179,4596559.36210919],[-8895602.95952482,4602404.70780418],[-8896250.95028073,4604763.57054337],[-8886788.01432687,4614824.98833513],[-8882610.30515689,4617431.70007502],[-8881818.82357735,4619764.7895214],[-8883629.4350951,4621715.2740516],[-8883356.81366215,4623908.02484681],[-8879313.35579807,4629537.09487604],[-8875843.08199207,4629231.75604229],[-8874418.86042686,4635315.68532586],[-8870417.81528877,4640366.66272679],[-8871370.71012996,4650335.54807009],[-8868360.74241841,4653240.97121925],[-8868785.42627578,4657424.93111759],[-8865777.23967607,4663430.47951325],[-8853989.73011547,4657941.35601772],[-8848405.6104988,4644901.6323295],[-8829554.54528889,4637864.65994611],[-8824585.24321988,4641370.53386751],[-8820055.09654204,4647510.43972142],[-8808451.93205819,4672818.83835066],[-8807743.60613827,4673606.34342169],[-8804123.94157564,4672955.83477804],[-8803977.89040372,4679810.14147016],[-8800562.83106516,4687628.66062303],[-8800367.46535882,4691709.62506813],[-8798023.41084118,4693041.79002387],[-8792870.65425135,4699729.10160569],[-8779413.57496782,4687821.39157235],[-8773769.89942358,4697868.86695508],[-8771231.36975553,4704512.59346132],[-8766355.57605879,4708985.59901052],[-8765073.06420536,4711531.28446919],[-8763560.45496446,4711680.25087584],[-8762986.38035044,4708055.73593966],[-8758671.97084576,4710443.9388485],[-8754969.81854045,4714575.44146825],[-8753175.23702937,4718750.29833249],[-8749596.31540037,4716973.91291007],[-8744532.72572265,4723652.50853026],[-8744086.89116203,4725021.11050364],[-8745754.01185615,4726691.70885807],[-8742689.83155257,4729843.3526784],[-8738788.08340027,4735084.69600107],[-8736968.0097258,4737704.23437224],[-8732819.24362342,4738721.76395312],[-8730881.17128871,4742968.31522244],[-8727741.2937314,4746122.30844751],[-8730157.48327907,4750004.95773313],[-8730046.27510776,4752090.15538821],[-8727381.17517868,4756805.16733184],[-8728986.29091643,4758614.874538],[-8720893.36393576,4770686.80090538],[-8721236.45060638,4772054.16476071],[-8723634.94035501,4773599.09641491],[-8721937.98603736,4776355.54101929],[-8721638.98188509,4787331.79263752],[-8713772.81270716,4782497.9799477],[-8708499.4971088,4777836.74734257],[-8686661.39600243,4759779.15852726],[-8664103.16911011,4740608.02277519],[-8662919.28632553,4741977.91559095],[-8661294.5783574,4749858.15536734],[-8657151.71218804,4757035.0104555],[-8656174.99497582,4762512.11685627],[-8652613.88446534,4767281.50654458],[-8647252.18119128,4767423.0950159],[-8640231.9288239,4764694.84575886],[-8634937.35120279,4764504.38652149],[-8631957.21711476,4760268.46248929],[-8626599.74398135,4757532.80624166],[-8623359.67888232,4754535.33461093],[-8623030.17318957,4753037.29205359],[-8624882.52951637,4747047.48860508],[-8629110.33245721,4744249.23252697],[-8628712.81055559,4738394.91517054],[-8624950.43440576,4736573.62258638],[-8622773.69308279,4733257.40273999],[-8619806.24941671,4731241.18025885],[-8610175.10971226,4731490.08550005],[-8607735.09779356,4730640.73589848],[-8600097.35621075,4725621.93817565],[-8598732.57925362,4718217.1782],[-8588526.47437922,4716627.72151227],[-8585251.56627957,4711944.41762232],[-8580389.3535607,4709589.19724527],[-8579157.82603406,4705369.62514659],[-8575950.93414328,4701985.10698711],[-8576098.65510757,4698551.98058974],[-8576631.20755152,4697258.96241865],[-8575524.58049354,4695051.43656819],[-8576660.03929964,4691366.86395521],[-8576773.91913872,4681469.04379452],[-8577959.47171567,4680504.59921707],[-8580715.51966873,4680969.40446252],[-8581969.86769099,4679357.94193977],[-8585528.41785317,4675623.56869038],[-8586071.21169028,4671393.10118456],[-8593559.45119696,4667769.78498187],[-8593280.03927507,4673195.19090802],[-8596936.21663069,4671763.4144968],[-8605399.50355723,4650573.66417528],[-8609280.88024272,4641319.65581558],[-8603825.77991588,4630786.50925538],[-8607425.96356763,4628133.69003467],[-8598395.39251601,4626343.7645463],[-8577671.59951248,4632586.86436411],[-8571529.43528846,4619094.99850604],[-8564527.77327604,4608068.07454739],[-8526583.63428323,4596423.38092294],[-8521399.48559699,4589900.64957075],[-8522402.47420903,4583004.71056802],[-8524144.40160097,4579873.63723224],[-8518673.27126746,4581226.41040515],[-8501218.37511107,4573346.21663362],[-8489135.4236219,4563902.36676829],[-8488325.24036791,4558282.55520527],[-8496408.81651135,4551043.69279107],[-8494784.10854322,4539821.39844362],[-8500022.58114097,4537150.42012898],[-8496244.06366498,4534011.18546993],[-8498672.27571765,4526293.85894871],[-8516730.07823617,4530997.47477446],[-8524897.81191466,4547001.47942468],[-8530610.17158471,4550696.56819033],[-8546203.36057707,4567661.60410675],[-8551396.74878105,4568060.94257534],[-8541806.46332972,4550996.92045725],[-8536171.35938627,4547654.79241281],[-8523677.3050176,4528962.05991869],[-8495307.31014995,4516218.13415753],[-8499091.72755896,4512560.91358139],[-8517372.16905907,4516410.92090078],[-8508614.1081209,4511164.68113723],[-8499873.96962076,4511242.29150467],[-8488622.46340832,4493634.69588423],[-8490915.53359917,4485249.97491218],[-8493785.35007182,4485844.98167872],[-8498020.83405753,4494105.05352889],[-8510026.52982009,4503135.0451226],[-8511926.41956946,4497656.88485716],[-8506710.87878681,4496709.98607753],[-8505227.10129403,4491230.41425035],[-8510993.00563916,4491855.59782104],[-8504000.69446396,4480086.02979512],[-8511614.72499524,4474770.77133416],[-8533027.25168831,4496719.09585721],[-8538726.03038048,4497600.67962917],[-8534863.46668894,4491036.9692853],[-8526520.73877093,4479788.12528967],[-8507555.0144855,4468040.979071],[-8506255.58206947,4460369.74676236],[-8504461.00055839,4463252.59873089],[-8500777.66124702,4459536.52315083],[-8497831.3682842,4463808.50222633],[-8492082.49582116,4456139.226544],[-8504329.42092027,4454130.54594466],[-8491331.75717525,4449474.59396922],[-8492936.09367656,4441963.07454369],[-8503089.43311232,4437770.70668811],[-8507716.42774715,4434265.58485513],[-8519405.30823891,4448539.40830428],[-8517640.44903188,4451431.17545242],[-8523120.15096618,4455535.28396788],[-8523560.08559379,4450287.76902592],[-8529846.63119736,4457560.28907304],[-8528189.6405769,4464027.43481016],[-8532426.79435497,4470632.61626275],[-8537887.79461481,4471566.96402778],[-8543336.88368914,4466097.24976867],[-8548883.71127639,4472666.81270141],[-8555701.02821206,4473158.04840389],[-8557740.17864441,4484217.2630784],[-8558067.23530836,4475329.38034507],[-8565087.48767575,4472138.68644866],[-8560565.02204278,4467168.29702463],[-8549046.7943304,4468041.53814734],[-8541456.58617015,4460128.96268659],[-8536642.68611029,4466739.66942149],[-8535036.67981661,4459716.12295122],[-8534380.22877941,4446655.05724581],[-8524604.7076954,4442521.48512037],[-8528561.67031513,4438387.99233076],[-8522068.73837564,4439970.32554032],[-8514773.30422701,4433772.80917957],[-8517852.84662031,4426873.70613862],[-8513957.10972051,4427834.41224186],[-8514451.36825963,4424560.43180805],[-8522677.65599027,4417078.76700698],[-8522826.37882997,4410656.45408435],[-8516741.98942168,4420928.58974039],[-8506011.90370412,4425373.92526965],[-8499036.62441101,4427034.65315833],[-8498343.54926134,4419636.67358354],[-8504151.08709602,4416261.59633998],[-8504940.8988832,4414900.29461577],[-8495618.11416824,4417641.15598586],[-8492864.73788296,4415206.80874432],[-8494525.06808814,4431025.55503495],[-8491921.08255951,4433913.65960183],[-8482804.79549997,4430060.2428013],[-8481617.46181117,4425795.59107316],[-8473464.97890293,4429579.49964131],[-8459764.889171,4428398.06694679],[-8446718.80144748,4377380.83324331],[-8449370.32039869,4377425.7338403],[-8448353.75080877,4383362.03132577],[-8454804.15870278,4400367.27503318],[-8460132.68876858,4377488.65042566],[-8463305.62821466,4377497.65833707],[-8467167.41266977,4383995.72292784],[-8465397.43276616,4377530.36404837],[-8474462.95813789,4377559.46667208],[-8497045.00740123,4377406.19374255],[-8515669.3148084,4377372.37975691],[-8523019.07286854,4377294.63571128],[-8562876.79390809,4377142.89093799],[-8563155.31527405,4377141.36657218],[-8591343.63673272,4377437.92909669],[-8607228.92806892,4377109.63209688],[-8656641.20100326,4377043.53045682],[-8671661.09461803,4376974.7962701],[-8688671.71468666,4376909.80406787],[-8718681.77961217,4375947.71617069],[-8733994.66612671,4375386.41112626],[-8765006.0498719,4376022.8177189],[-8771608.52019034,4375670.73180258],[-8810305.95817735,4376020.73925568]]],[[[-8379098.33336256,4583323.80540003],[-8375966.13685011,4583456.36407183],[-8382230.6411945,4574182.62215568],[-8386719.15438278,4563726.47242106],[-8391939.815862,4561874.47305535],[-8387345.88311594,4565578.66102211],[-8391104.14044462,4565446.18964923],[-8387554.82980016,4567960.89485216],[-8379098.33336256,4583323.80540003]]],[[[-8445517.10754437,4516355.7383165],[-8453724.69360056,4517671.91523223],[-8452439.73271833,4521089.15940235],[-8447732.92200861,4520311.08690912],[-8449816.26627881,4521972.93680432],[-8437986.3439922,4538791.31206086],[-8436080.44299033,4549778.65973354],[-8426449.41460537,4554665.38327789],[-8425405.68305969,4559402.834134],[-8430667.86670898,4569622.17890225],[-8422259.79424987,4571119.98983564],[-8421120.88453957,4575207.18379281],[-8418696.12339111,4578919.80876222],[-8390459.48927343,4581786.92704973],[-8417748.3492465,4536728.6307652],[-8414629.73371192,4533923.84171153],[-8426829.01406898,4521598.82194476],[-8421349.42345417,4517419.00207021],[-8429949.4107154,4517198.39263835],[-8433175.00428063,4510510.41912634],[-8427471.9954478,4508115.59613361],[-8439467.44981721,4504688.69728947],[-8440298.11585751,4498681.94721138],[-8436990.0345496,4496145.47545962],[-8440986.84954705,4497552.60407447],[-8448827.63788107,4490441.10833255],[-8452643.55870597,4458988.38556689],[-8457051.36526342,4456716.53632709],[-8462337.48260323,4482234.71809611],[-8452984.08502831,4506876.65460476],[-8456434.76660392,4506134.42608178],[-8455238.97263382,4512095.20137014],[-8452573.0934683,4517016.82515685],[-8445517.10754437,4516355.7383165]]]]}]]></wps:ComplexData>
      </wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>`

// .then(function(geom) {
//   console.log(geom.coordinates);
//   var stJSONFeature = JSON.stringify(geom.coordinates);
//   console.log(stJSONFeature);
//   console.log('+++++');
//   return stJSONFeature;
// }).then(function(stJSONFeature) {
//   console.log(stJSONFeature);
//   fetch('http://localhost:8080/geoserver/wps', {
//     method: 'POST',
//     // body: new XMLSerializer().serializeToString(wpFeatureRequest)
//     body: test2clipData
//   }).then(function(response) {
//     return response.json();
// })
// });



fetch('http://localhost:8080/geoserver/wps', {
  method: 'POST',
  // body: new XMLSerializer().serializeToString(wpFeatureRequest)
  body: gsClip
}).then(function(response) {
  return response.json();
}).then(function(json) {
  // var features = new GeoJSON({'dataProjection': 'EPSG:4326', 'featureProjection': 'EPSG:3857'}).readFeatures(json);
  var features = new GeoJSON().readFeatures(json);
  console.log(features);
  var wpsVectorSource = new VectorSource({
  })
  wpsVectorSource.addFeatures(features);
  var wpsVector = new VectorLayer({
    source: wpsVectorSource
  })
  map.removeLayer(wpLayer);
  map.addLayer(wpsVector);
});
})
                      




