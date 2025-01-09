
let vectorSource; // Declare the vector source globally
let vectorLayer;  // Declare the vector layer globally
let map;          // Declare the map globally
let currentStyles;

const forecastHrs = [0, 5, 17, 29, 41, 53, 65, 89, 113]

// Initialize the map with a raster (OSM) layer
function initializeMap() {
  const raster = new ol.layer.Tile({
    source: new ol.source.OSM(),
  });

  vectorSource = new ol.source.Vector(); // Empty source to start
  vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction
  });

  map = new ol.Map({
    layers: [raster, vectorLayer],
    target: document.getElementById('map'),
    view: new ol.View({
      center: [0, 3000000], 
      zoom: 2,
    }),
  });

   // Load the "error_cone" layer by default
   loadGeoJSON('error_cone');
}

// Function to fetch GeoJSON and update the vector layer
function loadGeoJSON(layerName) {
  const filePath = `./${layerName}.json`; // Construct file path based on layer name
  vectorLayer.set('name', layerName);

  // Update the current styles based on the layer
  currentStyles = stylesByLayer[layerName];
  console.log(currentStyles);

  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON file: ${response.statusText}`);
      }
      return response.json();
    })
    .then((geojsonData) => {
      // Read features from the GeoJSON file
      const features = new ol.format.GeoJSON().readFeatures(geojsonData, {
        dataProjection: 'EPSG:4326', // GeoJSON standard
        featureProjection: 'EPSG:3857', // Web Mercator for OpenLayers
      });

      // Clear the existing source and add new features
      vectorSource.addFeatures(features);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

// Event listener for radio buttons
function setupLayerControls() {
  document.querySelectorAll('input[name="layer"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      vectorSource.clear();
      const selectedLayer = event.target.value;
      loadGeoJSON(selectedLayer); // Load the GeoJSON file for the selected layer
    });
  });
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 16
canvas.height = 16 
context.strokeStyle = 'rgba(51, 51, 51, 0.4)';
const range = (start, stop, step) => {
  const len = Math.max(Math.ceil((stop - start) / step), 0);
  const r = Array(len);
  for (let i = 0; i < len; i++, start += step) {
    r[i] = start;
  }
  return r;
};
range(-1 * canvas.width, canvas.height, 8).forEach((val) => {
  context.beginPath();
  context.moveTo(val, 0);
  context.lineTo(canvas.width + val, canvas.height);
  context.stroke();
});
const pattern = context.createPattern(canvas, 'repeat');

const stylesByLayer = {
  error_cone: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  forecast_position: {
    default:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          // color: getColorFromWS(windspeed)
          color: 'red'
        }),
        stroke: new ol.style.Stroke({
          // color: Constants.Colors.BLACK,
          width: 0.5
        }),
        points: 4,
        radius: 1,
        angle: Math.PI / 4
      })
    }),
    forecastHr:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          // color: getColorFromWS(windspeed)
          color: 'red'
        }),
        stroke: new ol.style.Stroke({
          // color: Constants.Colors.BLACK,
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4
      })
    // 0: new ol.style.Style({
    //   fill: new ol.style.Fill({ color: pattern }),
    //   stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
    //   zIndex: 2
    // }),
    // 72: new ol.style.Style({
    //   fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
    //   stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
    //   zIndex: 3
    // }),
    // 120: new ol.style.Style({
    //   fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
    //   stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
    //   zIndex: 1
    })
  },
  forecast_track_line: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  forecast_track_point: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  forecast_winds: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  past_track_point: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  wind_prob_polgyon: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  forecast_wind_swath: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },

}

function styleFunction(feature) {
  const layerName = vectorLayer.get('name');
  console.log(layerName);
  const label = feature.get('label');
  console.log(label);
  console.log(currentStyles['default']);
  if (layerName === 'error_cone') {
    return currentStyles[feature.get('label')];
  } else if (layerName === 'forecast_position') {
    console.log(feature.get('hour'));
    if (forecastHrs.includes(feature.get('hour'))) {
      return currentStyles.forecastHr;
    } else {
      return currentStyles.default;
    }

  }
  console.log('here');
  console.log(currentStyles.default);
  return currentStyles.default;
}

// Initialize the map and setup controls
initializeMap();
setupLayerControls();




  


