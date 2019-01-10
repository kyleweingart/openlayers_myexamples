// basemap grayscale
var basemap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'OSM',
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
    })
});

// county WMS USGS
var wmsCounty = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=wms',
        params: { 'LAYERS': 'sb:US_County_Boundaries' }
    })
})

// state WMS USGS
var wmsState = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=wms',
        params: { 'LAYERS': 'sb:US_States' }
    })
})

// county WFS USGS
var wfsCounty = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=WFS&request=GetFeature&version=1.0.0&typename=sb:US_County_Boundaries&outputFormat=application/json',
        format: new ol.format.GeoJSON(),
        strategy: ol.loadingstrategy.all
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(4, 26, 0, 1.0)',
            width: 1
        })
    })
});

// state WFS USGS
var wfsState = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=WFS&request=GetFeature&version=1.0.0&typename=sb:US_States&outputFormat=application/json',
        format: new ol.format.GeoJSON(),
        strategy: ol.loadingstrategy.all
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(4, 26, 0, 1.0)',
            width: 3
        })
    })
});

var map = new ol.Map({
        layers: [basemap, wfsState, wfsCounty],
        target: document.getElementById('map'),
        view: new ol.View({
            center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
            zoom: 7
        }),
    });