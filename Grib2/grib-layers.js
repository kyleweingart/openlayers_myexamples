
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
    var url = 'https://hvx-mapserver.hurrevac.com/geoserver/wfs?service=WFS&' +
        'version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json'
        + '&srsname=EPSG:3857&viewparams=date:1539075600;fcstHr:120;spd:' + strength;

    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: url,
            strategy: ol.loadingstrategy.all,
            projection: 'EPSG:3857'

        }),
        name: strength,
        style: styleFunction,
        visible: true,
        opacity: 0.9
    });
    return layer;
}

var createWPWMSLayer = (strength) => {
    var url = 'https://hvx-mapserver.hurrevac.com/geoserver/wms'

    var layer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: url,
            params: {
                'LAYERS': 'nhp:windprobs_view',
                'TILED': true,
                'VERSION': '1.1.1',
                'FORMAT': 'image/png8',
                // geoserver sql view params
                'VIEWPARAMS': 'date:1539075600;fcsthr:120;' + 'spd:' + strength,
            }
        }),
        name: "WMS " + strength,
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
                'TIME': '2018-10-09T12:00:00Z'
            }
        }),
        name: "Grib2 " + strength,
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
    });
    return layer;
}


var windStyles = {
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
        prob = 0;
    } else if (prob < 10) {
        prob = 5
    } else {
        prob = (Math.floor(prob / 10)) * 10;
    }

    if (prob === 100) {
        return windStyles.Hundred;
    } else if (prob === 10) {
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

var checkboxes = document.forms["windprobsForm"].elements["windprobs"];
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].onclick = function () {
        var strength = this.value;
        if (this.checked === true) {
            mapLayer = createWPLayer(strength);
            map.addLayer(mapLayer);
        } else {
            map.getLayers().forEach(function (layer) {
                if (layer.get('name') === strength) {
                    map.removeLayer(layer);
                }
            })

        }
    }
}


var checkboxesWMS = document.forms["windprobsWMSForm"].elements["windprobsWMS"];
for (var i = 0; i < checkboxesWMS.length; i++) {
    checkboxesWMS[i].onclick = function () {
        var strength = this.value;
        if (this.checked === true) {
            mapLayer = createWPWMSLayer(strength);
            map.addLayer(mapLayer);
        } else {
            map.getLayers().forEach(function (layer) {
                if (layer.get('name') === 'WMS ' + strength) {
                    map.removeLayer(layer);
                }
            })

        }
    }
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

