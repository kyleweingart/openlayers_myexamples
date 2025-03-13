// To DO: 
// 1. ZOOM to Layer / Zoom to Selected Region
// Robust overhang
// cycle through advisories - add another dimension to mapLayers Object
// cache layers for quick display
// load all Layers on application startup (improve speed and ui)
// default storm names / load etc.

const mapLayers = {};

let map;          // Declare the map globally
let currentStyles;
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
  // Set Layer Controls
  // stormData.forEach(storm => {
  //   setupLayerControls(storm);
  // });

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
   
    // const advisoryText = document.getElementById('advisory-text');
    if (titleBar && lastAdvisory) {

      // function updateArrowState(e) {

       
        
      //   const checkedLayers = [...document.querySelectorAll(`input[name="layer_${storm.stormid}"]`)]
      //   .filter(layer => layer.checked)
      //   .map(layer => layer.getAttribute('layername'));

      //     if (e === 'click') {
      //     checkedLayers.forEach(layer => { 
      //       const lyrName = document.querySelector(`input[layername=${layer}]`)
      //       clearLayer(lyrName);
      //     });

      //   const detailsEl = document.querySelector(`details[data-stormid="${storm.stormid}"]`);
        
      //   detailsEl.querySelectorAll(".form-check").forEach(el => {
         
      //     el.removeEventListener('change',  handleCheckBoxChange);
      //     el.remove();
      //   });
      //   // To Do: need to replace values of all layers with check box with new advisory index
      //   // also need to add/remove layers if needed - see which layers are checked on? off?
       
      //   const layersHTML = Object.entries(storm.workingAdvisories[currentIndex].layers)
      //     .map(([layerName, layerValue], index) => {
          
      //     const checked = checkedLayers.includes(layerName) ? 'checked' : '';

      //     if (layerValue.startsWith('http://')) {
      //       layerValue = layerValue.replace('http://', 'https://');
      //     }
      //     return `
      //       <div class="form-check">
      //           <input class="form-check-input" type="checkbox" name="layer_${storm.stormid}" value="${layerValue}" adv="${storm.workingAdvisories[currentIndex].advisory_id}" layername="${layerName}" ${checked}>
      //           <label class="form-check-label">${layerName}</label>
      //       </div>
      //     `;
      //   })
      //   .join('');

      //   detailsEl.insertAdjacentHTML('beforeend', layersHTML);
      //   } 


      //   document.querySelectorAll(`input[name="layer_${storm.stormid}"]`).forEach((lyr) => {
        
      //     console.log('removing event listener to layer');
      //     lyr.removeEventListener('change', handleCheckBoxChange);
       
          
      //     console.log('adding event listener to layer');
      //   //  To Do: in many cases event listeners getting added multiple times (which causes assertion errors)
      //     lyr.addEventListener('change', handleCheckBoxChange);
          

      //     if (lyr.checked) {
      //       console.log('lyr.checked');
      //       lyr.dispatchEvent(new Event('change'));
      //     }
      //   });
      
      //   // Update the advisory text
      //   advisoryText.textContent = `Advisory #${storm.workingAdvisories[currentIndex].advisory_id}`;
    
      //   // Disable left arrow if at the beginning
      //   leftArrowButton.disabled = currentIndex === 0;
      //   leftArrowButton.style.opacity = currentIndex === 0 ? 0.5 : 1;
      //   leftArrowButton.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
    
      //   // Disable right arrow if at the end
      //   rightArrowButton.disabled = currentIndex === storm.workingAdvisories.length - 1;
      //   rightArrowButton.style.opacity = currentIndex === storm.workingAdvisories.length - 1 ? 0.5 : 1;
      //   rightArrowButton.style.pointerEvents = currentIndex === storm.workingAdvisories.length - 1 ? 'none' : 'auto';
      // }

      // Show the left and right arrows
      document.getElementById('left-arrow').style.display = 'inline-block';
      document.getElementById('right-arrow').style.display = 'inline-block';

      // Add event listeners for arrow buttons
      document.getElementById('left-arrow').addEventListener('click', () => {
        // To Do: update advisory display
        currentIndex--;
        updateArrowState('click', storm);
       
      });

      document.getElementById('right-arrow').addEventListener('click', () => {
        currentIndex++;
        updateArrowState('click', storm);
      });

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
      console.log(firstLayer);
      // To Do: layer not being added - previously i think there was a change event fired here?
      firstLayer.checked = true; // visually mark it as selected
      // console.log('firing an event change for first layer in newly activated storm');
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

       
        
  const checkedLayers = [...document.querySelectorAll(`input[name="layer_${storm.stormid}"]`)]
  .filter(layer => layer.checked)
  .map(layer => layer.getAttribute('layername'));

    if (e === 'click') {
    checkedLayers.forEach(layer => { 
      const lyrName = document.querySelector(`input[layername=${layer}]`)
      clearLayer(lyrName);
    });

  const detailsEl = document.querySelector(`details[data-stormid="${storm.stormid}"]`);
  
  detailsEl.querySelectorAll(".form-check").forEach(el => {
   
    el.removeEventListener('change',  handleCheckBoxChange);
    el.remove();
  });
  // To Do: need to replace values of all layers with check box with new advisory index
  // also need to add/remove layers if needed - see which layers are checked on? off?
 
  const layersHTML = Object.entries(storm.workingAdvisories[currentIndex].layers)
    .map(([layerName, layerValue], index) => {
    
    const checked = checkedLayers.includes(layerName) ? 'checked' : '';

    if (layerValue.startsWith('http://')) {
      layerValue = layerValue.replace('http://', 'https://');
    }
    return `
      <div class="form-check">
          <input class="form-check-input" type="checkbox" name="layer_${storm.stormid}" value="${layerValue}" adv="${storm.workingAdvisories[currentIndex].advisory_id}" layername="${layerName}" ${checked}>
          <label class="form-check-label">${layerName}</label>
      </div>
    `;
  })
  .join('');

  detailsEl.insertAdjacentHTML('beforeend', layersHTML);
  } 


  document.querySelectorAll(`input[name="layer_${storm.stormid}"]`).forEach((lyr) => {
  
    console.log('removing event listener to layer');
    lyr.removeEventListener('change', handleCheckBoxChange);
 
    
    console.log('adding event listener to layer');
  //  To Do: in many cases event listeners getting added multiple times (which causes assertion errors)
    lyr.addEventListener('change', handleCheckBoxChange);
    

    if (lyr.checked) {
      console.log('lyr.checked');
      lyr.dispatchEvent(new Event('change'));
    }
  });

  // Update the advisory text
  document.getElementById('advisory-text').textContent = `Advisory #${storm.workingAdvisories[currentIndex].advisory_id}`;

  // Disable left arrow if at the beginning
  document.getElementById('left-arrow').disabled = currentIndex === 0;
  document.getElementById('left-arrow').style.opacity = currentIndex === 0 ? 0.5 : 1;
  document.getElementById('left-arrow').style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

  // Disable right arrow if at the end
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
    currentStyles = stylesByLayer[layer.attributes.layername.value];
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
          style: styleFunction
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
 
  // map.getLayers().forEach(layer => {
  //   console.log(layer);
  // })
  // console.log(mapLayers[layer.attributes.name.value][layer.attributes.adv.value][layer.attributes.layername.value]);
  map.removeLayer(mapLayers[layer.attributes.name.value][layer.attributes.adv.value][layer.attributes.layername.value]);
  // console.log('layer removed');
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
  const layerName = feature.get('layer');
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
    const color = getColorFromWS(feature.get('windspd'));
      return currentStyles[color];
  } else if (layerName === 'warning_line') {
      return currentStyles.default;
  } else if (layerName === 'wind_prob_point') {
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



  


