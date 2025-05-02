// To DO: 
// ZOOM to Layer / Zoom to Selected Region
// cache layers for quick display

// add logos
// add download capability

import styles from './layer-styles.js';

const mapLayers = {};
let stormMap = {};

let map;          
let stormList;
let activeStormId;
let currentIndex;
let arrowDebounceTimer = null;
const token = 'fb790bbfff4ba5a930d0fb75c1f81dd53503fc2b';

// What are the correct forecast hours?
const forecastHrs = [0, 5, 17, 33, 45, 57, 69, 93, 117]

// Tropical storm regions
const tropicalStormRegions = [
  { name: "Atlantic", code: "AL", extent: [-100, 5, -20, 45] },
  { name: "Central Pacific", code: "CP", extent: [-180, 0, -140, 30] },
  { name: "Eastern Pacific", code: "EP", extent: [-140, 5, -90, 30] },
  { name: "Arabian Sea", code: "IA", extent: [50, 5, 77, 25] },
  { name: "Bay of Bengal", code: "IB", extent: [77, 5, 100, 22] },
  { name: "South Indian Ocean", code: "SI", extent: [20, -40, 90, -5] },
  { name: "South Pacific", code: "SP", extent: [160, -40, -120, -5] },
  { name: "Western Pacific", code: "WP", extent: [100, 5, 180, 40] }
];

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

  document.getElementById('toc').addEventListener('toggle', function(e) {
    // Only handle toggle events from <details> elements
    const details = e.target;
    if (details.tagName !== 'DETAILS') return;
  
    if (details.open) {
      // Remove highlight and close previous active storm
      const prevDetailsEl = document.querySelector(`details[data-stormid="${activeStormId}"]`);
      if (prevDetailsEl && prevDetailsEl !== details) {
        prevDetailsEl.querySelector("summary").style.backgroundColor = "";
        prevDetailsEl.open = false;
        document.querySelectorAll(`input[name="layer_${activeStormId}"]`).forEach((lyr) => {
          if (lyr.checked) {
            lyr.checked = false;
            lyr.dispatchEvent(new Event('change'));
          }
        });
      }
      // Highlight the currently opened summary
      details.querySelector("summary").style.backgroundColor = "#c1ddf2";
      activeStormId = details.getAttribute("data-stormid");
      const stormObj = stormList.find(storm => storm.stormid === activeStormId);
      makeStormActive(stormObj);
    }
  }, true); // Use capture phase for toggle events
}

function zoomToRegion(extent4326) {
  const extent3857 = ol.proj.transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
  map.getView().fit(extent3857, {
    duration: 1000,
    padding: [50, 50, 50, 50],
    maxZoom: 8
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
      // Build the stormMap for fast lookup
      stormMap = Object.fromEntries(stormList.map(storm => [storm.stormid, storm]));
      populateStorms();
  });
}

async function populateStorms() {
  const toc = document.getElementById('toc');
  toc.innerHTML = '';
  let tocHTML = '';

  // Group storms by year and region (regions capitalized)
  const grouped = {};
  stormList.forEach(storm => {
    const year = storm.year;
    const region = storm.region.toUpperCase();
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][region]) grouped[year][region] = [];
    grouped[year][region].push(storm);
  });

  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
  const currentYear = sortedYears[0];

  for (const year of sortedYears) {
    tocHTML += `<div class="folder year-folder">
      <div class="folder-header" onclick="this.nextElementSibling.classList.toggle('collapsed'); 
      const toggle = this.querySelector('.year-toggle');
    toggle.textContent = toggle.textContent === '+' ? '-' : '+';">
        <span class="year-toggle">+</span> ${year}
      </div>
      <div class="folder-content collapsed">`;
      const sortedRegions = Object.keys(grouped[year]).sort();
      for (const region of sortedRegions) {

        tocHTML += `
          <div class="folder region-folder" style="margin-left:10px;">
            <div class="folder-header" onclick="this.nextElementSibling.classList.toggle('collapsed'); 
            const toggle = this.querySelector('.year-toggle');
    toggle.textContent = toggle.textContent === '+' ? '-' : '+';">
              <span class="year-toggle">+</span> ${region}
            </div>
            <div class="folder-content collapsed" id="region-${year}-${region}" style="margin-left:20px;">
              <div class="storm-list-placeholder">Loading...</div>
            </div>
          </div>
        `;
      }

      tocHTML += `</div></div>`;
    }
  
    toc.innerHTML = tocHTML;

  //Prefetch and display current year storms
  await Promise.all(
    Object.keys(grouped[currentYear]).map(async region => {
      const regionStorms = grouped[currentYear][region];
      const regionStormsHTML = await populateStormTemplates(regionStorms);
      document.getElementById(`region-${currentYear}-${region}`).innerHTML = regionStormsHTML;
    })
  );

  // Now open the first storm details element in the current year
  const firstDetails = document.querySelector(
    Object.keys(grouped[currentYear])
      .map(region => `#region-${currentYear}-${region} details`)
      .join(', ')
  );
 
  if (firstDetails) {
    // Expand region and year folders first
    const regionContent = firstDetails.closest('.folder-content.collapsed');
    if (regionContent) {
      regionContent.classList.remove('collapsed');
      const regionHeader = regionContent.previousElementSibling;
      if (regionHeader) {
        const regionToggle = regionHeader.querySelector('.year-toggle');
        if (regionToggle) regionToggle.textContent = '-';
      }
      const yearContent = regionContent.parentElement.closest('.folder-content.collapsed');
      if (yearContent) {
        yearContent.classList.remove('collapsed');
        const yearHeader = yearContent.previousElementSibling;
        if (yearHeader) {
          const yearToggle = yearHeader.querySelector('.year-toggle');
          if (yearToggle) yearToggle.textContent = '-';
        }
      }
    }
    // Now open the details element (fires toggle event)
    firstDetails.open = true;
  }

  
const backgroundTasks = [];
sortedYears.slice(1).forEach(year => {
  Object.keys(grouped[year]).forEach(region => {
    backgroundTasks.push(() => runWhenIdle(async () => {
      const regionStorms = grouped[year][region];
      const regionStormsHTML = await populateStormTemplates(regionStorms);
      document.getElementById(`region-${year}-${region}`).innerHTML = regionStormsHTML;
    }));
  });
});
promisePool(backgroundTasks, 1); // Adjust concurrency as needed
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

  // Debounced click handlers
  newLeftArrow.addEventListener('click', () => {
    if (arrowDebounceTimer) clearTimeout(arrowDebounceTimer);
    currentIndex--;
    arrowDebounceTimer = setTimeout(() => {
      currentIndex = clampIndex(currentIndex, stormMap[activeStormId]);
      updateArrowState('click', stormMap[activeStormId], currentIndex);
    }, 250);
  });

  newRightArrow.addEventListener('click', () => {
    if (arrowDebounceTimer) clearTimeout(arrowDebounceTimer);
    currentIndex++;
    arrowDebounceTimer = setTimeout(() => {
      currentIndex = clampIndex(currentIndex, stormMap[activeStormId]);
      updateArrowState('click', stormMap[activeStormId], currentIndex);
    }, 250);
  });
}

function clampIndex(idx, storm) {
  if (idx < 0) return 0;
  if (idx > storm.workingAdvisories.length - 1) return storm.workingAdvisories.length - 1;
  return idx;
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

  const stormLabel = lastAdvisory.storm_name 
    ? `${lastAdvisory.storm_name} (${storm.stormid})` 
    : `${storm.stormid}`;
  
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

  // Add download icon (Bootstrap "bi-download")
  const stormDownload = `
  <span class="storm-download-container">
    <i class="bi bi-arrow-down-square storm-download-icon" title="Download Storm" data-stormid="${storm.stormid}" style="cursor:pointer;"></i>
  </span>
`;
 
  return `
  <details data-stormid="${storm.stormid}">
    <summary>
      <span class="storm-label-fixed">${stormLabel}</span>
      ${stormDownload}
    </summary>
    ${layersHTML}
  </details>
`;
};

// Function to populate storm templates into the toc container
const populateStormTemplates = async (stormData) => {
  // Generate and insert the storm templates dynamically
  const stormTemplates = await Promise.all(
    stormData.sort((a, b) => a.number - b.number).map(storm => createStormTemplate(storm)));

  return stormTemplates.join('');
};

function makeStormActive(storm) {

  if (storm) {
    const lastAdvisory = storm.workingAdvisories[storm.workingAdvisories.length - 1];
    currentIndex = storm.workingAdvisories.length - 1;
    const titleBar = document.getElementById('storm-title');
  
    if (titleBar && lastAdvisory) {
      document.getElementById('left-arrow').style.display = 'inline-block';
      document.getElementById('right-arrow').style.display = 'inline-block';
      updateArrowState('init', storm, currentIndex);
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
    
    // Zoom to the storm's region
    console.log(storm);
    const region = storm.region.toUpperCase();
    const regionInfo = tropicalStormRegions.find(r => r.code === region);
    if (regionInfo) {
      zoomToRegion(regionInfo.extent);
    }
  }
}

function handleCheckBoxChange(event) {
  if (event.target.checked) {
    // Load the GeoJSON file for the selected layer
    loadLayer(event.target);
  } else {
    clearLayer(event.target);
  }
}

function updateArrowState(e, storm, idx) {
  currentIndex = idx;
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
    const layersHTML = Object.entries(storm.workingAdvisories[idx].layers)
      .map(([layerName, layerValue]) => {
        // Check if this layer was previously checked
        const wasChecked = checkedLayers.includes(layerName);
                
        if (layerValue.startsWith('http://')) {
          layerValue = layerValue.replace('http://', 'https://');
        }

        return `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="layer_${storm.stormid}" 
                            value="${layerValue}" adv="${storm.workingAdvisories[idx].advisory_id}" 
                            layername="${layerName}" ${wasChecked ? 'checked' : ''}>
                        <label class="form-check-label">${layerName}</label>
                    </div>
                `;
            })
            .join('');

        detailsEl.insertAdjacentHTML('beforeend', layersHTML);

        // Only check for unavailable layers that were previously checked
        const unavailableCheckedLayers = checkedLayers.filter(layer => 
            !storm.workingAdvisories[idx].layers[layer]
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

    // Update the title text
    document.getElementById('storm-name').textContent = `${storm.workingAdvisories[idx].storm_status.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} ${storm.workingAdvisories[idx].storm_name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}`;
    renderAdvisoryDropdown(storm, idx);
    document.getElementById('advisory-time').textContent = `${storm.workingAdvisories[idx].advisory_time}`;

    // Update arrow states
    document.getElementById('left-arrow').disabled = idx === 0;
    document.getElementById('left-arrow').style.opacity = idx === 0 ? 0.5 : 1;
    document.getElementById('left-arrow').style.pointerEvents = idx === 0 ? 'none' : 'auto';

    document.getElementById('right-arrow').disabled = idx === storm.workingAdvisories.length - 1;
    document.getElementById('right-arrow').style.opacity = idx === storm.workingAdvisories.length - 1 ? 0.5 : 1;
    document.getElementById('right-arrow').style.pointerEvents = idx === storm.workingAdvisories.length - 1 ? 'none' : 'auto';
}

function promisePool(tasks, poolLimit = 4) {
  let i = 0;
  const results = [];
  const executing = [];

  const enqueue = () => {
    if (i === tasks.length) return Promise.resolve();
    const task = tasks[i++]();
    results.push(task);
    const e = task.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    let r = Promise.resolve();
    if (executing.length >= poolLimit) {
      r = Promise.race(executing);
    }
    return r.then(() => enqueue());
  };

  return enqueue().then(() => Promise.all(results));
}

function runWhenIdle(fn) {
  return new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        fn().then(resolve);
      }, { timeout: 1000 });
    } else {
      setTimeout(() => {
        fn().then(resolve);
      }, 50);
    }
  });
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
        map.addLayer(vectorLayer);
      })
    .catch((error) => {
      console.error(error.message);
    });
  } else {
    map.addLayer(stormLayers[layer.attributes.layername.value]);
  }
}

function clearLayer(layer) {
  map.removeLayer(mapLayers[layer.attributes.name.value][layer.attributes.adv.value][layer.attributes.layername.value]);
}

function renderAdvisoryDropdown(storm, currentIndex) {
  const container = document.getElementById('advisory-dropdown');
  if (!container) return;

  container.innerHTML = `
    <div class="selected">${'Advisory #' + storm.workingAdvisories[currentIndex].advisory_id}</div>
    <div class="dropdown-list" style="display:none"></div>
  `;

  const selected = container.querySelector('.selected');
  const dropdownList = container.querySelector('.dropdown-list');

  dropdownList.innerHTML = storm.workingAdvisories.map((advisory, idx) =>
    `<div class="dropdown-item${idx === currentIndex ? ' selected' : ''}" data-idx="${idx}">
      Advisory #${advisory.advisory_id}
    </div>`
  ).join('');

  selected.onclick = (e) => {
    e.stopPropagation();
    container.classList.toggle('open');
    dropdownList.style.display = container.classList.contains('open') ? 'block' : 'none';
  };

  container.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      selected.click();
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      container.classList.remove('open');
      dropdownList.style.display = 'none';
    }
  };

  dropdownList.onclick = (e) => {
    if (e.target.classList.contains('dropdown-item')) {
      currentIndex = parseInt(e.target.dataset.idx, 10);
      container.classList.remove('open');
      dropdownList.style.display = 'none';
      updateArrowState('click', storm, currentIndex);
    }
  };

  document.addEventListener('click', function handler(e) {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
      dropdownList.style.display = 'none';
      document.removeEventListener('click', handler);
    }
  });
}

function setupStormDownloadIcons() {
  const toc = document.getElementById('toc');
  if (!toc) return;

  toc.addEventListener('click', function(e) {
    // Prevent <details> toggle when clicking the download icon or its container
    if (
      e.target.classList.contains('storm-download-icon') ||
      e.target.classList.contains('storm-download-container')
    ) {
      e.stopPropagation();

      // Download logic
      // Get the storm id (from the icon or its parent)
      const stormId = e.target.closest('[data-stormid]').getAttribute('data-stormid');
      downloadStormData(stormId);
    }
  });
}

// Example download logic function (customize as needed)
function downloadStormData(stormId) {
  // For demonstration, download a JSON file with stormId in the name
  // Replace this with your actual download logic
  const data = { message: "Download for storm " + stormId };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `storm_${stormId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize the map and setup controls
document.addEventListener("DOMContentLoaded", function() {
  initMap();
  loadStorms()
  setupArrowControls();
  setupStormDownloadIcons();
});



  
