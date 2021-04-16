import 'ol/ol.css';
import KML from 'ol/format/KML';
import {Map, View} from 'ol';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import RasterSource from 'ol/source/Raster';
import {Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import WMSGetFeatureInfo from 'ol/format/WMSGetFeatureInfo';
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

let rainfall_layers = [];

var colorMap = {
  '0,0,255': 1,       //#0000FF - Depth 1
  '0,85,255': 2,      //#0055FF - Depth 2
  '0,170,255': 3,     //#00AAFF - Depth 3
  '0,255,255': 4,     //#00FFFF - Depth 4
  '85,255,170': 5,    //#55FFAA - Depth 5
  '170,255,85': 6,    //#AAFF55 - Depth 6
  '255,255,0': 7,     //#FFFF00 - Depth 7
  '255,170,0': 8,     //#FFAA00 - Depth 8
  '255,85,0': 9,      //#FF5500 - Depth 9     
  '255,0,0': 10,      //#FF5500 - Depth 10
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

  // i need to work on this to get the total 
  console.log(dataArray);

  var max = dataArray.reduce(function(final, current) {
    console.log('????????????????????????????');
    for (var i = 0; i < final.length; i = i+4) {
      // console.log(final.length);
      //Only compare if current isn't completely transparent
      if (current[i+3] > 0) {
        // console.log(i);
        // console.log(current[i+3]);
        var current_rgba = [current[i], current[i+1], current[i+2], current[i+3]];
        // console.log(current_rgba);
        var final_rgba = [final[i], final[i+1], final[i+2], final[i+3]];
        // console.log(final_rgba);
        var current_depth = toDepth(current_rgba, colorMap);
        console.log(current_depth);
        var final_depth = toDepth(final_rgba, colorMap);
        console.log(final_depth);

        if (typeof current_depth === "undefined") {
          current_depth = 0;
        }
        if (typeof final_depth === "undefined") {
          final_depth = 0;
        }
        // console.log(current_depth + final_depth);
        // console.log(`Rainfall = ${current_depth + final_depth}`);
        const rainfall = `${current_depth + final_depth}`

        // console.log(`Rainfall Depth: ${rainfall}`);

        for (const [rgba, depth] of Object.entries(colorMap)) {
          // console.log(depth);
          // console.log(rainfall);
          if (depth == rainfall) {
            // console.log('Depth:' + depth);
            // console.log('==================');
            // this is where to assign the new rgba values that correspond to the value in the color map
            // need to add some fail safes, etc. 
            const rgbaArray = rgba.split(',');
            final[i] = rgbaArray[0];   //R
            
            final[i+1] = rgbaArray[1]; //G
           
            final[i+2] = rgbaArray[2]; //B
            
            final[i+3] = 0.6 //A  255

            // console.log(current[i+3])

            // console.log(rgbaArray[0]);
            // console.log(rgbaArray[1]);
            // console.log(rgbaArray[2]);
          }
        }

        // if (current_depth > final_depth) {
        //   final[i] = current[i];     //R
        //   // console.log(final[i]);
        //   final[i+1] = current[i+1]; //G
        //   // console.log(final[i+1]);
        //   final[i+2] = current[i+2]; //B
        //   // console.log(final[i+2]);
        //   final[i+3] = current[i+3]; //A
        //   // console.log(`A:${final[i+3]}`);
        // }
      }
    }
    // console.log(final);
    return final;
  });
  return {data: max, width: width, height: height};
}

function toDepth(rgb, colorMap) {
  
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
  rainfall_layers = [];
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
    source: raster,
    name: "rainfallMosaic" + time,
  });

  return surgeImage;
  }

  
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
  
  //  example trying to use time dimension as interval range rather than list. 

var createMosaicIntervalLayer = (time) => {

  // not quite getting this to work 
  // i am having two issues that need to be solved: 

      // 1. Can i request multiple granules with one request using a date range?  So far i've tried doing this using / ,etc with no sucess
      // 2. If I request multiple ranges can i get the return values to be added together?

  console.log('interval');
  var url = 'http://localhost:8080/geoserver/wms';

  if (time === '24') {
      // var period = '2020-12-14T00:00:00Z'
      var period = 'P3D/2020-12-15T00:00:00Z'
  }   else if (time === '48') {
      // var period = '2020-12-13T00:00:00Z/2020-12-15T00:00:00Z'
      var period = 'P2D/2020-12-15T00:00:00Z'
    }   else if (time === '72') {
      // var period = '2020-12-12/2020-12-14'
      var period = 'P3D/PRESENT'
  }

  // const urlnew = 'http://localhost:8080/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng8&TRANSPARENT=true&LAYERS=cite%3Arainfall_mosaic&TILED=true&projection=EPSG%3A3857&TIME=2020-12-12T00:00:00Z/2020-12-14T00:00:00Z';

  var layer = new TileLayer({
      source: new TileWMS({
          url: url,
          params: {
              'LAYERS': 'cite:rainfall_mosaic',
              'TILED': true,
              'VERSION': '1.1.1',
              'FORMAT': 'image/png8',
              'projection': 'EPSG:3857',
              'TIME': period
          }
      }),
      name: "rainfallIntervalMosaic" + time,
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
  });
  return layer;
}

var checkboxesRainfallIntervalMosaic = document.forms["rainfallMosaicIntervalForm"].elements["rainfallMosaicInterval"];
for (var i = 0; i < checkboxesRainfallGrib.length; i++) {
  checkboxesRainfallIntervalMosaic[i].onclick = function () {
    var timePeriod = this.value;
    if (this.checked === true) {
      var mapLayer = createMosaicIntervalLayer(timePeriod);
      map.addLayer(mapLayer);
    } else {
      map.getLayers().forEach(function (layer) {
        if (layer.get('name') === 'rainfallIntervalMosaic' + timePeriod) {
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


var parser = new WMSGetFeatureInfo();
  var viewResolution = map.getView().getResolution();
  var viewProjection = map.getView().getProjection();


map.on('singleclick', function (evt) {
  let depth = [];
  console.log(evt.coordinate);
  for (var i = 0; i < rainfall_layers.length; i++) {
  var url = rainfall_layers[i].getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
    {
      'INFO_FORMAT': 'application/vnd.ogc.gml',
    });
  $.ajax({
    type: 'GET',
    url: url
  }).done(function (data) {
    console.log(data);
    var features = parser.readFeatures(data);
    console.log(features[0]);
    if (features.length > 0) {
      var depthNum = parseInt(features[0].values_.GRAY_INDEX);
      if (depthNum === 255) {
        depthNum = 0;
      }
      depth.push(depthNum);
      console.log(depth);
      const rainfallAmt = depth.reduce((a,b) => a + b, 0);
      console.log(rainfallAmt);

      // var maxDepth = Math.max.apply(Math, depth);
      // console.log(maxDepth);
      // createFlags(evt.coordinate, maxDepth);



      // below works but has generalized data
      // geom = features[0].H.geom;
      // features[0].setGeometry(geom);
      // features[0].getGeometry().transform('EPSG:4326', 'EPSG:3857')
      // featureOverlay.getSource().clear();
      // featureOverlay.getSource().addFeatures(features);
      // overlay.setPosition(evt.coordinate);
      // content.innerText = features[0].H.zone_name;
      // container.style.display = 'block';
      // console.log(overlay);
    }

    
    // } else {
    //   featureOverlay.getSource().clear();
    //   container.style.display = 'none';
    // }

  })
  }
});