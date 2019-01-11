// basemap grayscale
var basemap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'OSM',
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
    })
});

// county WMS USGS
var wmsCounty = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=wms',
        params: { 'LAYERS': 'sb:US_County_Boundaries' }
    })
})

// state WMS USGS
var wmsState = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=wms',
        params: { 'LAYERS': 'sb:US_States' }
    })
})


// county WFS USGS
var wfsCounty = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4a2ee4b07f02db615738?service=WFS&request=GetFeature&version=1.0.0&typename=sb:US_County_Boundaries&outputFormat=application/json',
        format: new ol.format.GeoJSON(),
        strategy: ol.loadingstrategy.all
    }),
    style: styleFunction,
    // style: new ol.style.Style({
    //     stroke: new ol.style.Stroke({
    //         color: 'rgba(4, 26, 0, 1.0)',
    //         width: 1
    //     }),
    //     text: new ol.style.Text({
    //         text: "County"
    //     })
    // }),
    maxResolution: 2500
});

var getText = function (feature, resolution) {
    maxResolution = 600;
    if (resolution > maxResolution) {
      textDescription = '';
    } else {
      textDescription = feature.get('COUNTY');
    }
    return textDescription;
  }

  // style county WFS
function styleFunction(feature, resolution) {
    // lenght of the array determines how many parts are in the polyong
    // potentially i could use this in the geometry function 
    // might be able to use this in the getText function as well to only label the largest features
    console.log(feature.getGeometry().getInteriorPoints());
    console.log(feature.getGeometry().getType());
    console.log(feature.getGeometry().getPolygons().length);
    // get interior points needs research
    console.log('county: ' + feature.get('COUNTY') + ' length: ' + feature.H.geometry.c.length);
    var polyStyleConfig = {
      stroke: new ol.style.Stroke({ 
          color: 'rgba(10,10,10,1.0)', 
          width: 1 
        })
    }
    
    var textStyleConfig = {
        text: new ol.style.Text({
         font: '10px Calibir, sans-serif',
         text: getText(feature, resolution),
         textAlign: 'center',
         scale: '1.5',
         fill: new ol.style.Fill({
           color: 'rgba(0, 0, 0, 0.6)'
          }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 3
          })
        }),
        geometry: function(feature){
            var retPoint;
            if (feature.getGeometry().getPolygons().length > 1) {
                console.log('greater than 1');
                var maxPoly =  getMaxPoly(feature.getGeometry().getPolygons())
                
                retPoint = maxPoly.getInteriorPoints();
              } else if (feature.getGeometry().getPolygons().length === 1) {
                console.log('1');
                retPoint = feature.getGeometry().getInteriorPoints();
              }
              console.log(retPoint)
              return retPoint;
            }
      }
    var textStyle = new ol.style.Style(textStyleConfig);
    var polyStyle = new ol.style.Style(polyStyleConfig);
    return [polyStyle,textStyle];
  }

  function getMaxPoly(polys) {
    var polyObj = [];
    //now need to find which one is the greater and so label only this
    for (var b = 0; b < polys.length; b++) {
      polyObj.push({ poly: polys[b], area: polys[b].getArea() });
    }
    polyObj.sort(function (a, b) { return a.area - b.area });
    console.log(polys);
    console.log(polyObj);
    return polyObj[polyObj.length - 1].poly;
   }

// state WFS USGS
var wfsState = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://www.sciencebase.gov/catalogMaps/mapping/ows/4f4e4783e4b07f02db4837ce?service=WFS&request=GetFeature&version=1.0.0&typename=sb:US_States&outputFormat=application/json',
        format: new ol.format.GeoJSON(),
        strategy: ol.loadingstrategy.all
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(4, 26, 0, 1.0)',
            width: 3
        })
    })
});

var map = new ol.Map({
        layers: [basemap, wfsState, wfsCounty],
        target: document.getElementById('map'),
        view: new ol.View({
            center: ol.proj.transform([-87.5, 31], 'EPSG:4326', 'EPSG:3857'),
            zoom: 3
        }),
    });
