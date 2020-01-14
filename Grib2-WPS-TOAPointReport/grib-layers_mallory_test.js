
var map = new ol.Map({
  view: new ol.View({
    zoom: 4,
    center: [-10527519, 3160212],
    // proj: 'EPSG:4326'
  }),
  target: 'js-map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }), 
  ]
});



var createGrib2Layer = (strength) => {
  
  console.log('Grib2layer');
  var url = 'http://localhost:8080/geoserver/wms';
  
  if (strength === 'ERTOA') {
    // console.log('strength works')
    var layers = 'VAR0-2-227_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  } else if (strength === 'MLTOA') {
    console.log('MLTOA works');
    var layers = 'VAR0-2-228_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  } else if (strength === 'MLTOD') {
    var layers = 'VAR0-2-229_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  } else if (strength === 'LRTOD') {
    var layers = 'VAR0-2-230_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3'
  } else if (strength === 'test') {
    var layers = 'ncdc:AL632019_TOA_TOD_34kt_adv017_228'
  }
  
  var layer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: url,
      params: {
        // 'LAYERS': 'ncdc:' + layers,
        'LAYERS': layers,
        'TILED': true,
        'VERSION': '1.1.1',
        'FORMAT': 'image/png8',
        // 'projection': 'EPSG:4326'
        // 'TIME': '2018-10-10T00:00:00Z'
      }
    }),
    name: "Grib2 " + strength,
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
    // projection: 'EPSG:4326'
  });
  return layer;
}

var gribTestSource = new ol.source.TileWMS({
  url: 'http://localhost:8080/geoserver/wms',
  params: {
    // 'LAYERS': 'ncdc:' + layers,
    'LAYERS': 'ncdc:AL632019_TOA_TOD_34kt_adv017_227',
    'TILED': true,
    'VERSION': '1.1.1',
    'FORMAT': 'image/png8',
  },
  serverType: 'geoserver',
  crossOrigin: 'anonymous',
});
var gribTestSource1 = new ol.source.TileWMS({
  url: 'http://localhost:8080/geoserver/wms',
  params: {
    'LAYERS': 'ncdc:AL632019_TOA_TOD_34kt_adv017_228_test',
    'TILED': true,
    'VERSION': '1.1.1',
    'FORMAT': 'image/png8',
  },
  serverType: 'geoserver',
  crossOrigin: 'anonymous',
});


var checkboxesGrib2 = document.forms["windprobsGrib2Form"].elements["windprobsGrib2"];
for (var i = 0; i < checkboxesGrib2.length; i++) {
  checkboxesGrib2[i].onclick = function () {
    var strength = this.value;
    if (this.checked === true) {
      mapLayer = createGrib2Layer(strength);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'Grib2 ' + strength) {
          map.removeLayer(layer);
        }
      })
      
    }
  }
}

map.on('singleclick', function (evt) {
  console.log(evt.coordinate);
  $('#tb').empty();
  
  // this is the request for the original data - 0 to 360(its still necessary to edit coordinates to get proper data returned)

  var latLon = ol.proj.toLonLat(evt.coordinate, 'EPSG:3857');
  console.log(latLon);
  // var testLon = -86.50;
  // var testLat = 32.5;
  var newLon = latLon[0] + 359.25;
  // i think this should be add .5
  var newLat = latLon[1] + .75;
  // var newLon = 275.57;
  // var newLat = 29.5;
  console.log(newLon, newLat);
  var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>gs:HvxValuesAtPointWpsReport</ows:Identifier>
  <wps:DataInputs>
      <wps:Input>
        <ows:Identifier>point</ows:Identifier>
        <wps:Data>
          <wps:ComplexData mimeType="application/wkt"><![CDATA[POINT (` + newLon + ' ' + newLat + `)]]></wps:ComplexData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>coverageNames</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>ncdc:AL632019_TOA_TOD_34kt_adv017_228</wps:LiteralData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>dimensionName</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>time</wps:LiteralData>
        </wps:Data>
      </wps:Input>
    </wps:DataInputs>
    <wps:ResponseForm>
      <wps:RawDataOutput mimeType="application/json">
        <ows:Identifier>result</ows:Identifier>
      </wps:RawDataOutput>
    </wps:ResponseForm>
  </wps:Execute>`;

  var url = 'http://localhost:8080/geoserver/wps';
  $.ajax({
    type: 'POST',
    url: url,
    contentType: 'text/xml',
    dataType: 'json',
    data: postData,
  }).done(function (data) {
    console.log(data);
    var features = data.features;
    // console.log(features);
    // console.log(features[0].properties);
    var tableBody = document.getElementById('tb');
    var tr = tableBody.insertRow(-1);
    Object.keys(features[0].properties).forEach(function (key) {
      if (key !== 'band') {
        var epochTime = features[0].properties[key] * 1000;
        console.log('WPS: ' + epochTime);
        var d = new Date(epochTime);
        console.log(d);
        tr.insertCell(-1).innerText = d;
      }
    });

  }).fail(function () {
    var colLength = document.getElementById('table-report').rows[0].cells.length;
    var tableBody = document.getElementById('tb');
    var tr = tableBody.insertRow(-1);
    for (var i = 0; i < colLength; i++) {
      tr.insertCell(-1).innerText = 'X';
    }
  })

  // this is a wps request on the newest data - this grib2 has been corrected so that its data is exactly the same as the source data when the conversion to -180 to 180 is performed. 

  var newLon2 = latLon[0] - .75;
  // i think this should be add .5
  var newLat2 = latLon[1] + .75;

  var postData2 = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
    <ows:Identifier>gs:HvxValuesAtPointWpsReport</ows:Identifier>
    <wps:DataInputs>
      <wps:Input>
        <ows:Identifier>point</ows:Identifier>
        <wps:Data>
          <wps:ComplexData mimeType="application/wkt"><![CDATA[POINT (` + newLon2 + ' ' + newLat2 + `)]]></wps:ComplexData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>coverageNames</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>ncdc:AL632019_TOA_TOD_34kt_adv017_228_test</wps:LiteralData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>dimensionName</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>time</wps:LiteralData>
        </wps:Data>
      </wps:Input>
    </wps:DataInputs>
    <wps:ResponseForm>
      <wps:RawDataOutput mimeType="application/json">
        <ows:Identifier>result</ows:Identifier>
      </wps:RawDataOutput>
    </wps:ResponseForm>
  </wps:Execute>`;

  var url = 'http://localhost:8080/geoserver/wps';
  $.ajax({
    type: 'POST',
    url: url,
    contentType: 'text/xml',
    dataType: 'json',
    data: postData2,
  }).done(function (data) {
    console.log(data);
    var features = data.features;
    // console.log(features);
    // console.log(features[0].properties);
    var tableBody = document.getElementById('tb');
    var tr = tableBody.insertRow(-1);
    Object.keys(features[0].properties).forEach(function (key) {
      if (key !== 'band') {
        var epochTime = features[0].properties[key] * 1000;
        console.log('WPStest: ' + epochTime);
        var d = new Date(epochTime);
        console.log(d);
        tr.insertCell(-1).innerText = d;
      }
    });

  }).fail(function () {
    var colLength = document.getElementById('table-report').rows[0].cells.length;
    var tableBody = document.getElementById('tb');
    var tr = tableBody.insertRow(-1);
    for (var i = 0; i < colLength; i++) {
      tr.insertCell(-1).innerText = 'X';
    }
  })

  console.log(map.getView().getResolution());

  var parser = new ol.format.WMSGetFeatureInfo();

  wmsTimeArray = [];
  
    // var urlWMS = gribTestSource.getGetFeatureInfoUrl(evt.coordinate, map.getView().getResolution(), map.getView().getProjection(),
    //   {
    //     'INFO_FORMAT': 'application/vnd.ogc.gml',
    //   });
    // $.ajax({
    //   type: 'GET',
    //   url: urlWMS
    // }).done(function (data) {
     
    //   var features = parser.readFeatures(data);
    //   console.log(features[0].H);
    //   Object.keys(features[0].H).forEach(function (key) {
    //     if (key !== 'band') {
    //       var epochTime = features[0].H[key] * 1000;
    //       console.log('227: ' + epochTime);
    //       var d = new Date(epochTime);
    //       console.log(d);
    //       // tr.insertCell(-1).innerText = d;
    //     }
    //   });
  
    // })

    var urlWMS = gribTestSource1.getGetFeatureInfoUrl(evt.coordinate, map.getView().getResolution(), map.getView().getProjection(),
    {
      'INFO_FORMAT': 'application/vnd.ogc.gml',
    });
  $.ajax({
    type: 'GET',
    url: urlWMS
  }).done(function (data) {
    
    var features = parser.readFeatures(data);
    console.log(features[0].H);
    Object.keys(features[0].H).forEach(function (key) {
      if (key !== 'band') {
        var epochTime = features[0].H[key] * 1000;
        console.log('228: ' + epochTime);
        var d = new Date(epochTime);
        console.log(d);
        // tr.insertCell(-1).innerText = d;
      }
    });

  })
});


// WCS request example
// 
//           mapServerHost = 'http://' + http://localhost:8080 + '/geoserver/';
//           mapServerHost += 'wcs?service=WCS&' +
//                         'version=2.0.1&request=GetCoverage&CoverageId=nhp:' + abbr + '_MEOW_inundation' +
//                         '&crs=EPSG:4326' + '&format=geotiff' + '&subset=http://www.opengis.net/def/axis/OGC/0/Long(' + latLon[0] + ')' + 
//                         '&subset=http://www.opengis.net/def/axis/OGC/0/Lat(' + latLon[1] + ')' + '&subset=MAX_COLS("' + finalCol + '")';



// Ext.Ajax.request({
//   method: 'GET',
//   url: mapServerHost,
//   binary: true,
//   useDefaultXhrHeader: false,
//   success: function(response) {
//     var bytes = response.responseBytes;
//     var depth = bytes[390];
//     if (depth === undefined || depth === 255) {
//       iteration++;
//     } else {
//       surgeDepthArray.push({
//         direction: dir, 
//         category: cat,  
//         tide: tide,
//         speed: speed, 
//         surge: depth, 
//         filtered: false,
//         column: finalCol    
//       });
//       iteration++;
//     }
//     if (iteration === finalCols.length) {
//       callback(abbr, surgeDepthArray);
//     }
//   },
//   failure: function(response) {
//     if (response) {
//       window.console.warn(response);
//     }
//     self.toggleEmptyMessage(true);
//     self.enableButtons(false);
//     self.makeGraph();
//     self.drawBars();
//     self.loadMask.hide();
//   }
// });
// });
// },
