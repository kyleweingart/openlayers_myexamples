// this script is meant to test the TOA/TOD WPS requests - currently without transforming the coordinates a WMS request and a WPS request return different 
// time data which is unexpected.  It is necessary to adjust the latLon (see line 98) in order to get the correct WFS request.  I'm not sure why exactly 
// this is happening.  We did do some processing on the data to transform the grid from 100 to 360 to -180 to 180- but i do not believe this should have resulted 
// in any errors between the WMS and WPS.  Not sure if there is some config data missing in the Grib published layer? where the coordinate system is not properly 
// defined. In geoserver it says the data is published in 4326 which seems good.  Maybe it has something to do with how the WPS process was built by Boundless. 



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

  var url = 'https://dev-hvx.hurrevac.com/geoserver/wms';
  
  if (strength === 'ERTOA') {
    // console.log('strength works')
    var layers = 'AL052019_TOA_TOD_34kt_adv007_227'
  } else if (strength === 'MLTOA') {
    console.log('MLTOA works');
    var layers = 'AL052019_TOA_TOD_34kt_adv007_228'
  } else if (strength === 'MLTOD') {
    var layers = 'AL052019_TOA_TOD_34kt_adv007_229'
  } else if (strength === 'LRTOD') {
    var layers = 'AL052019_TOA_TOD_34kt_adv007_230'
  } 
  
  var layer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: url,
      params: {
        'LAYERS': 'nhc:' + layers,
        'TILED': true,
        'VERSION': '1.1.1',
        'FORMAT': 'image/png8',
      }
    }),
    name: "Grib2 " + strength,
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
  });
  return layer;
}

var gribTestSource = new ol.source.TileWMS({
  url: 'https://dev-hvx.hurrevac.com/geoserver/wms',
  params: {
    
    'LAYERS': 'nhc:AL052019_TOA_TOD_34kt_adv007_227',
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
  
  // this is the request for the -180 to 180 data in dev geoserver

  var latLon = ol.proj.toLonLat(evt.coordinate, 'EPSG:3857');
  // console.log(latLon);
 
  // with coordinate correction for WPS
  var newLon = latLon[0] - .75;
  var newLat = latLon[1] + .75;

  // without coordinate correction for WPS
  // var newLon = latLon[0]; 
  // var newLat = latLon[1];
 
  // console.log(newLon, newLat);
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
          <wps:LiteralData>nhc:AL052019_TOA_TOD_34kt_adv007_227,nhc:AL052019_TOA_TOD_34kt_adv007_228,nhc:AL052019_TOA_TOD_34kt_adv007_229,nhc:AL052019_TOA_TOD_34kt_adv007_230</wps:LiteralData>
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

  var url = 'https://dev-hvx.hurrevac.com/geoserver/wps';
  $.ajax({
    type: 'POST',
    url: url,
    contentType: 'text/xml',
    dataType: 'json',
    data: postData,
  }).done(function (data) {
    var features = data.features;
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

  var parser = new ol.format.WMSGetFeatureInfo();

    var urlWMS = gribTestSource.getGetFeatureInfoUrl(evt.coordinate, map.getView().getResolution(), map.getView().getProjection(),
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
          console.log('227: ' + epochTime);
          var d = new Date(epochTime);
          console.log(d);
        }
      });
  
    })
});



