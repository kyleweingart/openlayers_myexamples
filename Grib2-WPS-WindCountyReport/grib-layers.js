var map = new ol.Map({
  view: new ol.View({
    zoom: 4,
    center: [-10527519, 3160212]
  }),
  target: 'js-map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ]
});


var createGrib2Layer = (strength) => {

  console.log('Grib2layer');
  var url = 'http://localhost:8080/geoserver/wms';

  if (strength === 'TS') {
    console.log('strength works')
    var layers = 'cum_above_17p'
  } else if (strength === 'STS') {
    console.log('STS works');
    var layers = 'cum_above_25p'
  } else if (strength === 'H') {
    var layers = 'cum_above_32p'
  } else if (strength === 'S') {
    var statesLayer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: url,
        params: {
          'LAYERS': 'topp:states',
          'TILED': true,
          'VERSION': '1.1.1',
          'FORMAT': 'image/png8',
        }
      }),
      name: "Grib2 " + strength,
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    });
    return statesLayer;
  }


  var layer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: url,
      params: {
        'LAYERS': 'ncdc:' + layers,
        'TILED': true,
        'VERSION': '1.1.1',
        'FORMAT': 'image/png8',
        // 'TIME': '2018-10-10T00:00:00Z'
      }
    }),
    name: "Grib2 " + strength,
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  });
  return layer;
}

var checkboxesGrib2 = document.forms["windprobsGrib2Form"].elements["windprobsGrib2"];
for (var i = 0; i < checkboxesGrib2.length; i++) {
  checkboxesGrib2[i].onclick = function () {
    var strength = this.value;
    console.log(strength);
    if (this.checked === true) {
      mapLayer = createGrib2Layer(strength);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        console.log(layer.get('name'));
        if (layer.get('name') === 'Grib2 ' + strength) {
          map.removeLayer(layer);
        }
      })

    }
  }
}

function getSummaryReport() {
  console.log('getReport');
  // local
//   var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//   <ows:Identifier>gs:HvxMaxValInFeatureCollectionWpsReport</ows:Identifier>
//   <wps:DataInputs>
//     <wps:Input>
//       <ows:Identifier>featureCollection</ows:Identifier>
//       <wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">
//         <wps:Body>
//           <wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:topp="http://www.openplans.org/topp">
//             <wfs:Query typeName="topp:states"/>
//           </wfs:GetFeature>
//         </wps:Body>
//       </wps:Reference>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>featureAttribute</ows:Identifier>
//       <wps:Data>
//         <wps:LiteralData>STATE_NAME</wps:LiteralData>
//       </wps:Data>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>coverageNames</ows:Identifier>
//       <wps:Data>
//         <wps:LiteralData>ncdc:cum_above_17p,ncdc:cum_above_25p,ncdc:cum_above_32p</wps:LiteralData>
//       </wps:Data>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>dimensionName</ows:Identifier>
//       <wps:Data>
//         <wps:LiteralData>time</wps:LiteralData>
//       </wps:Data>
//     </wps:Input>
//   </wps:DataInputs>
//   <wps:ResponseForm>
//     <wps:RawDataOutput mimeType="application/json">
//       <ows:Identifier>result</ows:Identifier>
//     </wps:RawDataOutput>
//   </wps:ResponseForm>
// </wps:Execute>`

//  dev

// var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//           <ows:Identifier>gs:HvxMaxValInFeatureCollectionWpsReport</ows:Identifier>
//           <wps:DataInputs>
//             <wps:Input>
//               <ows:Identifier>featureCollection</ows:Identifier>
//               <wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">
//                 <wps:Body>
//                   <wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:cite="http://www.opengeospatial.net/cite">
//                     <wfs:Query typeName="nhp:county500k_4326"/>
//                   </wfs:GetFeature>
//                 </wps:Body>
//               </wps:Reference>
//             </wps:Input>
//             <wps:Input>
//               <ows:Identifier>featureAttribute</ows:Identifier>
//               <wps:Data>
//                 <wps:LiteralData>title</wps:LiteralData>
//               </wps:Data>
//             </wps:Input>
//             <wps:Input>
//               <ows:Identifier>coverageNames</ows:Identifier>
//               <wps:Data>
//                 <wps:LiteralData>nhc:cumulative.tpcprblty.2019090118-17p491</wps:LiteralData>
//               </wps:Data>
//             </wps:Input>
//             <wps:Input>
//               <ows:Identifier>dimensionName</ows:Identifier>
//               <wps:Data>
//                 <wps:LiteralData>height_above_ground</wps:LiteralData>
//               </wps:Data>
//             </wps:Input>
//           </wps:DataInputs>
//           <wps:ResponseForm>
//             <wps:RawDataOutput mimeType="application/json">
//               <ows:Identifier>result</ows:Identifier>
//             </wps:RawDataOutput>
//           </wps:ResponseForm>
//           </wps:Execute>`;

//   var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//   <ows:Identifier>gs:HvxMaxValInFeatureCollectionWpsReport</ows:Identifier>
//   <wps:DataInputs>
//     <wps:Input>
//       <ows:Identifier>featureCollection</ows:Identifier>
//       <wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">
//         <wps:Body>
//           <wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" xmlns:topp="http://www.openplans.org/topp">
//             <wfs:Query typeName="topp:states"/>
//           </wfs:GetFeature>
//         </wps:Body>
//       </wps:Reference>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>featureAttribute</ows:Identifier>
//       <wps:Data>
//         <wps:LiteralData>STATE_NAME</wps:LiteralData>
//       </wps:Data>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>coverageNames</ows:Identifier>
//       <wps:Data>
//         <wps:LiteralData>ncdc:cum_above_17p,ncdc:cum_above_25p,ncdc:cum_above_32p</wps:LiteralData>
//       </wps:Data>
//     </wps:Input>
//     <wps:Input>
//       <ows:Identifier>dimensionName</ows:Identifier>
//       <wps:Data>
//         <wps:LiteralData>time</wps:LiteralData>
//       </wps:Data>
//     </wps:Input>
//   </wps:DataInputs>
//   <wps:ResponseForm>
//     <wps:RawDataOutput mimeType="application/json">
//       <ows:Identifier>result</ows:Identifier>
//     </wps:RawDataOutput>
//   </wps:ResponseForm>
// </wps:Execute>`


  $('#tb').empty();

  // local
  var url = 'http://localhost:8080/geoserver/wps';
  // dev
  // var url = 'https://dev-hvx.hurrevac.com/geoserver/wps';
  $.ajax({
    type: 'POST',
    url: url,
    contentType: 'text/xml',
    dataType: 'json',
    data: postData,
  }).done(function(data) {
    console.log(data);
    var features = data.features;
    features.sort(function (a, b) {
      a = a.properties.feature;
      b = b.properties.feature;
      return a > b ? 1 : a < b ? -1 : 0
    })
    var tableBody = document.getElementById('tb');
    for (var i = 0; i < features.length; i++) {
      var tr = tableBody.insertRow(-1);
      var tabCell = tr.insertCell(-1);
      tabCell.innerText = features[i].properties.feature + features[i].properties.coverage.substring(15);

      var keys = Object.keys(features[i].properties);

      keys.sort(function (a, b) {
        return a > b ? 1 : a < b ? -1 : 0
      })

      var parentArray = [];

      while (keys.length > 14) {
        parentArray.push(keys.splice(0,2))
      };

      while (keys.length <= 14 && keys.length > 2) {
        parentArray.push(keys.splice(0,4))
      }

      // another way to create the arrays instead of while loops
      
      // var arrayCol1 = keys.splice(0, 2);
      // parentArray.push(arrayCol1);

      // var arrayCol2 = keys.splice(0, 2);
      // parentArray.push(arrayCol2);

      // var arrayCol3 = keys.splice(0, 2);
      // parentArray.push(arrayCol3);

      // var arrayCol4 = keys.splice(0, 2);
      // parentArray.push(arrayCol4);

      // var arrayCol5 = keys.splice(0, 4);
      // parentArray.push(arrayCol5);

      // var arrayCol6 = keys.splice(0, 4);
      // parentArray.push(arrayCol6);

      // var arrayCol7 = keys.splice(0, 4);
      // parentArray.push(arrayCol7);
      
      for(var j = 0; j < parentArray.length; j++) {
        var maxArray = [];
        for (a = 0; a < parentArray[j].length; a++) {
          maxArray.push(features[i].properties[parentArray[j][a]]);
        }
        var max = Math.max.apply(null, maxArray);
        tr.insertCell(-1).innerText = max.toFixed(2);
      }
    };
  })
}
