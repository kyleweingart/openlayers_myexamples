var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})

function lineStyleFunction(feature, resolution) {
    var geom = feature.getGeometry();
    var view = map.getView();
    var size = map.getSize();
    console.log(resolution);
    // var resolution = view.getResolution();
    // console.log(resolution);
    var viewExtent = view.calculateExtent(size);
    var lastCoordinate = geom.getLastCoordinate();
    // var firstCoordinate = geom.getFirstCoordinate();
    var vTl = ol.extent.getTopLeft(viewExtent);

    if (vTl[1] >= lastCoordinate[1] || (vTl[1] <= 1000000)) {
        var pt = lastCoordinate;
    } else if (vTl[1] < lastCoordinate[1]) {
        pt = [lastCoordinate[0], vTl[1]];
    }

    var styles = [];
    //  trying find multiples need to work on this 
    if (resolution > 75000) {
        console.log('greater');
        var gratCoords = feature.get('coords');
        console.log(gratCoords);
        console.log(gratCoords[0][1]);
        console.log(gratCoords[0][1] % 20);
        if ((gratCoords[0][0] % 30 === 0 && feature.get('type') === 'longitude')  || (gratCoords[0][1] % 20 === 0 && feature.get('type') === 'latitude')) {
            console.log(feature);
            styles.push(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 120, 0, 0.8',
                    width: 1,
                    lineDash: [0.5, 4]
                })
            }));
        }
    }
    // styles.push(new ol.style.Style({
    //     stroke: new ol.style.Stroke({
    //         color: 'rgba(255, 120, 0, 0.8',
    //         width: 1,
    //         lineDash: [0.5, 4]
    //     })
    // }));


    if (feature.get('type') === 'longitude') {
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(pt),
            text: new ol.style.Text({
                font: '12px sans-serif',
                textAlign: 'end',
                textBaseline: 'top',
                offsetX: -10,
                offsetY: 10,
                text: getText(feature, resolution),
                // text: feature.get('label'),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.6'
                }),
                stroke: new ol.style.Stroke({
                    color: '#e7e7e7',
                    width: 3
                })
            })
        }));
    }

    if (feature.get('type') === 'latitude') {
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(pt),
            text: new ol.style.Text({
                font: '12px sans-serif',
                textAlign: 'start',
                textBaseline: 'top',
                offsetX: 10,
                offsetY: 10,
                text: getText(feature, resolution),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.6'
                }),
                stroke: new ol.style.Stroke({
                    color: '#e7e7e7',
                    width: 3
                })
            })
        }));
    }
    return styles;
}

var getText = function (feature, resolution) {
    if (resolution > 45000) {
        if ((feature.get('label') === 'CPHC' && feature.get('position') === 'left') || (feature.get('label') === 'CPHC' && feature.get('position') === 'right')) {
            var text = '';
        } else {
            text = feature.get('label');
        }
    } else if (resolution <= 45000) {
        if (feature.get('position') === 'center') {
            text = '';
        } else {
            text = feature.get('label')
        }
    }
    return text;
}

var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: []
    }),
    style: lineStyleFunction
})


var graticuleCoords = [];


for (var i = -85; i < 86; i++) {
    if (i < 0) {
        graticuleCoords.push({ coords: [[180, i], [-180, i]], label: String(i) + ' S', type: 'latitude' })
    } else if (i === 0) {
        graticuleCoords.push({ coords: [[180, i], [-180, i]], label: String(i), type: 'latitude' })
    } else if (i > 0) {
        graticuleCoords.push({ coords: [[180, i], [-180, i]], label: String(i) + ' N', type: 'latitude' })
    }
}

for (var j = -180; j < 181; j++) {
    if (j < 0) {
        graticuleCoords.push({ coords: [[j, 85], [j, -85]], label: String(j) + ' W', type: 'longitude' })
    } else if (j === 0) {
        graticuleCoords.push({ coords: [[j, 85], [j, -85]], label: String(j), type: 'longitude' })
    } else if (j > 0) {
        graticuleCoords.push({ coords: [[j, 85], [j, -85]], label: String(j) + ' E', type: 'longitude' })
    }
}


for (var e = 0; e <= graticuleCoords.length - 1; e++) {
    var coordsPrj = new ol.geom.LineString(graticuleCoords[e].coords);
    coordsPrj.transform('EPSG:4326', 'EPSG:3857');
    var graticule_feature = new ol.Feature({
        geometry: coordsPrj,
        coords: graticuleCoords[e].coords,
        label: graticuleCoords[e].label,
        type: graticuleCoords[e].type
    })
    vector.getSource().addFeature(graticule_feature);
};

var map = new ol.Map({
    layers: [raster, vector],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        center: [0, 0],
        zoom: 1
    }),
});


