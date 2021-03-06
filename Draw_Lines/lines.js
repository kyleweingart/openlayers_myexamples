var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})

function lineStyleFunction(feature) {
    var geom = feature.getGeometry();
    var view = map.getView();
    var size = map.getSize();
    var resolution = view.getResolution();
    console.log(resolution);
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

    if (feature.get('position') !== 'center') {
        styles.push(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 255, 0.6',
                width: 2
            })
        }));
    }

    if (feature.get('position') === 'left') {
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

    if (feature.get('position') === 'right') {
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

    if (feature.get('position') === 'center') {
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(pt),
            text: new ol.style.Text({
                font: '12px sans-serif',
                textAlign: 'center',
                textBaseline: 'top',
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


var lineCoords = [{ coords: [[0, 0], [0, 85]], title: 'NHC / JTWC border', label: 'NHC', position: 'left' },
{ coords: [[0, 0], [0, 85]], title: 'NHC / JTWC border', label: 'JTWC', position: 'right' },
{ coords: [[180, 0], [180, 85]], title: 'JTWC / CPHC border', label: 'JTWC', position: 'left' },
{ coords: [[-140, 0], [-140, 85]], title: 'CPHC / NHC border', label: 'CPHC', position: 'left' },
{ coords: [[180, 0], [180, 85]], title: 'CPHC / NHC border', label: 'CPHC', position: 'right' },
{ coords: [[-160, 0], [-160, 85]], title: 'CPHC / NHC border', label: 'CPHC', position: 'center' },
{ coords: [[-140, 0], [-140, 85]], title: 'CPHC / NHC border', label: 'NHC', position: 'right' },
{ coords: [[180, 0], [-180, 0]] }];

for (var i = 0; i <= lineCoords.length - 1; i++) {
    var coordsPrj = new ol.geom.LineString(lineCoords[i].coords);
    coordsPrj.transform('EPSG:4326', 'EPSG:3857');
    var linestring_feature = new ol.Feature({
        geometry: coordsPrj,
        title: lineCoords[i].title,
        label: lineCoords[i].label,
        position: lineCoords[i].position
    })
    vector.getSource().addFeature(linestring_feature);
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


