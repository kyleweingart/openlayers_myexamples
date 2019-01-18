var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})

var linestring_feature = new ol.Feature({
    geometry: new ol.geom.LineString(
        [[0, -20000000], [0, 20000000]]
        ),
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