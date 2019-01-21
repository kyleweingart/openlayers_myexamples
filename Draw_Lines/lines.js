var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})


function lineStyleFunction(feature) {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 3
        }),
    })
}

var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: []
    }),
    style: lineStyleFunction
})


var lineCoords = [{ coords: [[0, 0], [0, 85]], title: 'NHC / JTWC border' }, { coords: [[180, 0], [180, 85]], title: 'JTWC / CPHC border' }, { coords: [[-140, 0], [-140, 85]], title: 'CPHC / NHC border' }, { coords: [[180, 0], [-180, 0]] }];

for (var i = 0; i <= 3; i++) {
    console.log(lineCoords[i]);
    var coordsPrj = new ol.geom.LineString(lineCoords[i].coords);
    coordsPrj.transform('EPSG:4326', 'EPSG:3857');
    console.log(coordsPrj);
    var linestring_feature = new ol.Feature({
        geometry: coordsPrj,
        title: lineCoords[i].title
    })
    vector.getSource().addFeature(linestring_feature);
};



var getLabelText = function(feature) {
    var text = feature.get('title');
    return text;
}

function pointStyleFunction(feature) {
    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
            stroke: new ol.style.Stroke({color: 'red', width: 1})
          }),
        text: new ol.style.Text({
            font: '12px',
            text: getLabelText(feature)
        })
    })
}
var label = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: []
    }),
    style: pointStyleFunction
})

var pointCoords = [{ coords: [2, 84], label: 'NHC' }, { coords: [-178, 84], label: 'JTWC' }, { coords: [-142,84], label: 'CPHC' }]

for (var i = 0; i <= 2; i++) {
    console.log(pointCoords[i]);
    var coordsPrj = new ol.geom.Point(pointCoords[i].coords);
    coordsPrj.transform('EPSG:4326', 'EPSG:3857');
    console.log(coordsPrj);
    var point_feature = new ol.Feature({
        geometry: coordsPrj,
        title: pointCoords[i].label
    })
    label.getSource().addFeature(point_feature);
};

console.log(label.getSource().getFeatures());


var map = new ol.Map({
    layers: [raster, label, vector],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        center: [0, 0],
        zoom: 1
    }),
});