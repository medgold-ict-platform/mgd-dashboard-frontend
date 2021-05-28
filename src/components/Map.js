import React from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import api from '../api/client';
import '../mapbox-gl.css';
import '../mapButton.css';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import HelpIcon from '@material-ui/icons/Help';
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip'; 
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import Climchart from './Chart-Clim'
import Seaschart from './Chart-Seas'
import html2canvas from 'html2canvas';
import {withStyles} from '@material-ui/core/styles';

const useStyles = theme => ({    
    custom: {
        fontSize: 14
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '8ch',
    }
});


var AWS = require('aws-sdk/dist/aws-sdk-react-native');
mapboxgl.accessToken = '*****************';

class MyMap extends React.Component {
    mapRef = React.createRef();
    map;
    constructor(props) {
        super(props);
        this.state = {
            layer_id: '',
            input_data_fc: '',
            input_data_blob: null,
            layers_color_map_expression: '',
            map_color_legend: null,
            variable_type: this.props.var.toLowerCase(),
            loading_marker: null,
            popup: null,
            points: [],
            csv: "",
            // popup_closed: false,
            // Default styles have already many sources and layers, so we should
            // track sources/layers specifically created for MEG-GOLD data.
            medgold_sources : [], // [id,obj]
            medgold_layers : [], //[obj]
            top_left: props.top_left,
            bottom_right: props.bottom_right,
            zoom_level: 5.8,
            fly_zoom: props.fly_zoom,
            cellSide: 1,
            clicked: false,
            checked: false,
            zoom_center_lat: 0, //TODO: not only zoom at center, but also change map center var
            zoom_center_lon: 0,
        };
        //this.handleMaskClick = this.handleMaskClick.bind(this);
        // this.handleLatInputChange = this.handleLatInputChange.bind(this);
        // this.handleLonInputChange = this.handleLonInputChange.bind(this);
        // this.handleCoordSubmit = this.handleCoordSubmit.bind(this);
    }
    coordinatesGeocoder = function(query) {
        // match anything which looks like a decimal degrees coordinate pair
        var matches = query.match(
            /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
        );
        if (!matches) {
            return null;
        }
         
        function coordinateFeature(lng, lat) {
            return {
                center: [lng, lat],
                geometry: {
                type: 'Point',
                    coordinates: [lng, lat]
                },
                place_name: 'Lat: ' + lat + ' Lng: ' + lng,
                place_type: ['coordinate'],
                properties: {},
                type: 'Feature'
            };
        }
         
        var coord1 = Number(matches[1]);
        var coord2 = Number(matches[2]);
        var geocodes = [];
         
        // if (coord1 < -90 || coord1 > 90) {
        //     // must be lng, lat
        //     geocodes.push(coordinateFeature(coord1, coord2));
        // }
         
        // if (coord2 < -90 || coord2 > 90) {
        //     // must be lat, lng
        //     geocodes.push(coordinateFeature(coord2, coord1));
        // }
         
        // if (geocodes.length === 0) {
        //     // else could be either lng, lat or lat, lng
        //     geocodes.push(coordinateFeature(coord1, coord2));
        //     geocodes.push(coordinateFeature(coord2, coord1));
        // }
         
        geocodes.push(coordinateFeature(coord2, coord1)); //This way we accept only lat,lon. If we want both ways, uncomment above code
        return geocodes;
    };



    handleMaskClick(event) {
        let mask_states = [
            0.7,                                        // mask off: normal opacity of 0.7
            [ "case",["<=",["get","rpss"],0],0,0.7],    // mask on: opacity 0 for rpss <= 0
        ]
        if(event)
            this.setState({
                    checked: event
                },()=>{
                    this.map.setPaintProperty(this.state.layer_id + '-points', 'fill-opacity', mask_states[+ event]); // + true === 1 // + false ===  0
                }
            )
        else
            this.map.setPaintProperty(this.state.layer_id + '-points', 'fill-opacity', mask_states[+ event]); // + true === 1 // + false ===  0        
      }

    callbackFromParent = (lat, lng) => {
        this.props.callbackFromParent(lat, lng);
    }



    getColorPalette = (var_type) =>{
        const _palettes = {
            // original (possibly wrong, although TA is not used currently)
            TA :    ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'],
            // inverted
            // TA:     ['#053061','#2166ac','#4393c3','#92c5de','#d1e5f0','#f7f7f7','#fddbc7','#f4a582','#d6604d','#b2182b','#67001f'],
            AT :    ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'],
            AT_max: ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'],
            AT_avg: ['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704'],
            AT_min: ['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a','#ce1256','#980043','#67001f'],
            RA :    ['#543005','#8c510a','#bf812d','#dfc27d','#f6e8c3','#f5f5f5','#c7eae5','#80cdc1','#35978f','#01665e','#003c30'],
            AR :    ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'],
            R3 :    ['#669933','#ffcc33','#990033'],
            R5 :    ['#d7191c','#fdae61','#ffcc33','#a6d96a','#1a9641'],
            // R11 :   ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffcc33','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'], //normal
            R11 :   ['#006837','#1a9850','#66bd63','#a6d96a','#d9ef8b','#ffcc33','#fee08b','#fdae61','#f46d43','#d73027','#a50026'], //reversed
            R3_CB : ['#e9a3c9','#f7f7f7','#a1d76a'],
            R5_CB : ['#d01c8b','#f1b6da','#f7f7f7','#b8e186','#4dac26'],
            R11_CB :['#8e0152','#c51b7d','#de77ae','#f1b6da','#fde0ef','#f7f7f7','#e6f5d0','#b8e186','#7fbc41','#4d9221','#276419']
        }
        const _index_palettes = {
            sprr :                  "AR",
            gst :                   "AT",
            harvestr :              "AR",
            su35 :                  "AT",
            wsdi :                  "AT",
            sanitary_risk :         "R11",
            heat_risk :             "R11",
            precipitation_monthly : "AR",
            tmax_monthly :          "AT_max",
            taverage_monthly :      "AT_avg",
            tmin_monthly :          "AT_min",
            gdd:                    "AT",
            sprtx:                  "AT",
            su36 :                  "AT",
            su40 :                  "AT",
            spr32 :                 "AT",
            winrr :                 "AR",
        }
        if(this.props.tab.toLowerCase() === "seasonal forecast"){
            if(var_type === 'sanitary_risk'){ // needs more reversing
                var mypalette = Object.values(_palettes[_index_palettes[var_type]]).reverse()
                return [mypalette[1],mypalette[3],mypalette[7]].reverse()    
            }
            var mypalette =_palettes[_index_palettes[var_type]]
            return [mypalette[1],mypalette[3],mypalette[7]] //Lower/Medium/High Terciles only for seasonal forecast
        }else{
            return _palettes[_index_palettes[var_type]];
        }
    }
    getVariableUnits = () => {
        /****** INIZIO WORKAROUND ******/
        // console.log('\n\n\n\n\n\n\n\n')
        // console.log('getVariableUnits')
        // console.log('tab', this.props.tab) //projection
        // console.log('type', this.props.type) //ecvanom
        // console.log('variable', this.props.value) //precipitation_monthly
        // console.log('interval', this.props.timeline) //2031-2060 | 2071-2100
        // console.log('region', this.props.region) //DOURO
        // console.log('\n\n\n\n\n\n\n\n')

        let precipitation_monthly = 'mm';
        let harvestr = 'mm';
        let sprr = 'mm';
        let wsdi = 'days';
        let gdd = "\u00b0 C";
        let winrr = 'mm';

        //CHECK PER LONG TERM PROJECTION
        if(this.props.tab === 'Projection'){
            if(this.props.type === 'Ecvanom' && 
                this.props.value === 'Precipitation monthly' && 
                    ['2031-2060', '2071-2100'].includes(this.props.timeline) 
                    //    && this.props.region === 'Douro' 
            ) precipitation_monthly = '%'

            else if(this.props.type === 'Indexanom' && ['2031-2060', '2071-2100'].includes(this.props.timeline)){
                switch(this.props.value){
                    case 'HarvestR':
                        harvestr = '%';
                        break;
                    case 'SprR':
                        sprr = '%';
                        break;
                    case 'WSDI':
                        wsdi = '%';
                        break;
                    case 'GDD':
                        gdd = '%'
                        break;
                    case 'WINRR':
                        winrr = '%'
                        break;    
                    default:
                        break;
                }
            }
        }

        /****** FINE WORKAROUND ******/

        const units = {
            precipitation_monthly:  precipitation_monthly,
            taverage_monthly:       "\u00b0 C",
            tmax_monthly:           "\u00b0 C",
            tmin_monthly:           "\u00b0 C",
            gst:                    "\u00b0 C",
            gdd:                    gdd,
            harvestr:               harvestr,
            sprr:                   sprr,
            su35:                   "days",
            wsdi:                   wsdi,
            sanitary_risk:          "units",
            heat_risk:              "units",
            sprtx:                  "\u00b0 C",
            su36:                   "days",
            su40:                   "days",
            spr32:                  "days",
            winrr:                  winrr
        }
        return <p>{units[this.state.variable_type]}</p>
    }

    convertToCSV(arr) {
        var title = ['tab', 'type', 'variable', 'year', 'month']
        if(this.props.leadt !== '' && this.props.leadt !== undefined) title.push('starting date')
        if(this.props.rcp !== 0) title.push('RCP')
        var header = this.state.layer_id.split('-')
        var labels = ['period', 'lat', 'lon', 'value', 'rpss']
        const array = [title].concat([header]).concat([labels]).concat(arr)
        return array.map(it => {
            var newIt = []
            if(it.location != undefined){
            //    newIt.push(header[3]+'-'+header[4])
               newIt.push(it.location.split(',')[0])
               newIt.push(it.location.split(',')[1])
               newIt.push(it.value)
               newIt.push(it.rpss)
            }else{
                newIt = it
            }
            return Object.values(newIt).toString()
        }).join('\n')
    }

    exportGeoJSON = () => {
        //var url = window.URL.createObjectURL(this.state.input_data_blob)
        var csv  = 'data:text/plain;charset=utf-8,'+this.convertToCSV(this.state.points)
        var uri = encodeURI(csv)
        var a = document.createElement("a");
        a.href = uri;
        a.setAttribute("download", this.state.layer_id + ".csv");
        document.body.appendChild(a);
        a.click();
    }
    
    exportJPEG = () => {
        const _this = this;
        html2canvas(document.getElementById('map'),{ allowTaint: true , scrollX:0, scrollY: -window.scrollY }).then(function(canvas) {
            var url = canvas.toDataURL('image/jpeg',1.0)
            var a = document.createElement("a");
            a.href = url;
            a.setAttribute("download", _this.state.layer_id + ".jpg");
            a.click();
        });
    }
    exportNETCDF(){
        var type = this.props.type.toLowerCase()
        if(type === 'risk'){
            type = 'index'
        }
        api.getlink({
            "tab":this.props.tab.toLowerCase().replace(' ', '_'),
            "stype":type,
            "value": this.props.var.toLowerCase(),
            "year": this.props.timeline,
            "month": this.props.month,
            "leadt": this.props.leadt,
            "rcp": this.props.rcp
        })
        .then((response) => {
            var a = document.createElement("a");
            a.href = response.body['url'];
            a.setAttribute("download", "myfile.nc");
            a.click();
        })
        .catch(err => {
            console.error(err);
        });
    }
    createColorAvatar = (id,txt,color) => {
        let borderStyle;
        let borderWidth = "0";
        let borderColor;
        let units_width = 30;    //default

        if(!txt){   //color square
            if(id === 0)
                borderWidth = "0.5px 0.5px 0px 0.5px"
            else if(id === this.state.map_color_legend.length - 1)
                borderWidth = "0px 0.5px 0.5px 0.5px"
            else
                if(txt!==0)
                    borderWidth = "0px 0.5px 0px 0.5px"
        }
        else{       //units square
            if(this.state.variable_type === 'gdd' || this.state.variable_type === 'winrr')
                units_width *= 1.35
            else if(this.props.tab.toLowerCase() === "seasonal forecast")
                units_width *= 1.15
        }
        if(id === this.state.map_color_legend.length+1) { //units legend
            if(this.state.variable_type === 'sanitary_risk' || this.state.variable_type === 'heat_risk')
                txt = ''
            else {
                borderStyle = 'dashed';
                borderWidth = '0.5px 0.5px 0.5px 0.5px';
                borderColor = 'grey';
            }
        }
        else{
            borderStyle = 'solid';
            borderColor = 'black';
        }
       
        return(
            <Avatar
            key={id}
            variant="square"
            style={{
                height:20,
                width: units_width,
                backgroundColor: color,
                opacity: 0.7,
                borderStyle: borderStyle,
                borderWidth: borderWidth,
                borderColor: borderColor,
            }}>
            <span
            style={{
                fontSize: '10px',
                color: 'black',
                textAlign: 'center',
            }}>{txt}
            </span>
            </Avatar>
        );
    }

    createColorPaletteLegend = (txt_only) => {
        const flexContainer = {
            flexDirection: 'column', //'row' position:'relative', display: 'flex', float: 'left'
        };
        if(txt_only)
            var list_class_name = "legend_text " + this.props.tab.toLowerCase().replace(' ','_')
        else
            var list_class_name = "legend " + this.props.tab.toLowerCase().replace(' ','_')

        const _this = this;
        
        // if(this.props.tab.toLowerCase() === "seasonal forecast")
        let map_color_legend = this.state.map_color_legend.slice().reverse();
        // let map_color_legend = this.state.map_color_legend
        if(this.state.map_color_legend){
            var listItems = map_color_legend.map( (number,idx) =>{
                var txt;
                if(this.props.tab.toLowerCase() === "seasonal forecast")
                    txt = ["Below normal","Normal","Above normal"][number.max-1]
                else //climatology or projection
                    txt = number.max
                    // txt = number.min
                if(txt_only)
                    return _this.createColorAvatar(idx,txt,"white");
                return _this.createColorAvatar(idx,txt_only && txt,number.color); //200 IQ
            });
            //add min value only to !seasonal forecast tabs
            if(this.props.tab.toLowerCase() !== "seasonal forecast" && txt_only)
                listItems.push(_this.createColorAvatar(_this.state.map_color_legend.length,map_color_legend[_this.state.map_color_legend.length-1].min,"white"))
                // listItems.push(_this.createColorAvatar(_this.state.map_color_legend.length,map_color_legend[_this.state.map_color_legend.length-1].max,"white"))

            return (
                <div className="mapColorLegendContainer" style={{float:"left", width:"50%",padding: 0, paddingTop: '2px'}}>
                    <List className={list_class_name} style={{flexContainer}}>
                        {listItems}
                    </List>
                </div>
            );
        }
    }
    createColorPaletteLegendUnits = () => {
        const _this = this
        return (
            <div className="mapColorLegendContainer" style={{float:"left", padding: 0, width: "100%"}}>
                <List>
                    {_this.createColorAvatar(_this.state.map_color_legend.length+1,_this.getVariableUnits(),"white")}
                </List>
            </div>
        ); 
    }
    createSource = (id,obj) => {
        const _this = this;
        if(this.map.getSource(id) === undefined     //If it doesn't exist, create it
        && this.state.input_data_fc !== undefined)  //Add source only if API has provided us with data
            this.setState({
                medgold_sources: this.state.medgold_sources.concat( [[id,obj]] )
            },() => {
                _this.map.addSource(id,obj);
            })
    }
    removeSource = (id) => {
        const _this = this;
        if(this.map.getSource(id) !== undefined) //If it exists, delete it
            this.setState({
                medgold_sources: this.state.medgold_sources.filter(s => s[0] !== id) //sto mellon s.id
            },() => {
                _this.map.removeSource(id);
            })
    }
    createLayer = (layer) =>{
        const _this = this;
        if(this.map.getLayer(layer.id) === undefined
        && this.state.input_data_fc !== undefined)
            this.setState({
                medgold_layers: this.state.medgold_layers.concat( [layer] )
            },() => {
                _this.map.addLayer(layer);
            })
    }

    createLoadingLayer = () => {
        const _this = this;
        // Calculate bounding box center
        let bbox = [
            _this.map.getBounds()['_sw']['lng'],
            _this.map.getBounds()['_sw']['lat'],
            _this.map.getBounds()['_ne']['lng'],
            _this.map.getBounds()['_ne']['lat']
        ]
        let poly = turf.bboxPolygon(bbox)
        let centroid = turf.centroid(poly)

        // Create DOM element to use as a marker -pure JS
        var el = document.createElement('img');
        el.className = 'loading-marker';
        el.src = process.env.PUBLIC_URL + '/loading.svg';
        el.style.width = '200px';
        el.style.height = '200px'

        if(_this.state.loading_marker)
            //If there's an active spinner, move to new location
            _this.state.loading_marker.setLngLat(turf.getCoord(centroid))
        else{
            // Created a new one and delete it when this.loadData() is called
            let loading_marker = new mapboxgl.Marker(el)
                .setLngLat(turf.getCoord(centroid))
                .addTo(_this.map)
            this.setState({loading_marker: loading_marker})
        }
    }
    removeLayer = (id) => {
        const _this = this;
        if(this.map.getLayer(id) !== undefined)
            this.setState({
                medgold_layers: this.state.medgold_layers.filter(l => l.id !== id)
            },() => {
                _this.map.removeLayer(id);
            })
    }
    isEmpty = (obj) => {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    addPopup(e, info,popup){
        if(!this.isEmpty(e.features[0].properties)){
            const _this = this;
            let p = {
                location: e.features[0].properties.location,
                value: e.features[0].properties.value
            }
            let info_txt = "<table class='cell-info'>"
            info_txt += `<tr><th>Val</th><td>${p.value.toFixed(2)}</td></tr>`;
            info_txt += `<tr><th>Lat</th><td>${parseFloat(p.location.split(",")[0]).toFixed(2)}</td></tr>`;
            info_txt += `<tr><th>Lon</th><td>${parseFloat(p.location.split(",")[1]).toFixed(2)}</td></tr>`;
            info_txt += `<br><table><tr>`+info+`</tr></table>`;
            // var popup = new mapboxgl.Popup({
            //     // closeOnMove: true   //popup will close when map moves.
            // })
            popup
            .setLngLat([p.location.split(",")[1], p.location.split(",")[0]])
            .setHTML(info_txt)
            .addTo(this.map)
            // this.setState({popup: popup})
        } 
    }

    loadData = (type) => {
        var type = this.props.type.toLowerCase().replace(' ', '_')
        if(type ==='risk'){
            type = 'index'
        }
        api.MatchAll({
            "tab":this.props.tab.toLowerCase().replace(' ', '_'),
            "stype":type,
            "value": this.props.var.toLowerCase().replace(' ', '_'),
            "year": this.props.timeline,
            "month": this.props.month,
            "leadt":this.props.leadt,
            "top_left": this.state.top_left,
            "bottom_right":this.state.bottom_right,
            "rcp": this.props.rcp,
            "region": this.props.region
        })
        .then((response) => {
            const _this = this;

            // Delete loading spinner
            let loading_marker = this.state.loading_marker
            this.setState({loading_marker: null}, ()=>{if(loading_marker)loading_marker.remove()})
            this.setState({points: response.body})
            // Proceed only if we have data to manipulate
            if(response.body.length == 0) return

            console.log(`Received ${JSON.stringify(response.body.length)} points`);
            let max = -9999; let min = 9999;
            console.log(response.body)
            let raw_input_data =
            response.body
            .filter((e) => { // Remove -1 values for: Precipitation monthly, Sprr, HarvestR for Climatology & Projection tabs
                let has_normal_value = !(
                    this.props.tab.toLowerCase() !== "seasonal forecast" && 
                    (
                        (
                            (
                                this.props.var.toLowerCase() === 'precipitation_monthly' ||
                                this.props.var.toLowerCase() === 'sprr' ||
                                this.props.var.toLowerCase() === 'harvestr'
                            ) 
                            && this.state.region == 'Douro'
                        ) 
                        || this.props.var.toLowerCase() === 'sanitary_risk'
                        || this.props.var.toLowerCase() === 'winrr'
                    ) 
                    && e.value === -1
                )
                if(has_normal_value){
                    if(e.value !== -1){
                        if(e.value < min) min = e.value;
                        if(e.value > max) max = e.value;}
                }
                return has_normal_value
            })
            .map((e) => {
                if(_this.props.tab === "era5" &&( 
                    _this.props.var === "Tmax_monthly"||
                    _this.props.var === "Tmin_monthly" ||
                    _this.props.var === "Taverage_monthly"||
                    _this.props.var === "GST"||
                    _this.props.var === "Sprtx")){
                        let p = turf.point(
                        [
                            parseFloat(e.location.split(",")[1]),
                            parseFloat(e.location.split(",")[0])
                        ], 
                        {
                            "type":             e.type,
                            "value":            e.value-273.15,
                            "value_normalized": ((e.value - min)/(max - min)).toFixed(2),   // Apply min-max normlization
                            "location":         e.location,
                            "rpss":             e.rpss  //seasonal forecast only
                        }
                    )
                    return p
                }
                else{
                    let p = turf.point(
                        [
                            parseFloat(e.location.split(",")[1]),
                            parseFloat(e.location.split(",")[0])
                        ], 
                        {
                            "type":             e.type,
                            "value":            e.value,
                            "value_normalized": ((e.value - min)/(max - min)).toFixed(2),   // Apply min-max normlization
                            "location":         e.location,
                            "rpss":             e.rpss  //seasonal forecast only
                        }
                    )
                    return p
                }   
            })
            // Create a FeatureCollection of the received data
            let input_data_fc = turf.featureCollection(raw_input_data);
            this.setState({input_data_fc:input_data_fc});
            // Choose palette based on variable type
            var color_palette
            _this.setState({
                variable_type:_this.props.var.toLowerCase()
            },function (){
                color_palette = _this.getColorPalette(_this.state.variable_type);
            });
            // Calculate coloring cascades
            // Seasonal Forecast has fixed set of values
            if(this.props.tab.toLowerCase() === "seasonal forecast"){
                var layers_color_map_expression = [
                    "case",
                    ["==",["get","value"],1],color_palette[0],  // 1(0-33%)
                    ["==",["get","value"],2],color_palette[1],  // 2(34-67%)
                    ["==",["get","value"],3],color_palette[2],  // 3(68-100%)
                    "rgba(0, 0, 0, 0)"                          //-1: not shown
                ]
                
                var map_color_legend = [
                    { min:9999, max:1, color:color_palette[0] },    //to min einai axristo (sto mellon delete)
                    { min:9999, max:2, color:color_palette[1] },
                    { min:9999, max:3, color:color_palette[2] },
                ];
            }
            else {  // Climatology or Projection have varying scales
                let step = (max-min)/color_palette.length;
                var normalized_step = (1.0/color_palette.length).toFixed(2);
                //var layers_color_map_expression = ["case"];
                var layers_color_map_expression = ["case", ["==",["get","value"],-1],"rgba(0, 0, 0, 0)"];
                var map_color_legend = [];
                if(_this.props.tab === "era5" &&( 
                    _this.props.var === "Tmax_monthly"||
                    _this.props.var === "Tmin_monthly" ||
                    _this.props.var === "Taverage_monthly"||
                    _this.props.var === "GST"||
                    _this.props.var === "Sprtx")){
                        min = (min-273.15)
                        max = (max-273.15)
                    }
                color_palette.forEach(function(e,idx){
                    layers_color_map_expression.push(
                        ['<=', ['get', "value_normalized"], ((idx+1)*normalized_step).toFixed(2)], color_palette[idx]
                    )
                    if(_this.props.tab.toLowerCase() === "climatology" || _this.props.tab.toLowerCase() === "projection"){
                        if(_this.props.value === "WSDI" || _this.props.value === "SU35"){
                            map_color_legend.push({
                                min:    parseInt(Math.trunc((min + idx*step))),
                                max:    Math.trunc((min + (idx+1)*step)),
                                color:  color_palette[idx]
                            })
                        }
                        else{
                            map_color_legend.push({
                                min:    (min + idx*step).toFixed(2),
                                max:    (min + (idx+1)*step).toFixed(2),
                                color:  color_palette[idx]
                                })
                        }
                    }
                    else{
                        map_color_legend.push({
                            min:    (min + idx*step).toFixed(2),
                            max:    (min + (idx+1)*step).toFixed(2),
                            color:  color_palette[idx]
                        })
                    }
                });
                layers_color_map_expression.push(color_palette[color_palette.length-1]);
            }
            
            this.setState({
                layers_color_map_expression:layers_color_map_expression,
                map_color_legend: map_color_legend
            });

            let layer_id =  _this.props.tab.toLowerCase() + '-' +
                            _this.props.type.toLowerCase() + '-' +
                            _this.props.var.toLowerCase() + '-' +
                            _this.props.timeline.toString().replace('-', ' ') + '-' +
                            _this.props.month;
            
           if(_this.props.leadt !== '' && _this.props.leadt !== undefined) layer_id = layer_id + '-' + _this.props.leadt 
           if(_this.props.rcp !== 0) layer_id = layer_id + '-' +_this.props.rcp

            let new_layer = !(layer_id === _this.state.layer_id)
            _this.setState({layer_id:layer_id});

            // Zoom to newly acquired data
            _this.map.flyTo({
                center: turf.getCoord(turf.center(input_data_fc)),
                zoom: this.state.fly_zoom
            },{
                flyTo_called: true
            });
            // Visualize data
            var line = turf.lineString(turf.coordAll(_this.state.input_data_fc));
            var bbox = turf.bbox(line);
            // Tessellate a grid of points to grid of polygons
            // NB: a Voronoi tessellation created over a regular grid
            // of points will result in a regular grid of polygons.
            var squareGrid = turf.voronoi(_this.state.input_data_fc, {bbox: bbox});
            let point_properties = Object.keys(_this.state.input_data_fc.features[0].properties);
            point_properties.forEach(p => {
                squareGrid = turf.collect(squareGrid, _this.state.input_data_fc, p, p);
            })

            turf.propEach(squareGrid, function(f,fidx){
                point_properties.forEach(function(p) {
                     //turf.collect returns properties in array
                    if(f[p].length === 0)
                        f[p] = squareGrid.features[fidx-1].properties[p] //prev
                    else
                        f[p] = f[p][0]
                })
            })

            // Create Source + Layer
            var source_id = _this.state.layer_id + '-points-data';
            var source_obj = {
                type: 'geojson',
                data: squareGrid,
                generateId:true
            }
            this.createSource(source_id,source_obj);
            var layer_obj = {
                id: _this.state.layer_id + '-points',
                type: 'fill',
                source: source_id,
                paint: {
                    'fill-color': _this.state.layers_color_map_expression,
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.9,
                        0.7
                    ],
                    'fill-antialias': false //removes grid cell borders
                }
            }
            this.createLayer(layer_obj);
            // Download a blob containing current FeatureCollection
            this.setState({
                input_data_blob: new Blob([JSON.stringify(input_data_fc)], {type: "application/json"}),
            })

            if(this.props.tab.toLowerCase() === "seasonal forecast")  // Apply state of Mask button
                this.handleMaskClick(null)

            // Add interactivity on map, only when layer_id switches; not on zoom in/out & drag that is
            if(new_layer){
                this.map.on('click', layer_id + '-points', function(e) {
                    if(!_this.isEmpty(e.features[0].properties)){
                        _this.map.setPaintProperty( _this.state.layer_id + '-points', 'fill-outline-color',
                        [
                            'case',
                                ['boolean',['feature-state', 'hover'], false],
                            '#000000',
                            _this.state.layers_color_map_expression
                        ])
                        var info = 'Close popup to<br>enable interactive<br>mode'
                        if(_this.state.popup) _this.state.popup.remove()
                        let popup = new mapboxgl.Popup()
                        _this.setState({
                            popup: popup,
                            clicked: true
                        },
                        _this.addPopup(e, info, popup))
                        // _this.setState({clicked: true})
                        if(_this.props.tab !== 'Projection') _this.callbackFromParent(e.features[0].properties.location.split(",")[1], e.features[0].properties.location.split(",")[0])
                    }
                });
                var hoveredStateId = null;
                this.map.on('mousemove', layer_id+ '-points', function(e) {
                    if(_this.state.popup !== null){
                        if(!_this.state.popup.isOpen()){
                            _this.setState({clicked: false})
                            _this.map.setPaintProperty( _this.state.layer_id + '-points', 'fill-outline-color', _this.state.layers_color_map_expression)
                            if(_this.props.tab !== 'Projection') _this.callbackFromParent("", "")
                        }
                    }
                    if(!_this.state.clicked){
                        if (e.features.length > 0) {
                            if(e.features[0].properties.location !== hoveredStateId){
                                if(_this.state.popup !== null) _this.state.popup.remove();
                                if (hoveredStateId) {
                                    _this.map.setFeatureState({ source: source_id, id: hoveredStateId },{ hover: false });
                                }
                                hoveredStateId = e.features[0].id;
                                _this.map.setFeatureState(
                                    {source: source_id, id: hoveredStateId },
                                    { hover: true}
                                );
                                var info = 'Click here to<br>open chart'
                                // if(_this.state.popup) _this.state.popup.remove()
                                let popup = new mapboxgl.Popup()
                                _this.setState({
                                    popup: popup,
                                },
                                _this.addPopup(e, info, popup))

                                if(_this.props.tab !== 'Projection') _this.callbackFromParent("", "")
                            }
                        }
                    }
                });
                this.map.on("mouseleave", "earthquakes-viz", function() {
                    if (hoveredStateId) {
                        this.map.setFeatureState({
                            source: source_id,
                            id: hoveredStateId
                        }, {
                            hover: false
                        });
                    }
                    if(_this.props.tab !== 'Projection') _this.callbackFromParent("", "")
                });
            }
        })
        .catch(err => { 
            // Front-end makes incomplete HTTP calls before all required vars are filled
            // to those requests, the back-end replies with a 400. However loading spinners
            // are created for those requests and need to be cleared.
            // Delete loading spinner
            let loading_marker = this.state.loading_marker
            this.setState({loading_marker: null}, ()=>{if(loading_marker)loading_marker.remove()})
            console.error(err);
        });
    }
    

    componentDidMount() {
        const _this = this;
        if(this.props.tab == 'Seasonal Forecast'){
            var minzoom = 3
            var maxzoom = 9
        }
        else{
            var minzoom = 6
            var maxzoom = 14
        }
        this.map = new mapboxgl.Map({
            container: this.mapRef.current,
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [-8.167550, 39.621998],
            zoom: this.state.zoom_level,
            scrollZoom: false,
            doubleClickZoom: false,
            logoPosition: 'bottom-left',
            preserveDrawingBuffer: true, //the map's canvas can be exported to a PNG, this decreases performance
            minZoom: minzoom,  //after this zoom lvl, the grid cannot be shown due to tiny grid cells
            maxZoom: maxzoom
        });
        this.map.addControl(new mapboxgl.FullscreenControl());
        this.map.addControl(
            new mapboxgl.NavigationControl({
                showCompass: false
            }),'top-right')

        let geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            localGeocoder: _this.coordinatesGeocoder,
            zoom: _this.state.fly_zoom,
            placeholder: 'Search by: Lat,Lng',   //we accept only lat,lon (e.g 41.2,-8)
            mapboxgl: mapboxgl,
            limit: 1,   //Maximum number of results to show.
            marker: false,
            reverseGeocode: true //In reverse geocoding, search input is expected to be coordinates in the form lat, lon, with suggestions being the reverse geocodes.
        })
        geocoder.on('loading',()=>{
            geocoder.setZoom(_this.map.getZoom())
        })
        this.setState({geocoder : geocoder},() => {_this.map.addControl(geocoder,'top-left')} )

        this.map.on('zoomend', (e) => {
            if(!e.flyTo_called){ // fetch new data only when user clicks on zoom in/out
                console.log('zoom',_this.map.getZoom())
                var bounding_box = _this.map.getBounds()
                _this.setState({fly_zoom: _this.map.getZoom()})
                _this.setState({top_left:bounding_box['_ne']['lat']+','+bounding_box['_sw']['lng'], 
                bottom_right:bounding_box['_sw']['lat']+','+bounding_box['_ne']['lng']})
    
                //0. delete any existing sources/layers
                _this.removeLayer(_this.state.layer_id + '-points');
                _this.removeSource(_this.state.layer_id + '-points-data');
                _this.createLoadingLayer();
                _this.loadData();
            }
        })

        this.setState({cellSide: this.props.cellSide})
        this.map.on('dragend', function(e) {
            var bounding_box = _this.map.getBounds()
            _this.setState({top_left:bounding_box['_ne']['lat']+','+bounding_box['_sw']['lng'], 
            bottom_right:bounding_box['_sw']['lat']+','+bounding_box['_ne']['lng']})
            
            //0. delete any existing sources/layers
            _this.removeLayer(_this.state.layer_id + '-points');
            _this.removeSource(_this.state.layer_id + '-points-data');
            
            _this.createLoadingLayer();
            _this.loadData();
        });
        
        this.map.on('dragstart', () => {
            let popup = _this.state.popup
            _this.setState({
                medgold_layers: [],
                medgold_sources: [],
                input_data_fc: '',
                input_data_blob: null,
                map_color_legend: null,
                // popup: null,
            },()=>{
                // if(popup)popup.remove()
                // _this.setState({clicked: false})
            })
        })

        this.map.on('zoomstart', (e) => {
            if(!e.flyTo_called){
                let popup = _this.state.popup
                _this.setState({
                    medgold_layers: [],
                    medgold_sources: [],
                    input_data_fc: '',
                    input_data_blob: null,
                    map_color_legend: null,
                    // popup: null,
                },()=>{
                    // if(popup)popup.remove()
                })
            }
         })
         this.loadData();
    }

    componentDidUpdate(prevprops) {
        if(this.props.filtered !== prevprops.filtered){
            this.handleMaskClick(this.props.filtered)
        }
        if(this.props.showed !== prevprops.showed){
            this.map.resize();
        }
        if(     this.props.tab      !== prevprops.tab
            ||  this.props.type     !== prevprops.type
            ||  this.props.var      !== prevprops.var
            ||  this.props.timeline !== prevprops.timeline
            ||  this.props.month    !== prevprops.month
            ||  this.props.leadt    !== prevprops.leadt
            ||  this.props.rcp      !== prevprops.rcp
            || this.props.region !== prevprops.region){
            if( (this.props.tab         !== ''
                &&  this.props.type     !== ''
                &&  this.props.var      !== ''
                &&  this.props.timeline !== 0
                &&  this.props.rcp      !== undefined
                &&  this.props.leadt    !== '')){
            // || this.props.type     !== prevprops.type){ // we need a map reset when type changes, regardless of rest vars
                const _this = this;
                const medgold_layers = this.state.medgold_layers;
                const medgold_sources = this.state.medgold_sources;
                let popup = this.state.popup
                // if(popup){
                //     popup.on('close', function(e) {
                //     _this.setState({popup_closed: true})
                //     });
                // }
                if(_this.props.tab !== 'Projection') _this.callbackFromParent("", "")
                // Clear state, then remove layers and sources
                this.setState({
                    medgold_layers: [],
                    medgold_sources: [],
                    input_data_fc: '',
                    input_data_blob: null,
                    map_color_legend: null,
                    cellSide: this.props.cellSide,
                    popup: null
                },function(){
                        medgold_layers.forEach((l)=>{
                        if(_this.map.getLayer(l.id) !== undefined)
                            _this.map.removeLayer(l.id);
                        })
                        medgold_sources.forEach((s)=>{
                        if(_this.map.getSource(s[0]) !== undefined)
                            _this.map.removeSource(s[0]);
                        })
                        console.log('checking')
                        if(popup){popup.remove();console.log("Found existing popup")}
                        this.setState({clicked: false})
                        this.createLoadingLayer();
                        this.loadData();
                    })  
            }
        }
    }


    // createMapTitle = () => {
    //     const { classes } = this.props;
    //     const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //     let date = this.props.timeline
    //     if(this.props.monthly)
    //         date = `${date} ${months[this.props.month-1]}`
    //     return(
    //         <div style={{marginTop:10}}>
    //             { this.props.description &&
    //                 <Tooltip classes={{ tooltip: classes.custom }} style={{margin:'0 0 0 0', padding:0, display: 'inline-block', verticalAlign: 'top'}} title={this.props.description}>
    //                     <IconButton  aria-label="Help">
    //                         <HelpIcon color={'secondary'}/>
    //                     </IconButton>
    //                 </Tooltip>  
    //             }
    //         </div>
    //     )
    // }

    
  render() {
    let tab = this.props.tab
    if(this.props.tab.toLowerCase() === 'era5')
        tab = 'climatology'
    let data_source = tab.charAt(0).toUpperCase() + tab.slice(1)    //capitalize
    let index = this.props.var.replace("_"," ")    
    var date = this.props.timeline
    const month = this.props.month
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const {classes} = this.props
    return (
        <div style={{marginTop:0, height:'100%', margin:0, position:'relative'}}>
            <div id='map' ref={this.mapRef} style={{width:'100%'}}>
                {this.state.input_data_blob && 
                    <Tooltip placement='bottom' classes={{ tooltip: classes.custom }} title={this.props.description !== undefined ? this.props.description : ''} arrow>
                        <p className='map-overlay' id='features' >
                            {this.props.monthly ? `${data_source} - ${index} - ${date} - ${months[parseInt(month)-1]}` : `${data_source} - ${index} - ${date}`}
                        </p>
                    </Tooltip>
                }
                {this.state.input_data_blob &&
                <div className="map-overlay-legend" id='legend'>
                    {this.state.input_data_blob && 
                    this.createColorPaletteLegend(false)}
                    {this.state.input_data_blob && 
                        this.createColorPaletteLegend(true)}
                    {this.state.input_data_blob && 
                        this.createColorPaletteLegendUnits()}
                </div>} 
                {this.props.tab && this.props.type && this.props.value && this.props.latitude && this.props.longitude && !this.props.average && this.state.popup && this.state.popup.isOpen() &&    
                <div className='map-overlay-chart' >
                    <Tooltip title="Close">
                        <IconButton 
                            style={{float: 'right', marginRight: this.props.tab === 'climatology' ||  this.props.tab === 'era5' ? 12 : '1%'}} 
                            aria-label="Close" onClick={() => this.setState({popup: null})}
                        > 
                            <Close/>
                        </IconButton> 
                    </Tooltip>
                    {this.props.tab === 'climatology' ||  this.props.tab === 'era5'? 
                        <Climchart
                            id="chart"
                            tab={this.props.tab}
                            type={this.props.type} 
                            value={this.props.value}
                            sliderMin={this.props.sliderMin}
                            sliderMax={this.props.sliderMax}
                            latitude={this.props.latitude}
                            longitude={this.props.longitude}
                            location={this.props.location}
                            month={this.props.month}
                            monthString={months[this.props.month-1]}
                            monthly={this.props.monthly}
                            style={{width:'auto', height:'auto', clear: 'both'}}
                        /> :
                        <Seaschart
                            id="chart"
                            tab={this.props.tab}
                            type={this.props.type} 
                            value={this.props.value}
                            sliderMin={this.props.sliderMin}
                            sliderMax={this.props.sliderMax}
                            latitude={this.props.latitude}
                            longitude={this.props.longitude}
                            location={this.props.location}
                            month={this.props.month}
                            monthString={months[this.props.month-1]}
                            leadt={this.props.leadt}
                            leadtValue = {this.props.leadtValue}
                            percentile_id={this.props.percentile_id}
                            monthly={this.props.monthly}
                            style={{width:'auto', height:'auto', clear: 'both'}}
                        />
                    }
                </div>}
            </div>
        </div>    
    )
  }
}

export default withStyles(useStyles)(MyMap);