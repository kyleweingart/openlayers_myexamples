
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
        var layers = 'above_17p';
    }   else if (strength === 'STS') {
        console.log('STS works');
        var layers = 'above_25p'
    }   else if (strength === 'H') {
        var layers = 'above_32p'
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
                // console.log(layer.get('name'));
                if (layer.get('name') === 'Grib2 ' + strength) {
                    map.removeLayer(layer);
                }
            })

        }
    }
}

map.on('singleclick', function (evt) {
    console.log(evt.coordinate);
    var postData = `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
    <ows:Identifier>gs:HvxValuesAtPointWpsReport</ows:Identifier>
    <wps:DataInputs>
      <wps:Input>
        <ows:Identifier>point</ows:Identifier>
        <wps:Data>
          <wps:ComplexData mimeType="application/wkt"><![CDATA[POINT (-78 28)]]></wps:ComplexData>
        </wps:Data>
      </wps:Input>
      <wps:Input>
        <ows:Identifier>coverageNames</ows:Identifier>
        <wps:Data>
          <wps:LiteralData>ncdc:above_17p</wps:LiteralData>
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
  console.log(postData);

    var url = 'http://localhost:8080/geoserver/wps';
    $.ajax({
      type: 'POST',
      url: url,
      contentType: 'text/xml',
      dataType: 'text',
      data: postData,
      crossDomain: true,
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    }).done(function (data) {
      console.log(data);
      var features = parser.readFeatures(data);
      console.log(features);
    })
    //   if (features.length > 0) {
    //     console.log(features);
    //     // below works but has generalized data
    //     // geom = features[0].H.geom;
    //     // features[0].setGeometry(geom);
    //     features[0].getGeometry().transform('EPSG:4326', 'EPSG:3857')
    //     featureOverlay.getSource().clear();
    //     featureOverlay.getSource().addFeatures(features);
    //     overlay.setPosition(evt.coordinate);
    //     content.innerText = features[0].H.zone_name;
    //     container.style.display = 'block';
    //     console.log(overlay);
    //   } else {
    //     featureOverlay.getSource().clear();
    //     container.style.display = 'none';
    //   }
  
    // })
  });


//   var postData = 
//           `<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
//             <ows:Identifier>ras:RasterAsPointCollection</ows:Identifier>
//           <wps:DataInputs>
//             <wps:Input>
//               <ows:Identifier>data</ows:Identifier>
//               <wps:Reference mimeType="image/tiff" xlink:href="https://dev-hvx.hurrevac.com/geoserver/wcs?request=GetCoverage&amp;service=WCS&amp;version=2.0.1&amp;coverageId=nhp:` + `${abbr}` + `_MEOW_inundation&amp;format=geotiff&amp;subset=http://www.opengis.net/def/axis/OGC/0/Long(` + `${latLon[0]}` + `)&amp;subset=http://www.opengis.net/def/axis/OGC/0/Lat(` + `${latLon[1]}` + `)&amp;subset=MAX_COLS(%22` + `${finalCol}` + `%22)" method="GET"/>
//             </wps:Input>
//             <wps:Input>
//               <ows:Identifier>targetCRS</ows:Identifier>
//               <wps:Data>
//                 <wps:LiteralData>EPSG:4326</wps:LiteralData>
//               </wps:Data>
//             </wps:Input>
//           </wps:DataInputs>
//           <wps:ResponseForm>
//             <wps:RawDataOutput mimeType="application/json">
//               <ows:Identifier>result</ows:Identifier>
//             </wps:RawDataOutput>
//           </wps:ResponseForm>
//         </wps:Execute>`;

          // https://dev-hvx.hurrevac.com/geoserver/wcs?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=nhp:ny3_MEOW_inundation&crs=EPSG:4326&format=geotiff&subset=http://www.opengis.net/def/axis/OGC/0/Long(-73.94141176492911)&subset=http://www.opengis.net/def/axis/OGC/0/Lat(40.5769557739676)&subset=MAX_COLS(%22wnw460i2%22)
                        
        //   Ext.Ajax.request({
        //     method: 'POST',
        //     url: 'https://dev-hvx.hurrevac.com/geoserver/wps',
        //     contentType: 'text/xml',
        //     xmlData: postData,
        //     // dataType: 'text'
           
        //     useDefaultXhrHeader: false,
        //     success: function(response) {
        //       console.log(response);
        //       var res = response.responseText;
        //       console.log(res);
        //       var resDepth = Ext.JSON.decode(res);
        //       var depth = (resDepth.features[0].properties.GRAY_INDEX);
        //       console.log(depth);
        //       if (depth === undefined || depth === 255 || depth === -1) {
        //         iteration++;
        //       } else {
        //         surgeDepthArray.push({
        //           direction: dir, 
        //           category: cat,  
        //           tide: tide,
        //           speed: speed, 
        //           surge: depth, 
        //           filtered: false,
        //           column: finalCol    
        //         });
        //         iteration++;
        //       }
        //       if (iteration === finalCols.length) {
        //         callback(abbr, surgeDepthArray);
        //       }
        //     },
        //     failure: function(response) {
        //       if (response) {
        //         window.console.warn(response);
        //       }
        //       self.toggleEmptyMessage(true);
        //       self.enableButtons(false);
        //       self.makeGraph();
        //       self.drawBars();
        //       self.loadMask.hide();
        //     }
        //   });
