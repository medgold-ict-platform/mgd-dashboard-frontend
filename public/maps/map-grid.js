mapboxgl.accessToken = '*********************************************';
const medgold_center = [-8.167550, 39.621998];

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: medgold_center,
    zoom: 8
});

//Input data Feature Collection
var input_data_fc = [];
var coords = [];

medgold_input_data_sparse.forEach(e => {
    input_data_fc.push(turf.point([parseFloat(e.Longitude),parseFloat(e.Latitude)], {"ecv": e.Value}))
    coords.push([parseFloat(e.Longitude),parseFloat(e.Latitude)])
});

//Grid options
var cellSide = 5;

//Create borders based on points location
var line = turf.lineString(coords);
var bbox = turf.bbox(line);
var squareGrid = turf.squareGrid(bbox,cellSide);

// Create input data
// var input_data = turf.featureCollection(input_data_fc);

// Random data
var input_data = turf.randomPoint(50, {bbox: bbox})
turf.featureEach(input_data,function(f,fidx){
    f.properties.ecv = Math.random()*10;
})

// Aggregates all points in a cell and calulates their mean
var collected = turf.collect(squareGrid, input_data, "ecv", "ecv");
turf.propEach(collected, function(f,fidx){
    if(f.ecv.length != 0){  // There are points inside a cell...
        var ecv_sum = 0;    // ...calculate their mean
        f.ecv.forEach(function(ecv){
            ecv_sum += ecv;
        })
        f.ecv = ecv_sum/f.ecv.length; // ! Array to Float conversion
    }
    else
        f.ecv = 0; // ! Array to Float conversion
})

var colors = ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7'];
map.on('load', function() {
    map.addLayer({
        'id': 'ecv-grid',
        'type': 'fill',
        'source': {
          'type': 'geojson',
          'data': collected
        },
        'paint': {
            'fill-color': [
                "case", 
                ['<=', ['get', "ecv"], 3], "#fee8c8", 
                ['<=', ['get', "ecv"], 6], "#fdbb84",
                ['<=', ['get', "ecv"], 10], "#e34a33",
                '#fff'
            ],
            'fill-opacity': 0.30,
            'fill-outline-color': '#000'
        }
    });
    map.addLayer({
        'id': 'ecv-points',
        'type': 'circle',
        'source': {
          'type': 'geojson',
          'data': input_data
        },
        'paint': {
            'circle-color': [
                "case", 
                ['<=', ['get', "ecv"], 5], colors[0], 
                ['<=', ['get', "ecv"], 6], colors[1],
                ['<=', ['get', "ecv"], 7], colors[2],
                ['<=', ['get', "ecv"], 8], colors[3],
                colors[4]
            ],
            'circle-radius' : 5,
        }
    });
});
//Get coords and ecv value upon clicking on a point
map.on('click', 'ecv-points', function(e) {
    new mapboxgl.Popup()
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML('<b>ECV:</b> ' + e.features[0].properties.ecv)
      .addTo(map);
});