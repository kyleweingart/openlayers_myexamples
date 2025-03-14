// To DO: 
// 1. ZOOM to Layer / Zoom to Selected Region
// Robust overhang
// cycle through advisories - add another dimension to mapLayers Object
// cache layers for quick display
// load all Layers on application startup (improve speed and ui)
// default storm names / load etc.

import styles from './styles.js';


const mapLayers = {};

let map;          // Declare the map globally
// let currentStyles;
let stormList;
let activeStormId;
let currentIndex;
const token = 'fb790bbfff4ba5a930d0fb75c1f81dd53503fc2b';

// What are the correct forecast hours?
const forecastHrs = [0, 5, 17, 33, 45, 57, 69, 93, 117]

// Initialize the map with a raster (OSM) layer
function initMap() {
  const raster = new ol.layer.Tile({
    source: new ol.source.OSM(),
    name: 'basemap'
  });

  map = new ol.Map({
    layers: [raster],
    target: document.getElementById('map'),
    view: new ol.View({
      center: [0, 3000000], 
      zoom: 2,
    }),
  });
}

async function getStormLayers(storm) {
  // To Do: maybe need to add logic if workingAdvisories already fetched dont do it again/use existing storm Object
  // this could be a factor if changing to and from years and regions - making same request multiple times
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

    const index = stormList.findIndex(s => s.stormid === storm.stormid);
    if (index !== -1 && !stormList[index].workingAdvisories) {
      stormList[index].workingAdvisories = advisories.filter(advisory => advisory.storm === storm.stormid);
    }

    return advisories;
} catch (error) {
    console.error(error);
    return []; // Return an empty array on error
}
}
  
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
      comboBox.value = options[0]; // Set first option as selected by default
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

function setupArrowControls() {
  // Remove existing listeners first to prevent duplicates
  const leftArrow = document.getElementById('left-arrow');
  const rightArrow = document.getElementById('right-arrow');
  
  // Clone and replace elements to remove all existing listeners
  const newLeftArrow = leftArrow.cloneNode(true);
  const newRightArrow = rightArrow.cloneNode(true);
  leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
  rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);
  
  // Add new listeners
  newLeftArrow.addEventListener('click', () => {
      currentIndex--;
      updateArrowState('click', stormList.find(s => s.stormid === activeStormId));
  });

  newRightArrow.addEventListener('click', () => {
      currentIndex++;
      updateArrowState('click', stormList.find(s => s.stormid === activeStormId));
  });
}

// Function to create storm template using template literals
const createStormTemplate = async (storm) => {
  const stormLayers =  await getStormLayers(storm);
  // Get the last advisory
  const lastAdvisory = stormLayers[stormLayers.length - 1];
 
  const stormLabel = lastAdvisory.storm_name 
    ? `${lastAdvisory.storm_name} (${storm.stormid})` 
    : `${storm.stormid}`;

  // Only proceed if last advisory is not undefined
  if (!lastAdvisory || !lastAdvisory.layers) {
      console.warn(`No advisories or layers found for storm ${storm.stormid}`);
      return ''; // Return an empty string to skip rendering this storm
  }

  // Generate layersHTML dynamically, ensuring we display both the layer name and its value
  const layersHTML = Object.entries(lastAdvisory.layers)
  .map(([layerName, layerValue], index) => {
  
    // const checked = index === 0 ? 'checked' : ''; // Add 'checked' to the first layer
   
    if (layerValue.startsWith('http://')) {
      layerValue = layerValue.replace('http://', 'https://');
    }
    return `
      <div class="form-check">
          <input class="form-check-input" type="checkbox" name="layer_${storm.stormid}" value="${layerValue}" adv="${lastAdvisory.advisory_id}" layername="${layerName}">
          <label class="form-check-label">${layerName}</label>
      </div>
    `;
  })
  .join('');
 
  return `
      <details data-stormid="${storm.stormid}" >
          <summary>${stormLabel}</summary>
          ${layersHTML}
      </details>
  `;
};

// Function to populate storm templates into the toc container
const populateStormTemplates = async (stormData) => {
  const container = document.getElementById('toc'); // Get the target container
  container.innerHTML = ''; // Clear any existing content
  // Generate and insert the storm templates dynamically
  const stormTemplates = await Promise.all(
    stormData.sort((a, b) => a.number - b.number).map(storm => createStormTemplate(storm)));
  
  // Update the container with the generated HTML
  container.innerHTML = stormTemplates.join('');

  // Attach event listeners to <details> elements AFTER they are inserted
  document.querySelectorAll('#toc details').forEach(details => {
    details.addEventListener('toggle', function () {
          if (details.open) {
            const prevDetailsEl = document.querySelector(`details[data-stormid="${activeStormId}"]`);
            if (prevDetailsEl) {
              // Remove highlight and close previous active storm 
              prevDetailsEl.querySelector("summary").style.backgroundColor = "";
              prevDetailsEl.open = false;  // This programmatically closes the details element.
              document.querySelectorAll(`input[name="layer_${activeStormId}"]`).forEach((lyr) => {
                
              // uncheck
                if (lyr.checked) {
                  lyr.checked = false;
                  lyr.dispatchEvent(new Event('change'));
                }
              });
            }
              
              // Highlight the currently opened summary
              details.querySelector("summary").style.backgroundColor = "yellow";
              activeStormId = details.getAttribute("data-stormid");
              const stormObj = stormList.find(storm => storm.stormid === activeStormId);
              makeStormActive(stormObj);
          }
      });
  });

  if (stormData.length > 0) {
    // To Do: more refinement needed for making active by default (Active vs Current Year vs Archive Year)
    // currently defaults to first storm in stormData array
    const detailsEl = document.querySelector(`details[data-stormid="${stormData[0].stormid}"]`);
   
    if (detailsEl) {
      detailsEl.open = true;  // This programmatically opens the details element.
    }
  }
};

function makeStormActive(storm) {

  if (storm) {
    const lastAdvisory = storm.workingAdvisories[storm.workingAdvisories.length - 1];
    currentIndex = storm.workingAdvisories.length - 1;
    const titleBar = document.getElementById('storm-title');
  
    if (titleBar && lastAdvisory) {
      // To Do: can I move this?
      // Show the left and right arrows
      document.getElementById('left-arrow').style.display = 'inline-block';
      document.getElementById('right-arrow').style.display = 'inline-block';

      updateArrowState('init', storm);
    }

    // Find the details element for the storm and open it.
    const detailsEl = document.querySelector(`details[data-stormid="${storm.stormid}"]`);
    if (detailsEl) {
      detailsEl.open = true;  // This programmatically opens the details element.
    }
    const firstLayer = document.querySelector(
      `input[name="layer_${storm.stormid}"]`
    );

    if (firstLayer) {
      firstLayer.checked = true; 
      firstLayer.dispatchEvent(new Event('change', {bubbles: true}));
    }
  }
}

function handleCheckBoxChange(event) {
  if (event.target.checked) {
    console.log('load layer');
    // Load the GeoJSON file for the selected layer
    loadLayer(event.target);
  } else {
    clearLayer(event.target);
  }
}

function updateArrowState(e, storm) {
    // Get only the CHECKED layers before update
    const checkedLayers = [...document.querySelectorAll(`input[name="layer_${storm.stormid}"]`)]
        .filter(layer => layer.checked)
        .map(layer => layer.getAttribute('layername'));

    if (e === 'click') {
        // Clear existing layers
        checkedLayers.forEach(layer => { 
            const lyrName = document.querySelector(`input[layername=${layer}]`)
            clearLayer(lyrName);
        });

        const detailsEl = document.querySelector(`details[data-stormid="${storm.stormid}"]`);
        
        detailsEl.querySelectorAll(".form-check").forEach(el => {
            el.removeEventListener('change', handleCheckBoxChange);
            el.remove();
        });

        // Generate new layer checkboxes
        const layersHTML = Object.entries(storm.workingAdvisories[currentIndex].layers)
            .map(([layerName, layerValue], index) => {
                // Check if this layer was previously checked
                const wasChecked = checkedLayers.includes(layerName);
                
                if (layerValue.startsWith('http://')) {
                    layerValue = layerValue.replace('http://', 'https://');
                }

                return `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="layer_${storm.stormid}" 
                            value="${layerValue}" adv="${storm.workingAdvisories[currentIndex].advisory_id}" 
                            layername="${layerName}" ${wasChecked ? 'checked' : ''}>
                        <label class="form-check-label">${layerName}</label>
                    </div>
                `;
            })
            .join('');

        detailsEl.insertAdjacentHTML('beforeend', layersHTML);

        // Only check for unavailable layers that were previously checked
        const unavailableCheckedLayers = checkedLayers.filter(layer => 
            !storm.workingAdvisories[currentIndex].layers[layer]
        );

        if (unavailableCheckedLayers.length > 0) {
            const notificationDiv = document.getElementById('layer-notifications');
            const notificationText = notificationDiv.querySelector('.notification-text');
            notificationText.textContent = `Previously selected layers are not available in this advisory: ${unavailableCheckedLayers.join(', ')}`;
            notificationDiv.style.display = 'block';
            
            // Hide notification after a few seconds
            setTimeout(() => {
                notificationDiv.style.display = 'none';
            }, 5000);

            // If all checked layers became unavailable, check the first available layer
            const anyLayerChecked = document.querySelectorAll(`input[name="layer_${storm.stormid}"]:checked`).length > 0;
            if (!anyLayerChecked) {
                const firstLayer = document.querySelector(`input[name="layer_${storm.stormid}"]`);
                if (firstLayer) {
                    firstLayer.checked = true;
                    notificationText.textContent += '\nAutomatically selected the first available layer.';
                }
            }
        }
    }

    // Add event listeners to new checkboxes
    document.querySelectorAll(`input[name="layer_${storm.stormid}"]`).forEach((lyr) => {
        lyr.removeEventListener('change', handleCheckBoxChange);
        lyr.addEventListener('change', handleCheckBoxChange);
        
        if (lyr.checked) {
            lyr.dispatchEvent(new Event('change'));
        }
    });

    // Update the advisory text
    document.getElementById('advisory-text').textContent = `Advisory #${storm.workingAdvisories[currentIndex].advisory_id}`;

    // Update arrow states
    document.getElementById('left-arrow').disabled = currentIndex === 0;
    document.getElementById('left-arrow').style.opacity = currentIndex === 0 ? 0.5 : 1;
    document.getElementById('left-arrow').style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

    document.getElementById('right-arrow').disabled = currentIndex === storm.workingAdvisories.length - 1;
    document.getElementById('right-arrow').style.opacity = currentIndex === storm.workingAdvisories.length - 1 ? 0.5 : 1;
    document.getElementById('right-arrow').style.pointerEvents = currentIndex === storm.workingAdvisories.length - 1 ? 'none' : 'auto';
}

// Function to fetch GeoJSON and update the vector layer
function loadLayer(layer) {

  if (!mapLayers[layer.attributes.name.value]) {
    mapLayers[layer.attributes.name.value] = {};
  }

  // Ensure the advisory number exists within the storm ID
  if (!mapLayers[layer.attributes.name.value][layer.attributes.adv.value]) {
    mapLayers[layer.attributes.name.value][layer.attributes.adv.value] = {};
  }
 
  const stormLayers = mapLayers[layer.attributes.name.value][layer.attributes.adv.value];

  if (!stormLayers[layer.attributes.layername.value]) {
    // Update the current styles based on the layer
    fetch(`${layer.value}`, {
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
      .then((geojsonData) => {
        // Read features from the GeoJSON file
        const features = new ol.format.GeoJSON().readFeatures(geojsonData, {
          dataProjection: 'EPSG:4326', // GeoJSON standard
          featureProjection: 'EPSG:3857', // Web Mercator for OpenLayers
        });

        const vectorSource = new ol.source.Vector()
        vectorSource.addFeatures(features);

        const vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          stormid: layer.attributes.name.value,
          advisory: layer.attributes.adv.value,
          layer: layer.attributes.layername.value,
          style: styles.styleFunction.bind(styles)
        });
        stormLayers[layer.attributes.layername.value] = vectorLayer;
        console.log('add layer now - line 409');
        map.addLayer(vectorLayer);
      })
    .catch((error) => {
      console.error(error.message);
    });
  } else {
    
    console.log('add layer now- line 402');
    map.addLayer(stormLayers[layer.attributes.layername.value]);
  }
}

function clearLayer(layer) {
  map.removeLayer(mapLayers[layer.attributes.name.value][layer.attributes.adv.value][layer.attributes.layername.value]);
}

// function clearAllLayers() {
//   map.getLayers().forEach(layer => {
//     console.log(layer.get('name'));
//     if (layer.get('name') !== 'basemap') {
//       console.log('remove layer');
//       map.removeLayer(layer);
//     }
//   })
// }

// To Do: sometimes assertion error in console when multiple storm layers turning off and on

// Event listener for radio buttons
// function setupLayerControls(storm) {
//   document.querySelectorAll(`input[name="layer_${storm.stormid}"]`).forEach((lyrChkBox) => {
//     lyrChkBox.addEventListener('change', (event) => {
//       if (event.target.checked) {
//         console.log('load layer - 435');
//         // Load the GeoJSON file for the selected layer
//         loadLayer(event.target);
//       } else {
//         clearLayer(event.target);
//       }
//     });
//   });
// }



// Initialize the map and setup controls
document.addEventListener("DOMContentLoaded", function() {
  initMap();
  loadStorms()
  setupArrowControls();
});



  


