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
  style: null,
  // style: new Style({
  //       stroke: new Stroke({
  //           color: 'rgba(4, 26, 0, 1.0)',
  //           width: 3
  //       })
  //   }),
  source: new VectorSource({
    url:'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:states20m&outputFormat=application/json&srsname=EPSG:3857',
    // url: 'https://openlayers.org/en/latest/examples/data/geojson/switzerland.geojson',
    // url: '/data/gz_2010_us_outline_500k.json',
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

var url = 'https://dev-hvx.hurrevac.com/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json&srsname=EPSG:3857&viewparams=date:1567393200;fcstHr:120;spd:TS'

var wpLayer = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: url,
        // strategy: ol.loadingstrategy.all,
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
        return [new Style({
            fill: new Fill({
              color: fillColor
            })
          })];
    },
    visible: true,
});

var style = new Style({
  fill: new Fill({
    color: 'black'
  })
});

wpLayer.on('postrender', function(e) {
  console.log(e);
  e.context.globalCompositeOperation = 'destination-in';
  var vectorContext = getVectorContext(e);
  console.log(vectorContext);
  clipLayer.getSource().forEachFeature(function(feature) {
    console.log(feature);
    console.log(feature.values_.name);
    if (feature.values_.name === 'Florida') {
      console.log('Florida');
      vectorContext.drawFeature(feature, style);
    }
  });
  e.context.globalCompositeOperation = 'source-over';
});

var map = new Map({
  layers: [base, wpLayer, clipLayer],
  target: 'map',
  view: new View({
    // center: fromLonLat([8.23, 46.86]),
    center: fromLonLat([-75, 33]),
    zoom: 4
  })
});