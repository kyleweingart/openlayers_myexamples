// there are many example layers to choose from including WMS & WFS calls and different loading 
// strategies - add layers you want to display to the map variable. 

// basemap grayscale
var basemap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'OSM',
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
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


// state WFS SI dev geoserver

var url = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS'

var wpLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: url,
        strategy: ol.loadingstrategy.all,
        projection: 'EPSG:3857'

    }),
    style: function(feature) {
        console.log(feature);
        var val = feature.get('prob');
        console.log(val);
        var fillColor = [0, 0, 0, 0];
        val = (val >= 10) ? (Math.floor(val / 10) * 10) : (val >= 5) ? 5 : 0;

        switch (val) {
            case 5:
                fillColor = [255, 247, 236, .8];
                break;
            case 10:
                fillColor = [254, 232, 200, .8];
                break;
            case 20:
                fillColor = [253, 212, 158, .8];
                break;
            case 30:
                fillColor = [253, 187, 132, .8];
                break;
            case 40:
                fillColor = [252, 141, 89, .8];
                break;
            case 50:
                fillColor = [239, 101, 72, .8];
                break;
            case 60:
                fillColor = [215, 48, 31, .8];
                break;
            case 70:
                fillColor = [179, 0, 0, .8];
                break;
            case 80:
                fillColor = [127, 0, 0, .8];
                break;
            case 90:
                fillColor = [100, 0, 0, .8];
                break;
        }
        return [new ol.style.Style({
            fill: new ol.style.Fill({
              color: fillColor
            })
          })];
    },
    visible: true,
});


var map = new ol.Map({
    layers: [basemap, wfsState, wpLayer],
    target: document.getElementById('map'),
    view: new ol.View({
        center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
        zoom: 3
    }),
});
