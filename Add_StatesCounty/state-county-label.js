// add basemap grayscale
var basemap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'OSM',
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
    })
});

var county = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=wms',
        params: { 'LAYERS': 'sb:US_County_Boundaries' }
    })
})

var state = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=wms',
        params: { 'LAYERS': 'sb:US_States' }
    })
})

var vectorState = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=wfs&request=GetFeature&version=1.0.0&typeName=sb:US_States&outputFormat=application/json',
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
        })
    })
});

var map = new ol.Map({
        layers: [basemap, vectorState],
        target: document.getElementById('map'),
        view: new ol.View({
            center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
            zoom: 7
        }),
    });