/**
 * Chapter 2
 * Creating an image layer
 *
 * Peter J Langley
 * http://www.codechewing.com
 */
// var extent = [-93941, 6650480, 64589, 6766970];

var map = new ol.Map({
    view: new ol.View({
        zoom: 5,
        center: ol.proj.transform([179, 21], 'EPSG:4326', 'EPSG:3857')
    }),
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM({
            })
        })
    ]
});

map.addLayer(new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: 'http://localhost:8080/geoserver/nhp/wms',
        params: {
            'LAYERS': 'nhp:geotiff_data',
            'VERSION': '1.1.1',
            'FORMAT': 'image/gif'
        },
        projection: 'EPSG:3857',
       
        // attributions: [
        //     new ol.Attribution({
        //         html: 'Contains <a href="http://bgs.ac.uk">British Geological Survey</a> ' +
        //               'materials &copy; NERC 2015'
        //     })
        // ]
    }),
    // extent: extent
    // opacity: .5
}));