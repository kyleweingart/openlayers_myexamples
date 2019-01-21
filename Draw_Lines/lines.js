var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
})

var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: []
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'black',
            width: 3
        })
    })
})

var coords = [{coords:[[0, 0], [0, 85]], title: 'prime meredian'}, {coords:[[30, 0], [30, 85]], title: 'meridian'}, {coords:[[180, 0], [-180, 0]], title: 'equator'}];
console.log(coords.length);

for (var i=0; i <= 2; i++) {
console.log(coords[i]);
var coordsPrj = new ol.geom.LineString(coords[i].coords);
coordsPrj.transform('EPSG:4326', 'EPSG:3857');
console.log(coordsPrj);
var linestring_feature = new ol.Feature({
    geometry: coordsPrj,
    title: coords[i].title
})
vector.getSource().addFeature(linestring_feature);
};

var map = new ol.Map({
    layers: [raster, vector],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        center: [0,0],
        zoom:1
    }),
});