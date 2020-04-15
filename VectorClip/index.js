import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import {Fill, Stroke, Style} from 'ol/style';
import {getVectorContext} from 'ol/render';
import {fromLonLat} from 'ol/proj';

var base = new TileLayer({
  source: new OSM()
});

var clipLayer = new VectorLayer({
//   style: null,
  style: new Style({
        stroke: new Stroke({
            color: 'rgba(4, 26, 0, 1.0)',
            width: 3
        })
    }),
  source: new VectorSource({
    url:'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:states20m&outputFormat=application/json&srsname=EPSG:3857',
    // 'https://openlayers.org/en/latest/examples/data/geojson/switzerland.geojson',
    format: new GeoJSON()
  })
});

// var wfsState = new ol.layer.Vector({
//     source: new ol.source.Vector({
//         // url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=WFS&request=GetFeature&version=1.0.0&typename=sb:US_States&outputFormat=application/json',
//         url: 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:states20m&outputFormat=application/json&srsname=EPSG:3857',
//         format: new ol.format.GeoJSON(),
//         strategy: ol.loadingstrategy.all
//     }),
//     style: null
//     // style: new ol.style.Style({
//     //     stroke: new ol.style.Stroke({
//     //         color: 'rgba(4, 26, 0, 1.0)',
//     //         width: 3
//     //     })
//     // })
// });

// var style = new Style({
//   fill: new Fill({
//     color: 'black'
//   })
// });

// base.on('postrender', function(e) {
//   e.context.globalCompositeOperation = 'destination-in';
//   var vectorContext = getVectorContext(e);
//   clipLayer.getSource().forEachFeature(function(feature) {
//     vectorContext.drawFeature(feature, style);
//   });
//   e.context.globalCompositeOperation = 'source-over';
// });

var map = new Map({
  layers: [base, clipLayer],
  target: 'map',
  view: new View({
    // center: fromLonLat([8.23, 46.86]),
    center: fromLonLat([-75, 33]),
    zoom: 4
  })
});