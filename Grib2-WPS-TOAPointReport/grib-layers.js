
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

  $('#tb').empty();

  var latLon = ol.proj.toLonLat(evt.coordinate, 'EPSG:3857');
  var newLon = latLon[0] + 360;
  // console.log(newLon);
  // console.log(latLon);
  var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
    <ows:Identifier>gs:HvxValuesAtPointWpsReport</ows:Identifier>
    <wps:DataInputs>
      <wps:Input>
        <ows:Identifier>point</ows:Identifier>
        <wps:Data>
          <wps:ComplexData mimeType="application/wkt"><![CDATA[POINT (` + newLon + ' ' + latLon[1] + `)]]></wps:ComplexData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>coverageNames</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>ncdc:VAR0-2-227_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3,ncdc:VAR0-2-228_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3,ncdc:VAR0-2-229_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3,ncdc:VAR0-2-230_FROM_7-10--1_height_above_ground_120_Hour_Accumulation_probability_between_10p0_and_3</wps:LiteralData>
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
    var features = data.features;
    console.log(features);
    console.log(features[0].properties);
    var tableBody = document.getElementById('tb');
    var tr = tableBody.insertRow(-1);
    Object.keys(features[0].properties).forEach(function (key) {
      if (key !== 'band') {
        var epochTime = features[0].properties[key] * 1000;
        var d = new Date(epochTime);
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
});



