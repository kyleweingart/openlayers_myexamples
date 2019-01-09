// add basemap grayscale
var basemap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'OSM',
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
    })
});

var states = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=wms',
        params: { 'LAYERS': 'sb:US_County_Boundaries' }
    })
})

var map = new ol.Map({
    layers: [basemap , states],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        zoom: 7
    }),
});