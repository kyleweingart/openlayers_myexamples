
let vectorSource; // Declare the vector source globally
let vectorLayer;  // Declare the vector layer globally
let map;          // Declare the map globally

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

const errorConeStyles = {
  0: new ol.style.Style({
    fill: new ol.style.Fill({ color: [247, 247, 128, .9] }),
    stroke: new ol.style.Stroke({ color: [255, 130, 71, .9], width: 2 })
  }),
  72: new ol.style.Style({
    fill: new ol.style.Fill({ color: [255, 128, 128, .9] }),
    stroke: new ol.style.Stroke({ color: [205, 0, 0, .9], width: 2 })
  }),
  120: new ol.style.Style({
    fill: new ol.style.Fill({ color: [255, 128, 255, .9] }),
    stroke: new ol.style.Stroke({ color: [255, 0, 255, .9], width: 2 })
  }),
}

function styleFunction(feature) {
  const label = feature.get('label');
  if (label === '0') {
    console.log(errorConeStyles);
    return errorConeStyles[0];
  } else if (label === '72') {
    return errorConeStyles[72];
  } else if (label === '120') {
    return errorConeStyles[120];
  }
}

// Initialize the map and setup controls
initializeMap();
setupLayerControls();




  


