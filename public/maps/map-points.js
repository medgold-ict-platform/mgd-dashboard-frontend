mapboxgl.accessToken = '*********************';
const medgold_center = [-8.167550, 39.621998];

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: medgold_center,
    zoom: 7
});
//Input data Feature Collection
var input_data_fc = [];
var coords = [];

// Resp contains response from API
// var min = 9999;
// var max = -9999;

medgold_input_data_dense.forEach(e => {
    // if(e.value < min)
    //     min = e.value;
    // if(e.value > max)
    //     max = e.value;
    input_data_fc.push(turf.point([parseFloat(e.longitude),parseFloat(e.latitude)], {"ecv": e.value}))
    coords.push([parseFloat(e.longitude),parseFloat(e.latitude)])
});
//Grid options
var cellSide = 5;

//Create borders based on the points
var line = turf.lineString(coords);
var bbox = turf.bbox(line);
var squareGrid = turf.squareGrid(bbox,cellSide );

//Create input data
var input_data = turf.featureCollection(input_data_fc);
var colors = ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7'];

map.on('load', function() {
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
            'circle-radius' : 12,
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