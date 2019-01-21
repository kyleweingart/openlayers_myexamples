var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})

var coords = [[0, 0], [0, 85]];
var coordsPrj = new ol.geom.LineString(coords);
coordsPrj.transform('EPSG:4326', 'EPSG:3857');

var linestring_feature = new ol.Feature({
    geometry: coordsPrj,
    title: 'Prime Meridian'
});

var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [linestring_feature]
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 5
        })
    })
})

var map = new ol.Map({
    layers: [raster, vector],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        center: [0,0],
        zoom:1
    }),
});