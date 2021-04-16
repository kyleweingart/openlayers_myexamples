var codes = [];
var flags = [];
var flagsLayer = null;


  // codes.push('nnw320i1');
  // codes.push('wnw320i1');
  codes.push('w320i1');
//   codes.push('e320i1');
  // codes.push('ene320i1');
  // codes.push('nne320i1');

  var surge_layers = [];
  var depth = [];
  var lightGrey = 'grey';

  for (var i = 0; i < codes.length; i++){
    var imgLayer = new ol.source.ImageWMS({
      crossOrigin: 'anonymous',
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'nhp:sf1', 'DIM_MAX_COLS': codes[i]},
      ratio: 1,
      serverType: 'geoserver'
    });

    surge_layers.push(imgLayer);
  }
  
  // Maps RGB values to levels. Must correspond to style
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
  // var counter = 0;

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

  function getMaxDepth(inputs, data) {
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
          console.log(current_rgba);
          var final_rgba = [final[i], final[i+1], final[i+2], final[i+3]];
          console.log(final_rgba);
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

  var raster = new ol.source.Raster({
    sources: surge_layers,
    operationType: 'image',
    operation: getMaxDepth,
    lib: toDepth,
    threads: 0,
    imageOps: false,
  });

  var view = new ol.View({
    center: [-9018025.746879461, 2927045.4641722036],
      zoom: 10
  });

  var surgeImage = new ol.layer.Image({
    source: raster
  });

  var map = new ol.Map({
    layers: [
      // new ol.layer.Tile({
      //   source: new ol.source.OSM()
      // }),
      surgeImage
    ],
    target: 'map',
    view: view
  });

  var parser = new ol.format.WMSGetFeatureInfo();
  var viewResolution = map.getView().getResolution();
  var viewProjection = map.getView().getProjection();
  
  map.on('singleclick', function (evt) {
    depth = [];
    console.log(evt.coordinate);
    for (var i = 0; i < surge_layers.length; i++) {
    var url = surge_layers[i].getGetFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection,
      {
        'INFO_FORMAT': 'application/vnd.ogc.gml',
      });
    $.ajax({
      type: 'GET',
      url: url
    }).done(function (data) {
      var features = parser.readFeatures(data);
      if (features.length > 0) {
        var depthNum = parseInt(features[0].H.GRAY_INDEX);
        if (depthNum === 255) {
          depthNum = 0;
        }
        depth.push(depthNum);
        console.log(depth);

        var maxDepth = Math.max.apply(Math, depth);
        console.log(maxDepth);
        createFlags(evt.coordinate, maxDepth);



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

  function createFlags (coords, maxDepth) {
    makeFlag(coords, maxDepth);
    drawFlags();
  }

  function makeFlag(coords, datum) {
    if (!coords || coords.length < 2) {
      return false;
    }
    if (+datum <= 0 || !datum) {
      datum = 'Dry';
    }

    // Make point geometry
    var geom = new ol.geom.Point(coords);

    // Make new flag feature
    var flagFeature = new ol.Feature(geom);

    flagFeature.setProperties({
      surge: datum
    }, true);

    // Set flag style
    flagFeature.setStyle(buildStyle(geom, datum));

    // Add new feature to flag list
    flags.push(flagFeature);

    return flagFeature;
  }

  function buildStyle(geom, datum) {
    if (!geom || !datum) {
      return false;
    }

    // Define the text style
    var text = datum.toString();
    var textStyle = makeTextStyle(text);

    // Define the flag's shape style
    var shapeStyle = makeShapeStyle(lightGrey);

    // Combine the styles and give it a location
    return new ol.style.Style({
      geometry: geom,
      text: textStyle,
      image: shapeStyle
    });
  }

  function makeTextStyle(text) {
    return new ol.style.Text({
      text: text,
      font: 'bold 12px sans-serif',
      fill: new ol.style.Fill({
        // color: '#F5F5F5'
        color: 'black'
      }),
      textBaseline: 'middle',
      textAlign: 'center',
      offsetX: 13,
      offsetY: -25

    });
  }

  function makeShapeStyle(fillText, strokeText) {
    fillText = fillText || 'red';
    strokeText = strokeText || 'grey';
    var fill = new ol.style.Fill({color: fillText});
    var stroke = new ol.style.Stroke({color: strokeText, width: 0.5});


  // red flag option

  // return new ol.style.Icon({
  //   anchor: [0.55, 0.3],
  //   // anchorXUnits: 'fraction',
  //   // anchorYUnits: 'pixels',
  //   src: 'flag1.png',
  //   opacity: 1,
  //   scale: .07
  //   // size: [10, 20]
  // })

  return new ol.style.Icon({
    anchor: [.15, 1],
    // anchorXUnits: 'fraction',
    // anchorYUnits: 'pixels',
    src: 'flag.svg',
    opacity: .8,
    scale: .07
    // size: [100, 200]
  })

  // black flag option

  // return new ol.style.Icon({
  //   anchor: [0.5, 0.375],
  //   // anchorXUnits: 'fraction',
  //   // anchorYUnits: 'pixels',
  //   src: 'flag.png',
  //   opacity: .5,
  //   scale: .1
  //   // size: [10, 20]
  // })

  // black pin option 1
  // return new ol.style.Icon({
  //   anchor: [0.5, 0.375],
  //   // anchorXUnits: 'fraction',
  //   // anchorYUnits: 'pixels',
  //   src: 'pin.png',
  //   opacity: .8,
  //   scale: .15
  //   // size: [10, 20]
  // })

  // black pin option 2
  // return new ol.style.Icon({
  //   anchor: [0.5, 0.75],
  //   // anchorXUnits: 'fraction',
  //   // anchorYUnits: 'pixels',
  //   src: 'pin2.png',
  //   opacity: .9,
  //   scale: .15
  //   // size: [10, 20]
  // })

  // black pin option 3
  // return new ol.style.Icon({
  //   anchor: [0.5, 1],
  //   // anchor: [0, 0],
  //   // anchorXUnits: 'fraction',
  //   // anchorYUnits: 'pixels',
  //   src: 'pin3.png',
  //   opacity: .9,
  //   scale: .1
  //   // size: [10, 20]
  // })

  
  

    // return new ol.style.RegularShape({
    //   fill: fill,
    //   stroke: stroke,
    //   points: 4,
    //   radius: 17,
    //   angle: Math.PI / 4
    // });
  }

  function drawFlags() {
    map.removeLayer(flagsLayer);
    if (!flags || flags.length < 1) {
      return false;
    }

    var source = new ol.source.Vector({
      features: flags
    });

    flagsLayer = new ol.layer.Vector({
      source: source,
      style: buildStyle
    });
    map.addLayer(flagsLayer);

    return flagsLayer;
  }