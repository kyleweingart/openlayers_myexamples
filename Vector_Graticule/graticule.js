var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})



function getStyles(feature, pt) {

    var styles =
        [
            (new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 120, 0, 0.8',
                    width: 1,
                    lineDash: [0.5, 4]
                }),
            })),
            (new ol.style.Style({
                geometry: new ol.geom.Point(pt),
                text: new ol.style.Text({
                    font: '11px sans-serif',
                    textBaseline: 'top',
                    offsetY: 1,
                    text: feature.get('label'),
                    fill: new ol.style.Fill({
                        color: 'rgb(20, 20, 20)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffffff',
                        width: 2
                    })
                }),
            }))
        ];
    return styles;
}

function lineStyleFunction(feature, resolution) {
    var geom = feature.getGeometry();
    var view = map.getView();
    var size = map.getSize();
    console.log(resolution);
    var viewExtent = view.calculateExtent(size);
    var lastCoordinate = geom.getLastCoordinate();
    var firstCoordinate = geom.getFirstCoordinate();
    var vTl = ol.extent.getTopLeft(viewExtent);
    var vTr = ol.extent.getTopRight(viewExtent);
    // console.log('VTR: ' + vTr[0]);
    // console.log('last Coordiante ' + lastCoordinate[0]);
    // || (vTl[1] <= resolution * 100 / 3))
    // longitude
    if (vTl[1] >= lastCoordinate[1] && feature.get('type') === 'longitude') {  
        var pt = lastCoordinate;
    } else if (vTl[1] < lastCoordinate[1] && feature.get('type') === 'longitude') {
        pt = [lastCoordinate[0], vTl[1]];
    } else if (feature.get('type') === 'latitude') {
        console.log('VTR: ' + vTr);
        console.log('last Coordiante ' + lastCoordinate);
        pt = [vTr[0], firstCoordinate[1]];
    }

    // having issues crossing the international date line with latitude labels - might need to tweeak this so it works somehow
    // migrate code to hvx

    var gratCoords = feature.get('coords');

    if (resolution > 50000) {
        if ((gratCoords[0][0] % 45 === 0 && feature.get('type') === 'longitude') || (gratCoords[0][1] % 45 === 0 && feature.get('type') === 'latitude')) {
            var style = getStyles(feature, pt);
        }
        return style;
    } else if (resolution > 25000 && resolution <= 50000) {
        if ((gratCoords[0][0] % 30 === 0 && feature.get('type') === 'longitude') || (gratCoords[0][1] % 30 === 0 && feature.get('type') === 'latitude')) {
            var style = getStyles(feature, pt);
        }
        return style;
    } else if (resolution > 10000 && resolution <= 25000) {
        if ((gratCoords[0][0] % 20 === 0 && feature.get('type') === 'longitude') || (gratCoords[0][1] % 20 === 0 && feature.get('type') === 'latitude')) {
            var style = getStyles(feature, pt);
        }
        return style;
    } else if (resolution > 5000 && resolution <= 10000) {
        if ((gratCoords[0][0] % 10 === 0 && feature.get('type') === 'longitude') || (gratCoords[0][1] % 10 === 0 && feature.get('type') === 'latitude')) {
            var style = getStyles(feature, pt);
        }
        return style;
    } else if (resolution > 2500 && resolution <= 5000) {
        if ((gratCoords[0][0] % 5 === 0 && feature.get('type') === 'longitude') || (gratCoords[0][1] % 5 === 0 && feature.get('type') === 'latitude')) {
            var style = getStyles(feature, pt);
        }
        return style;
    } else if (resolution > 1500 && resolution <= 2500) {
        if ((gratCoords[0][0] % 2 === 0 && feature.get('type') === 'longitude') || (gratCoords[0][1] % 2 === 0 && feature.get('type') === 'latitude')) {
            var style = getStyles(feature, pt);
        }
        return style;
    } else if (resolution < 1500) {

        var style = getStyles(feature, pt);

        return style;
    }

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
        graticuleCoords.push({ coords: [[180, i], [-180, i]], label: String(Math.abs(i)) + ' S', type: 'latitude' })
    } else if (i === 0) {
        graticuleCoords.push({ coords: [[180, i], [-180, i]], label: String(i), type: 'latitude' })
    } else if (i > 0) {
        graticuleCoords.push({ coords: [[180, i], [-180, i]], label: String(i) + ' N', type: 'latitude' })
    }
}

for (var j = -180; j < 181; j++) {
    if (j === 0 || j === 180 || j === -180) {
        graticuleCoords.push({ coords: [[j, -85], [j, 85]], label: String(Math.abs(j)), type: 'longitude' })
    } else if (j < 0) {
        graticuleCoords.push({ coords: [[j, -85], [j, 85]], label: String(Math.abs(j)) + ' W', type: 'longitude' })
    } else if (j > 0) {
        graticuleCoords.push({ coords: [[j, -85], [j, 85]], label: String(j) + ' E', type: 'longitude' })
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


