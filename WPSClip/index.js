
//  this is a prototype for using WPS clipping

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {WFS, GeoJSON} from 'ol/format';
import OSM from 'ol/source/OSM';
import {Fill, Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import {
  equalTo as equalToFilter,
  like as likeFilter,
  and as andFilter,
  within as withinFilter,
  bbox as bboxFilter,
  intersects as intersectsFilter
} from 'ol/format/filter';


var clipVectorSource = new VectorSource();


// state outlines - used to clip layers and filter
var clipVector = new VectorLayer({
  source: clipVectorSource,
  zIndex:100,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(4, 26, 0, 1.0)',
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


// style windprobs data
var styleFunction = function(feature) {
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
}


var url = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS'

var wpLayer = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: url,
        // strategy: ol.loadingstrategy.all,
        projection: 'EPSG:3857',
        useSpatialIndex: false

    }),
    style: styleFunction,
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
  console.log(stJSON);
  var extent = geometry.getExtent();

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


// working example of using WFS get request as input reference to CollectGeometries WPS process
//  var getCollectGeoms = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//   <ows:Identifier>vec:CollectGeometries</ows:Identifier>
//   <wps:DataInputs>
//     <wps:Input>
//       <ows:Identifier>features</ows:Identifier>
//       <wps:Reference mimeType="application/json" xlink:href="https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&amp;version=2.0.0&amp;request=GetFeature&amp;typename=nhp:windprobs_view&amp;outputFormat=application/json&amp;srsname=EPSG:3857&amp;viewparams=date:1567393200;fcstHr:120;spd:TS" method="GET"/>
//     </wps:Input>
//   </wps:DataInputs>
//   <wps:ResponseForm>
//     <wps:RawDataOutput mimeType="application/json">
//       <ows:Identifier>result</ows:Identifier>
//     </wps:RawDataOutput>
//   </wps:ResponseForm>
// </wps:Execute>`


// working clip with WFS request as input reference and dynamic clip features
// potentially could use WFS request to get clip reference as well - need to try it
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
        <wps:ComplexData mimeType="application/json"><![CDATA[{"type":"MultiPolygon","coordinates":${stJSON}}]]></wps:ComplexData>
      </wps:Data>
      </wps:Input>
      </wps:DataInputs>
      <wps:ResponseForm>
      <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
      </wps:RawDataOutput>
      </wps:ResponseForm>
      </wps:Execute>`

    
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
    source: wpsVectorSource,
    style: styleFunction
  })
  map.removeLayer(wpLayer);
  map.addLayer(wpsVector);
});
})
                      




