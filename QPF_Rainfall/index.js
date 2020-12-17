import 'ol/ol.css';
import KML from 'ol/format/KML';
import {Map, View} from 'ol';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import RasterSource from 'ol/source/Raster';
import {Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
// import {Fill, Stroke, Style} from 'ol/style';

var timeObject = {
  hourSix: require('./hourSix.kml'),
  dayOne: require('./dayOne.kml'),
  dayTwo: require('./dayTwo.kml'),
  dayThree: require('./dayThree.kml'),
  dayFourFive: require('./dayFourFive.kml'),
  daySixSeven: require('./daySixSeven.kml'),
  cumDayOneTwo: require('./cumDayOneTwo.kml'),
  cumDayOneTwoThree: require('./cumDayOneTwoThree.kml'),
  cumDayOneTwoThreeFourFive: require('./cumDayOneTwoThreeFourFive.kml'),
  cumDayOneTwoThreeFourFiveSixSeven: require('./cumDayOneTwoThreeFourFiveSixSeven.kml')
}

var colorMap = {
  '0,0,255': 1,       //#0000FF - Depth 1
  '0,85,255': 2,      //#0055FF - Depth 2
  '0,170,255': 3,     //#00AAFF - Depth 3
  '0,255,255': 4,     //#00FFFF - Depth 4
  '85,255,170': 5,    //#55FFAA - Depth 5
  '170,255,85': 6,    //#AAFF55 - Depth 6
  '255,255,0': 7,     //#FFFF00 - Depth 7
  '255,170,0': 8,     //#FF5500 - Depth 8
  '255,85,0': 9,      //#FFAA00 - Depth 9     
  '255,0,0': 10,      //#FF0000 - Depth 10
  '170,0,0': 11,};    //#AA0000 - Depth 11

var createRainfallKMLLayer = (timePeriod) => {
  var url = timeObject[timePeriod];
  var layer = new VectorLayer({
    source: new VectorSource({
    url: url,
      crossOrigin: 'anonymous',
      format: new KML({
        // extractStyles: false,
        extractAttributes: true
      }),
      projection: 'EPSG:3857',
    }),
    name: 'rainfallKML' + timePeriod
  });
  return layer;
}

var checkboxesRainfallKML = document.forms["rainfallKMLForm"].elements["rainfallKML"];
for (var i = 0; i < checkboxesRainfallKML.length; i++) {
  checkboxesRainfallKML[i].onclick = function () {
    var timePeriod = this.value;
    if (this.checked === true) {
  var mapLayer = createRainfallKMLLayer(timePeriod);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'rainfallKML' + timePeriod) {
          map.removeLayer(layer);
        }
      })

    }
  }
}

var createGrib2Layer = (time) => {

  console.log('Grib2layer');
  var url = 'http://localhost:8080/geoserver/wms';

  if (time === '24') {
      var layers = 'Total_precipitation_surface_24_Hour_Accumulation'
  }   else if (time === '48') {
      var layers = 'Total_precipitation_surface_48_Hour_Accumulation'
  }   else if (time === '72') {
      var layers = 'Total_precipitation_surface_72_Hour_Accumulation'
  }

  var layer = new TileLayer({
      source: new TileWMS({
          url: url,
          params: {
              'LAYERS': 'nhp:' + layers,
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png8',
              'projection': 'EPSG:3857'
            //  ' TIME': '2018-10-10T00:00:00Z'
          }
      }),
      name: "rainfallGrib2" + time,
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
  });
  return layer;
}

var checkboxesRainfallGrib = document.forms["rainfallGrib2Form"].elements["rainfallGrib"];
for (var i = 0; i < checkboxesRainfallGrib.length; i++) {
  checkboxesRainfallGrib[i].onclick = function () {
    var timePeriod = this.value;
    if (this.checked === true) {
      var mapLayer = createGrib2Layer(timePeriod);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'rainfallGrib2' + timePeriod) {
          map.removeLayer(layer);
        }
      })

    }
  }
}

function getTotalDepth(inputs, data) {
  console.log(inputs);
  var dataArray = [];
  var width = inputs[0].width;
  var height = inputs[0].height;
  for (var i = 0; i < inputs.length; i++ ) {
    dataArray.push(inputs[i].data);
  }

  var max = dataArray.reduce(function(final, current) {
    for (var i = 0; i < final.length; i = i+4) {
      //Only compare if current isn't completely transparent
      if (current[i+3] > 0) {
        var current_rgba = [current[i], current[i+1], current[i+2], current[i+3]];
        var final_rgba = [final[i], final[i+1], final[i+2], final[i+3]];

        var current_depth = toDepth(current_rgba, colorMap);
        var final_depth = toDepth(final_rgba, colorMap);

        if (typeof current_depth === "undefined") {
          current_depth = 0;
        }
        if (typeof final_depth === "undefined") {
          final_depth = 0;
        }

        if (current_depth > final_depth) {
          final[i] = current[i];     //R
          final[i+1] = current[i+1]; //G
          final[i+2] = current[i+2]; //B
          final[i+3] = current[i+3]; //A
        }
      }
    }
    return final;
  });
  return {data: max, width: width, height: height};
}

function toDepth(rgb, colorMap) {
  console.log('here');
  function within(val, target, range) {
    return (val > target - range && val < target + range)
  }
  function toExactVal(val) {
    var range = 5;
    if (within(val, parseInt('FF',16), range)) {
      return parseInt('FF',16)
    } else if (within(val, parseInt('AA',16), range)) {
      return parseInt('AA',16)
    } else if (within(val, parseInt('55',16), range)) {
      return parseInt('55',16)
    } else  {
      return 0;
    }
  }

  var exact_rgb = [toExactVal(rgb[0]),toExactVal(rgb[1]),toExactVal(rgb[2])];
  if(colorMap.hasOwnProperty(exact_rgb)){
    return colorMap[exact_rgb]
  }
  return 0;
}

var createMosaicLayer = (time) => {

  var days = [];
  var rainfall_layers = [];
  var rainfallTotalDepth = [];
  
  var url = 'http://localhost:8080/geoserver/wms';
  
  if (time === '24') {
    days.push('2020-12-14T00:00:00Z');
  }   else if (time === '48') {
    days.push('2020-12-13T00:00:00Z')
    days.push('2020-12-14T00:00:00Z');
  }   else if (time === '72') {
    days.push('2020-12-12T00:00:00Z');
    days.push('2020-12-13T00:00:00Z')
    days.push('2020-12-14T00:00:00Z');
  }

  for (var i = 0; i < days.length; i++){
    var imgLayer = new ImageWMS({
      crossOrigin: 'anonymous',
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'cite:rainfall_mosaic', 'TIME': days[i]},
      ratio: 1,
      serverType: 'geoserver'
    });

    rainfall_layers.push(imgLayer);
  }

 

  var raster = new RasterSource({
    sources: rainfall_layers,
    operationType: 'image',
    operation: getTotalDepth,
    lib: toDepth,
    threads: 0,
    imageOps: false,
  });

  var surgeImage = new ImageLayer({
    source: raster
  });

  return surgeImage;
    // var layer = new TileLayer({
    //   source: new TileWMS({
    //     url: url,
    //     params: {
    //       'LAYERS': 'cite:rainfall_mosaic',
    //       'TILED': true,
    //       'VERSION': '1.1.1',
    //       'FORMAT': 'image/png8',
    //       'projection': 'EPSG:3857',
    //       'TIME': days[i]
    //     }
    //   }),
    //   name: "rainfallMosaic" + time,
    //   serverType: 'geoserver',
    //   crossOrigin: 'anonymous'
    // });
    // return layer;
   
  }

    // }


  

  

var checkboxesRainfallMosaic = document.forms["rainfallMosaicForm"].elements["rainfallMosaic"];
for (var i = 0; i < checkboxesRainfallGrib.length; i++) {
  checkboxesRainfallMosaic[i].onclick = function () {
    var timePeriod = this.value;
    if (this.checked === true) {
      var mapLayer = createMosaicLayer(timePeriod);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'rainfallMosaic' + timePeriod) {
          map.removeLayer(layer);
        }
      })

    }
  }
}

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
   
    zoom: 0
  })
});