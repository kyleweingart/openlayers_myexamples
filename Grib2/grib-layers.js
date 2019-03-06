
var map = new ol.Map({
    view: new ol.View({
        zoom: 4,
        center: [-10527519, 3160212]
    }),
    target: 'js-map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ]
});

var createWPLayer = (strength) => {
    var url = '//hvx-mapserver.hurrevac.com/geoserver/wfs?service=WFS&' + 
    'version=2.0.0&request=GetFeature&typename=nhp:windprobs_view&outputFormat=application/json'
    + '&srsname=EPSG:3857&viewparams=date:1539075600;fcstHr:120;spd:' + strength;
    map.removeLayer(geologyLayer);
    console.log(url);
}

var geologyLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/wms',
        params: {
            LAYERS: 'BGS_EN_Bedrock_and_Superficial_Geology'
        },
        attributions: [
            new ol.Attribution({
                html: 'Contains <a href="http://bgs.ac.uk/">British Geological Survey</a> ' +
                      'materials &copy; NERC 2015'
            })
        ]
    }),
    opacity: 0.85
});

map.addLayer(geologyLayer);

var radios = document.forms["windprobsForm"].elements["windprobs"];
for(var i = 0; i < radios.length; i++) {
    radios[i].onclick = function() {
        // map.removeLayer(geologyLayer);
        var strength = this.value;
        createWPLayer(strength);
    }
}
