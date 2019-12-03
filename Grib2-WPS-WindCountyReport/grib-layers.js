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
        var layers = 'Wind_speed_height_above_ground_Mixed_intervals_Accumulation_probability_above_17p491'
    }   else if (strength === 'STS') {
        console.log('STS works');
        var layers = 'Wind_speed_height_above_ground_Mixed_intervals_Accumulation_probability_above_25p722'
    }   else if (strength === 'H') {
        var layers = 'Wind_speed_height_above_ground_Mixed_intervals_Accumulation_probability_above_32p924'
    }

    var layer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: url,
            params: {
                'LAYERS': 'nhp:' + layers,
                'TILED': true,
                'VERSION': '1.1.1',
                'FORMAT': 'image/png8',
                'TIME': '2018-10-10T00:00:00Z'
            }
        }),
        name: "Grib2 " + strength,
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
    });
    return layer;
}

var createGrib2Layer = (strength) => {

    console.log('Grib2layer');
    var url = 'http://localhost:8080/geoserver/wms';

    if (strength === 'TS') {
        console.log('strength works')
        var layers = 'above_17'
    }   else if (strength === 'STS') {
        console.log('STS works');
        var layers = 'above_25p'
    }   else if (strength === 'H') {
        var layers = 'above_32p'
    }   else if (strength === 'S') {
        var statesLayer = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url:url,
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

