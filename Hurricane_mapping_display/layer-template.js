
let vectorSource; // Declare the vector source globally
let vectorLayer;  // Declare the vector layer globally
let map;          // Declare the map globally
let currentStyles;
let stormList;
const token = 'fb790bbfff4ba5a930d0fb75c1f81dd53503fc2b';

const forecastHrs = [0, 5, 17, 33, 45, 57, 69, 93, 117]
// What are the correct forecast hours?

// Initialize the map with a raster (OSM) layer
function initMap() {
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
  //  loadGeoJSON('error_cone');
}

function loadDataAPI(layer) {
  // fetch(`https://data.hurricanemapping.com/hmgis/layers/AL092022/1/${layer}`, {
  fetch(`https://data.hurricanemapping.com/hmgis/?format=json`, {
    method: 'GET', 
    headers: {
    'Authorization': `Token ${token}`, // Include the token here
    'Content-Type': 'application/json'
    }} )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON file: ${response.statusText}`);
      }
      console.log(response.json());
      return response.json();
    })
    .then((geojsonData) => {
      // Read features from the GeoJSON file
      const features = new ol.format.GeoJSON().readFeatures(geojsonData, {
        dataProjection: 'EPSG:4326', // GeoJSON standard
        featureProjection: 'EPSG:3857', // Web Mercator for OpenLayers
      });
      console.log(features);
});
}

async function getStormLayers(storm) {
  try {
    const response = await fetch(`https://data.hurricanemapping.com/hmgis/advisories/?storm=${storm.stormid}`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`, // Include the token here
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch advisories: ${response.statusText}`);
    }

    const advisories = await response.json();
    stormList.forEach(storm => {
      storm.workingAdvisories = advisories.filter(advisory => advisory.storm === storm.stormid);
    });
    return advisories;
} catch (error) {
    console.error(error);
    return []; // Return an empty array on error
}
}
  
  https://data.hurricanemapping.com/hmgis/advisories/?storm=al092022
//   fetch(`https://data.hurricanemapping.com/hmgis/advisories/?storm=${storm.stormid}`, {
//     method: 'GET', 
//     headers: {
//     'Authorization': `Token ${token}`, // Include the token here
//     'Content-Type': 'application/json'
//     }} )
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`Failed to fetch GeoJSON file: ${response.statusText}`);
//       }
//       return response.json();
//     })
//     .then((advisories) => {
//       console.log(stormList);
//       console.log(advisories);
//       stormList.forEach(storm => {
//         storm.workingAdvisories = advisories.filter(advisory => advisory.storm === storm.stormid);
//       return stormList;
//     });
// });
// }

function loadStorms() {
  fetch(`https://data.hurricanemapping.com/hmgis/?format=json`, {
    method: 'GET', 
    headers: {
    'Authorization': `Token ${token}`, // Include the token here
    'Content-Type': 'application/json'
    }} )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON file: ${response.statusText}`);
      }
      return response.json();
    })
    .then((storms) => {
      stormList = storms.map(storm => {
          return {
              ...storm,
              year: storm.stormid.slice(-4),  // Extracts the year (last 4 characters)
              region: storm.stormid.slice(0, 2), // Extracts the region (first 2 characters)
              number: storm.stormid.slice(2, 4)
          };
      });
      loadComboBoxes(); 
  });
}

function loadComboBoxes() {
  const years = [...new Set(stormList.map(storm => storm.year))].sort((a, b) => b - a);
  const regions = [...new Set(stormList.map(storm => storm.region.toUpperCase()))].sort();

  // Helper function to populate a combobox
  const populateComboBox = (comboBoxId, options) => {
      const comboBox = document.getElementById(comboBoxId);
      options.forEach(optionValue => {
          const option = document.createElement('option');
          option.value = option.text = optionValue;
          comboBox.appendChild(option);
      });
      comboBox.value = options[1]; // Set first option as selected by default
  };

  // Event listener for Year combobox
  document.getElementById('year-select').addEventListener('change', (e) => {
    populateStormTemplates(stormList.filter(storm => storm.year === e.target.value && storm.region === document.getElementById('region-select').value.toLowerCase()));
  }); 
  
  // Event listener for Region combobox
  document.getElementById('region-select').addEventListener('change', (e) => {
    populateStormTemplates(stormList.filter(storm => storm.region === e.target.value.toLowerCase() && storm.year === document.getElementById('year-select').value));
  });

  // Populate Year and Region comboboxes
  populateComboBox('year-select', years);
  populateComboBox('region-select', regions);

  setTimeout(() => {
    // Trigger change event for Year combobox
    document.getElementById('year-select').dispatchEvent(new Event('change')); 
  }, 0); 
}

// Function to create storm template using template literals
const createStormTemplate = async (storm) => {
  const stormLayers =  await getStormLayers(storm);

  // Get the last advisory
  const lastAdvisory = stormLayers[stormLayers.length - 1];

  // Only proceed if last advisory is not undefined
  if (!lastAdvisory || !lastAdvisory.layers) {
      console.warn(`No advisories or layers found for storm ${storm.stormid}`);
      return ''; // Return an empty string to skip rendering this storm
  }
  
  // Generate layersHTML dynamically, ensuring we display both the layer name and its value
  const layersHTML = Object.entries(lastAdvisory.layers)
  .map(([layerName, layerValue], index) => {
    const checked = index === 0 ? 'checked' : ''; // Add 'checked' to the first layer
    return `
      <div class="form-check">
          <input class="form-check-input" type="radio" name="layer_${storm.stormid}_${layerName}" value="${layerValue}" ${checked}>
          <label class="form-check-label">${layerName}</label>
      </div>
    `;
  })
  .join('');
  
  return `
      <details>
          <summary>${lastAdvisory.storm_name}</summary>
          ${layersHTML}
      </details>
  `;
};

// Function to populate storm templates into the toc container
const populateStormTemplates = async (stormData) => {
  const container = document.getElementById('toc'); // Get the target container
  container.innerHTML = ''; // Clear any existing content
  // Generate and insert the storm templates dynamically
  const stormTemplates = await Promise.all(stormData.map(storm => createStormTemplate(storm)));
   // Update the container with the generated HTML
   container.innerHTML = stormTemplates.join('');
};

// Function to fetch GeoJSON and update the vector layer
function loadGeoJSON(layerName) {
  const filePath = `./${layerName}.json`; // Construct file path based on layer name
  vectorLayer.set('name', layerName);

  // Update the current styles based on the layer
  currentStyles = stylesByLayer[layerName];
  
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
      // loadStorms()
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
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 1,
        angle: Math.PI / 4,
      })
    }),
    RED:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    BLUE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#0024FA'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    WHITE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    YELLOW:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFF33'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    })
  },
  forecast_track_line: {
   default: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#777777',
      width: 2
    })
   })
  },
  past_track_line: {
   default: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#777777',
      width: 2
    })
   })
  },
  warning_line: {
   default: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#777777',
      width: 2
    })
   })
  },
  forecast_track_point: {
    RED:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    BLUE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#0024FA'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    WHITE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    YELLOW:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFF33'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    })
  },
  forecast_winds: {
    RED:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.4)'
        }),
    }),
    BLUE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 36, 250, 0.4)'
        }),
    }),
    WHITE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
    }),
    YELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 51, 0.4)'
        }),
    })
  },
  past_wind: {
    RED:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.4)'
        }),
    }),
    BLUE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 36, 250, 0.4)'
        }),
    }),
    WHITE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
    }),
    YELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 51, 0.4)'
        }),
    })
  },
  past_track_point: {
    RED:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    BLUE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#0024FA'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    WHITE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    YELLOW:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFF33'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    })
  },
  wind_prob_point: {
    default:  new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0, 178, 0, 0.4)'
      }),
      zIndex: 1
  }),
  },
  wind_prob_polygon: {
    // '#00B200'
    GREEN:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 178, 0, 0.4)'
        }),
        zIndex: 1
    }),
  // '#00FF00'
    LIMEGREEN:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 255, 0, 0.4)' 
        }),
        zIndex: 2
    }),
  // '#FFFF00'
    LIGHTYELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.4)'
        }),
        zIndex: 3
    }),
    BLANDYELLOW:  new ol.style.Style({
      // '#FFCC66'
        fill: new ol.style.Fill({
          color: 'rgba(255, 204, 102, 0.4)' 
        }),
        zIndex: 4
    }),
  // '#CC6600'
    DARKORANGE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(204, 102, 0, 0.4)'
        }),
        zIndex: 5
    }),
  // '#FF8000'
    ORANGE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 128, 0, 0.4)'
        }),
        zIndex: 6
    }),
    RED:  new ol.style.Style({
      // '#C00000'
        fill: new ol.style.Fill({
          color: 'rgba(192, 0, 0, 0.4)'
        }),
        zIndex: 7
    }),
    DARKRED:  new ol.style.Style({
      // '#800000'
        fill: new ol.style.Fill({
            color: 'rgba(128, 0, 0, 0.4)'
        }),
        zIndex: 8
    }),
    PURPLE:  new ol.style.Style({
      // '#6600CC'
        fill: new ol.style.Fill({
          color: 'rgba(102, 0, 204, 0.4)' 
        }),
        zIndex: 9
    })
  },
  forecast_wind_swath: {
    RED:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.4)'
        }),
    }),
    BLUE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 36, 250, 0.4)'
        }),
    }),
    WHITE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
    }),
    YELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 51, 0.4)'
        }),
    })
  }
}

/**
     * Gets the color associated with the given wind speed.
     *
     * @param {number} - A storm's wind speed.
     * @returns {string} A color string.
     */
function getColorFromWS(ws) {

  const TROP_STORM_SPEED = 34;
  const STRONG_STORM_SPEED = 50;
  const HURRICANE_SPEED = 64;
      
  if (ws >= TROP_STORM_SPEED && ws < STRONG_STORM_SPEED) {
    return 'BLUE';
  } else if (ws >= STRONG_STORM_SPEED && ws < HURRICANE_SPEED) {
    return 'YELLOW';
  } else if (ws >= HURRICANE_SPEED) {
    return 'RED';
  } else {
    return 'WHITE';
  }
}

/**
     * Gets the color associated with the given wind speed prob.
     *
     * @param {number} - A storm's wind prob.
     * @returns {string} A color string.
     */
function getColorFromProb(prob) {
  prob = (prob >= 10) ? (Math.floor(prob / 10) * 10) : (prob >= 5) ? 5 : 0;
 
  switch (prob) {
    case 5:
      return 'DARKGREEN';
    case 10:
      return 'GREEN';
    case 20:
      return 'LIMEGREEN';
    case 30:
      return 'LIGHTYELLOW';
    case 40:
      return 'BLANDYELLOW';
    case 50:
      return 'DARKORANGE';
    case 60:
      return 'ORANGE';
    case 70:
      return 'RED';
    case 80:
      return 'DARKRED';
    case 90:
      return 'PURPLE';
    }
}

function styleFunction(feature) {
  const layerName = vectorLayer.get('name');
  if (layerName === 'error_cone') {
    return currentStyles[feature.get('label')];
  } else if (layerName === 'forecast_position') {
    if (forecastHrs.includes(feature.get('hour'))) {
      const color = getColorFromWS(feature.get('maxwind'));
      return currentStyles[color];
    } else {
      return currentStyles.default;
    }
  } else if (layerName === 'forecast_track_line') {
    return currentStyles.default;
  } else if (layerName === 'forecast_track_point') {
    const color = getColorFromWS(feature.get('maxwind'));
      return currentStyles[color];
  } else if (layerName === 'forecast_winds') {
    const color = getColorFromWS(feature.get('maxwind'));
    return currentStyles[color];
  } else if (layerName === 'past_track_point') {
    const color = getColorFromWS(feature.get('maxwind'));
      return currentStyles[color];
  } else if (layerName === 'past_track_line') {
      return currentStyles.default;
  } else if (layerName === 'past_wind') {
    console.log(feature);
    const color = getColorFromWS(feature.get('windspd'));
      return currentStyles[color];
  } else if (layerName === 'warning_line') {
      return currentStyles.default;
  } else if (layerName === 'wind_prob_point') {
    console.log(feature);
      return currentStyles.default;
  } else if (layerName === 'wind_prob_polygon') {
    if (feature.get('windspd') === 34) {
    const color = getColorFromProb(feature.get('prob'));
    return currentStyles[color];
    }
  } else if (layerName === 'forecast_wind_swath') {
    const color = getColorFromWS(feature.get('windspd'));
    return currentStyles[color];
  }
}

// Initialize the map and setup controls
document.addEventListener("DOMContentLoaded", function() {
  initMap();
  loadStorms()
  // setupLayerControls();
});



  


