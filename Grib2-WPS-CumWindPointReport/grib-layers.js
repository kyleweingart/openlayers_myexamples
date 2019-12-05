
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
        var layers = 'cum_above_17p';
    }   else if (strength === 'STS') {
        console.log('STS works');
        var layers = 'cum_above_25p'
    }   else if (strength === 'H') {
        var layers = 'cum_above_32p'
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
    var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
    <ows:Identifier>gs:HvxValuesAtPointWpsReport</ows:Identifier>
    <wps:DataInputs>
      <wps:Input>
        <ows:Identifier>point</ows:Identifier>
        <wps:Data>
          <wps:ComplexData mimeType="application/wkt"><![CDATA[POINT (` + latLon[0] + ' ' + latLon[1] + `)]]></wps:ComplexData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>coverageNames</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>ncdc:cum_above_17p,ncdc:cum_above_25p,ncdc:cum_above_32p</wps:LiteralData>
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
    }).done(function(data) {
      var features = data.features;
     
      features.sort(function(a,b) {
        a = a.properties.band;
        b = b.properties.band;
        return a>b ? 1 : a<b ? -1 : 0
      });
      
      var tableBody = document.getElementById('tb');
      for (var i =0; i < features.length; i++) {
      var tr = tableBody.insertRow(-1);
      var tabCell = tr.insertCell(-1);
      var tabCell1 = tr.insertCell(-1);
      var tabCell2 = tr.insertCell(-1);
      var tabCell3 = tr.insertCell(-1);
      tabCell.innerText = features[i].properties.band;
      tabCell1.innerText = features[i].properties.cum_above_17p;
      tabCell2.innerText = features[i].properties.cum_above_25p;
      tabCell3.innerText = features[i].properties.cum_above_32p;
      }
    })
  });

  


