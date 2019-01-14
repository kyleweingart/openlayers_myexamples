// there are many example layers to choose from including WMS & WFS calls and different loading 
// strategies - add layers you want to display to the map variable. 

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
// could add different load strategy like BBox to increase load times
var wfsCounty = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=WFS&request=GetFeature&version=1.0.0&typename=sb:US_County_Boundaries&outputFormat=application/json',
        format: new ol.format.GeoJSON(),
        strategy: ol.loadingstrategy.all
    }),
    style: styleFunction,
    maxResolution: 2500
});

// show label at large scale resolutions
var getText = function (feature, resolution) {
    maxResolution = 600;
    if (resolution > maxResolution) {
        textDescription = '';
    } else {
        textDescription = feature.get('COUNTY');
    }
    return textDescription;
}

// style county WFS-config for stroke and label
function styleFunction(feature, resolution) {
    var polyStyleConfig = {
        stroke: new ol.style.Stroke({
            color: 'rgba(10,10,10,1.0)',
            width: 1
        })
    }

    var textStyleConfig = {
        text: new ol.style.Text({
            font: '10px Calibir, sans-serif',
            text: getText(feature, resolution),
            textAlign: 'center',
            scale: '1.5',
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 0, 0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 3
            })
        }),
        geometry: function (feature) {
            var retPoint;
            if (feature.getGeometry().getPolygons().length > 1) {
                retPoint = getMaxPoly(feature.getGeometry().getPolygons())
            } else if (feature.getGeometry().getPolygons().length === 1) {
                retPoint = feature.getGeometry().getInteriorPoints();
            }
            return retPoint;
        }
    }
    var textStyle = new ol.style.Style(textStyleConfig);
    var polyStyle = new ol.style.Style(polyStyleConfig);
    return [polyStyle, textStyle];
}

//   helper function to find biggest polygon- could just return a threshold;
function getMaxPoly(polys) {
    var polyObj = [];
    //now need to find which one is the greater and so label only this
    for (var b = 0; b < polys.length; b++) {
        polyObj.push({ poly: polys[b], area: polys[b].getArea() });
    }
    polyObj.sort(function (a, b) { return a.area - b.area });
    return polyObj[polyObj.length - 1].poly;
}

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

// State_County Tiger ArcGIS Rest Service as Image
var wmsStateCountyTiger = new ol.layer.Image({
    source: new ol.source.ImageArcGISRest({
        params: {},
        url: 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer'
    })
})

// State_County Tiger ArcGIS Rest Service as TILEs
var wmsStateCountyTigerTile = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest({
        url: 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer'
    })
})

// Current Tiger with State, County, County Labels as Tiles- faster load time - multiple labels
var wmsCurrentTiger = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest({
        params: {
            'LAYERS':"show:84,86,87"
        },
        url: 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer'
    })
})

// Current Tiger with State, County, County Labels as Images - superior labeling/cartography
var wmsCurrentTigerImage = new ol.layer.Image({
    source: new ol.source.ImageArcGISRest({
        params: {
            'LAYERS':"show:84,86,87"
        },
        url: 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer'
    })
})

var map = new ol.Map({
    layers: [wmsCurrentTigerImage],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        zoom: 3
    }),
});
