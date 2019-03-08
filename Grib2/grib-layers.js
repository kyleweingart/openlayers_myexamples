
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

var createWPLayer = (strength) => {
    var url = 'http://hvx-mapserver.hurrevac.com/geoserver/wfs?service=WFS&' +
        'version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json'
        + '&srsname=EPSG:3857&viewparams=date:1539075600;fcstHr:120;spd:' + strength;
    map.removeLayer(geologyLayer);
    // map.removeLayer(layer);
    console.log(url);

    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: url,
            strategy: ol.loadingstrategy.all,
            projection: 'EPSG:3857'

        }),
        style: styleFunction,

        // style: function(feature) {
        //   var val = feature.get('prob');
        //   console.log(val);
        //   var fillColor = new ol.style.Fill({
        //       color: 'green'
        //   });
        //   console.log(fillColor);

        //   switch (val) {
        //     case val < 5:
        //       val = 0;
        //       break;
        //     case val < 10:
        //       val = 5;
        //       break;
        //     default:
        //       val = (Math.floor(val / 10)) * 10;
        //   }

        //   switch (val) {
        //     case 0:
        //       fillColor = new ol.style.Fill({
        //           color: (0, 0, 0, 0.0)
        //       })
        //       break;
        //     case 5:
        //       fillColor = new ol.style.Fill({
        //         color: (1, 50, 32)
        //       })
        //       break;
        //     case 10:
        //       fillColor = new ol.style.Fill({
        //         color: (0, 255, 0)
        //       })
        //       break;
        //     case 20:
        //       fillColor = new ol.style.Fill({
        //         color: (50, 205, 50)
        //       })
        //       break;
        //     case 30:
        //       fillColor = new ol.style.Fill({
        //         color: (255, 255, 224)
        //       })
        //       break;
        //     case 40:
        //       fillColor = new ol.style.Fill({
        //         color: (255, 255, 0)
        //       })
        //       break;
        //     case 50:
        //       fillColor = new ol.style.Fill({
        //         color: (255, 140, 0)
        //       })
        //       break;
        //     case 60:
        //       fillColor = new ol.style.Fill({
        //         color: (255, 165, 0)
        //       })
        //       break;
        //     case 70:
        //       fillColor = new ol.style.Fill({
        //         color: (255, 0, 0)
        //       });
        //       break;
        //     case 80:
        //       fillColor = new ol.style.Fill({
        //         color: (139, 0, 0)
        //       });
        //       break;
        //     case 90:
        //       fillColor = new ol.style.Fill({
        //         color: (128, 0, 128)
        //       });;
        //       break;
        //     }


        //   return [new ol.style.Style({
        //     fill: new ol.style.Fill({
        //       color: fillColor
        //     })
        //   })];
        // },
        visible: true,
        opacity: 0.9
    });
    return layer;
}


// update colors
var windStyles = {
    // default: new ol.style.Style({
    //     fill: new ol.style.Fill({ color: 'red' })
    // }),
    // Zero: new ol.style.Style({
    //     fill: new ol.style.Fill({ color: [0, 0, 0, 0] }),
    // }),
    Five: new ol.style.Style({
        fill: new ol.style.Fill({ color: [1, 50, 32, .9] }),
    }),
    Ten: new ol.style.Style({
        fill: new ol.style.Fill({ color: [0, 255, 0, .9] }),
    }),
    Twenty: new ol.style.Style({
        fill: new ol.style.Fill({ color: [50, 205, 50, .9] }),
    }),
    Thirty: new ol.style.Style({
        fill: new ol.style.Fill({ color: [255, 255, 224, .9] }),

    }),
    Forty: new ol.style.Style({
        fill: new ol.style.Fill({ color: [255, 255, 0, .9] }),
    }),
    Fifty: new ol.style.Style({
        fill: new ol.style.Fill({ color: [255, 140, 0, .9] }),

    }),
    Sixty: new ol.style.Style({
        fill: new ol.style.Fill({ color: [255, 165, 0, .9] }),

    }),
    Seventy: new ol.style.Style({
        fill: new ol.style.Fill({ color: [255, 0, 0, .9] }),

    }),
    Eighty: new ol.style.Style({
        fill: new ol.style.Fill({ color: [139, 0, 0, .9] }),

    }),
    Ninety: new ol.style.Style({
        fill: new ol.style.Fill({ color: [128, 0, 128, .9] }),
    }),
    Hundred: new ol.style.Style({
        fill: new ol.style.Fill({ color: [48, 25, 52, .9] }),
    })
}



function styleFunction(feature) {
    var prob = feature.get('prob');


    if (prob < 5) {
        console.log('less than 5');
        prob = 0;
    } else if (prob < 10) {
        console.log('less than 10');
        prob = 5
    } else {
        prob = (Math.floor(prob / 10)) * 10;
    }

    if (prob === 100) {
        return windStyles.Hundred;
    } else if ( prob === 10) {
        return windStyles.Ten;
    } else if (prob === 20) {
        return windStyles.Twenty;
    } else if (prob === 30) {
        return windStyles.Thirty;
    } else if (prob === 40) {
        return windStyles.Forty;
    } else if (prob === 50) {
        return windStyles.Fifty;
    } else if (prob === 60) {
        return windStyles.Sixty;
    } else if (prob === 70) {
        return windStyles.Seventy;
    } else if (prob === 80) {
        return windStyles.Eighty;
    } else if (prob === 90) {
        return windStyles.Ninety;
    } 
}


var geologyLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/wms',
        params: {
            LAYERS: 'BGS_EN_Bedrock_and_Superficial_Geology'
        },
        attributions: [
            new ol.Attribution({
                html: 'Contains <a href="http://bgs.ac.uk/">British Geological Survey</a> ' +
                    'materials &copy; NERC 2015'
            })
        ]
    }),
    opacity: 0.85
});

map.addLayer(geologyLayer);

var radios = document.forms["windprobsForm"].elements["windprobs"];
for (var i = 0; i < radios.length; i++) {
    radios[i].onclick = function () {
        // map.removeLayer(geologyLayer);
        var strength = this.value;
        this.mapLayers = createWPLayer(strength);
        map.addLayer(this.mapLayers);
    }
}
