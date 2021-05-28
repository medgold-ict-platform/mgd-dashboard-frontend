import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { RadioGroup, FormControlLabel, Radio , Grid} from '@material-ui/core';
// import { Paper, Select } from '@material-ui/core';
import CustomizedSelects from './Select'
import api from '../api/client';
import MyMap from './Map'
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip'; 
import TypeSelection from './TypeSelection'
import CustomSwitch from './Switch'
import Divider from '@material-ui/core/Divider';
import Picker from './Picker'
import Typography from './Typography';
import SimpleMenu from './SimpleMenu';


const months = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12}
// const values =  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const styles = theme => ({
    custom: {
       fontSize: 16
    }
});

class Seasonal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selected: "Seasonal Forecast",
            inputs: {
                Ecv: {
                    disabled: false,
                    monthly: false,
                    values: [],
                    value: 'Tmax monthly',
                    label:'',
                    sm:0,
                    em:0,
                    em_ed_leadt:[],
                    leadtime:[],
                    starting_date:[],
                    svalues:[],
                    slabel: 'Starting Date',
                    svalue: 'Apr',
                    percentile_id:""
                },
                Index: {
                    disabled: false,
                    monthly: false,
                    values: [],
                    value: 'GST',
                    label:'',
                    starting_date:[],
                    svalues:[],
                    timeline: [],
                    percentile_id:"",
                    slabel: 'Starting Date',
                    svalue: 'Mar'
                },
                Risk: {
                    disabled: false,
                    monthly: false,
                    values: [],
                    value: 'Sanitary Risk',
                    label:'',
                    starting_date:[],
                    svalues:[],
                    timeline:[],
                    percentile_id:"",
                    slabel: 'Starting Date',
                    svalue: 'Mar'
                },
                QMarks: {
                    description: [],
                    monthly: false,
                    values: []
                }
            },
            timeline: 2016,
            month: 6,
            sliderMin: 1951,
            sliderMax: 2018,
            default_monthly: false,
            defaultSliderMin: 1951,
            defaultSliderMax: 2018,
            variable: 'Tmax_monthly',
            type_selected: 'Ecv',
            default_type: 'Ecv',
            clicked: false,
            mounted: false,
            location: "",
            expanded: true,
            leadt:3,
            prec: false,
            sub: false,
            month_min:3,
            month_max:11,
            updated: false,
            start_selected: false,
            showed: this.props.showed,
            caseStudy: '',
            activeChip: 'Climate',
            filtered: false
        }
    }

    componentDidUpdate = (prevProps) => {
        if(prevProps.showed !== this.props.showed){
            this.setState({showed: this.props.showed})
        }
    }

    componentDidMount() {
        api.info(this.state.selected.replace(' ', '-'))
        .then((response) => {
            var { inputs, default_type } = this.state;
            var { start_date: sliderMin, end_date: sliderMax} = response.body[0][default_type].Timeline.default;
            sliderMin = parseInt(sliderMin)
            sliderMax = parseInt(sliderMax)
            Object.keys(inputs).map(e => {
                inputs[e].monthly = response.body[0][e].Monthly;
                inputs[e].timeline = response.body[0][e].Timeline
                inputs[e].values = response.body[0][e].Name
                inputs[e].label = response.body[0][e].label
                inputs[e].sm = response.body[0][default_type].Timeline.default.start_month
                inputs[e].em = response.body[0][default_type].Timeline.default.end_month
                // inputs[e].em_ed_leadt = response.body[0][default_type].Timeline.default.em_ed_leadt
                inputs[e].starting_date = response.body[0][e].Starting_date
                inputs[e].svalues = response.body[0][e].Starting_date
                inputs[e].description = response.body[0][e].Description
                inputs[e].leadtime = response.body[0][e].leadtime
                inputs[e].steps = response.body[0][e].Steps
                inputs[e].percentile_id = response.body[0][e].Percentile_id
                return inputs[e];
            });
            console.log(inputs)
            this.setState({inputs, sliderMin, sliderMax});
        })
        .catch(err => {
            console.error(err);
        });
    }

    onSelectStartChange = (event, id) => {
        const {type_selected, inputs, variable, sliderMax} = this.state
        var { timeline, sub, prec,leadt, month} = this.state
        if(type_selected === 'Ecv'){
            inputs[type_selected].svalue = event.target.value
            var index = parseInt(inputs[type_selected].svalues.indexOf(event.target.value))
            var key = Object.keys(months)[Object.values(months).indexOf(month)];
            leadt = parseInt(inputs[type_selected].timeline.leadt[key][index])
        }else{
            // this.setState({
            //     sliderMin: parseInt(inputs[type_selected].timeline[variable.replace('_',' ')][leadt].start_date),
            //     sliderMax: parseInt(inputs[type_selected].timeline[variable.replace('_',' ')][leadt].end_date),
            // })
            // timeline = parseInt(inputs[type_selected].timeline[variable.replace('_',' ')][leadt].end_date)
            leadt = months[event.target.value]
            inputs[type_selected].svalue = event.target.value
        }
        this.setState({leadt:leadt, inputs, start_selected:true, timeline:timeline, sub:sub, prec:prec, filtered: false, checked:false})
    }

    onSelectChange = (event, id) => {
        var { inputs} = this.state;
        inputs[id].value = event.target.value;
        if(this.state.clicked){
            this.setState({clicked: !this.state.clicked})
        }
        if(id != 'Ecv'){
            var starting_date = []
            inputs[id].starting_date.forEach(el => {
                if(inputs[id].timeline[event.target.value][el] !== undefined){
                    starting_date.push(el)
                }else{
                    inputs[id].svalue = starting_date[0]
                } 
            })
            inputs[id].svalues = starting_date
        }
        this.setState({inputs,leadt: months[inputs[id].svalue], variable: event.target.value.replace(' ', '_'), filtered: false, checked:false})
    }

    range(start, end){ return [...Array(1+end-start).keys()].map(v => start+v)}

    onRadioChange = (event, type = null, el) => {
        var {inputs} = this.state;
        if(type){
            inputs[type].value = el;
        }else{
            var type_selected = el;
            this.setState({type_selected, inputs});
        }
        var svalue = inputs[type_selected].svalue
        var variable = inputs[el].value
        inputs[type_selected].value = variable.replace('_', '')
        console.log(parseInt(inputs[this.state.type_selected].end_month))
        this.setState({
            inputs, activeChip:inputs[el].label, 
            sliderMin: el === 'Risk' ? parseInt(inputs[type_selected].timeline[variable.replace('_', ' ')][svalue].start_date) : parseInt(inputs[type_selected].timeline.default.start_date), 
            sliderMax: el === 'Risk' ? parseInt(inputs[type_selected].timeline[variable.replace('_', ' ')][svalue].end_date) : parseInt(inputs[type_selected].timeline.default.end_date), 
            variable: variable,
            leadt: months[svalue],
            month_max: parseInt(inputs[this.state.type_selected].em),
            month_min: parseInt(inputs[this.state.type_selected].sm),
            filtered: false,
            checked:false
        });
    }

    myCallback = (longitude, latitude) => {
        if(!this.state.clicked){
            this.setState({clicked: !this.state.clicked})
        }
        if(this.state.location !== latitude+','+longitude){
            this.setState({location:latitude+','+longitude, latitude, longitude, expanded:false})
        }
    }

    onChangeSlider =(event, value) =>{
        var { inputs, type_selected, month} = this.state  
        this.setState({timeline: value, inputs, checked:false, filtered:false});
        if(this.state.clicked){
            this.setState({clicked: !this.state.clicked})
        }
    }

    onChangeMonthSlider =(event, value, year) =>{
        var { inputs, type_selected, leadt, timeline} = this.state
        timeline = year !== undefined ? year : timeline
        var svalues = []
        var key = Object.keys(months)[Object.values(months).indexOf(value)];
        if(this.state.clicked){
            this.setState({clicked: !this.state.clicked})
        }
        inputs[type_selected].timeline.leadt[key].forEach(el => {
            var svalue = Object.keys(months)[Object.values(months).indexOf(value-parseInt(el)+1)]
            svalues.push(svalue)
        })
        if(!inputs[type_selected].timeline.leadt[key].includes(leadt)){
            leadt = parseInt(inputs[type_selected].timeline.leadt[key][0])
            inputs[this.state.type_selected].svalue = svalues[0]
        }else{
            inputs[this.state.type_selected].svalue = svalues[leadt-1]
        }
        inputs[this.state.type_selected].svalues = svalues
        this.setState({inputs, filtered:false, checked:false, leadt:leadt, month:value})
    }

    onClickCase =()=>{
        this.setState({caseStudy:'cliccato'});
    }

    onClick = (e, n) => {
        if(n === 'Export as CSV'){
            this.refs.child.exportGeoJSON();
        }else{
            if(n === 'Export as NETCDF'){
                this.refs.child.exportNETCDF();
            }else{
                this.refs.child.exportJPEG();
            }
        }
    }

    onSwitchChange = (event)=>{
        event.target.checked ? this.setState({filtered:true}) : this.setState({filtered:false})
    }

    render(){
        const { default_monthly, inputs, selected, sliderMin, sliderMax, type_selected, variable , leadt, timeline, month} = this.state
        const { classes } = this.props;
        const monthly = type_selected ? inputs[type_selected].monthly : default_monthly;
        return ( 
            <div>
                <Grid container spacing={0} style={{padding:0, margin:0}} >
                    <Grid item sm={this.state.showed ? 2 : 0} style={{backgroundColor: '#FFFFFF', padding:0, margin:0, display:'flex', flexWrap: "wrap"}}>
                        {this.props.showed && 
                        <Grid container spacing={0} style={{padding:0}}>
                                <Grid item sm={12} style={{padding:0, margin:0}}>
                                    <TypeSelection
                                        handleClick={(e, el) => {this.onRadioChange(e, null, el)}} 
                                        checked={this.state.activeChip} 
                                        inputs={inputs}
                                        title = {'Choose a group of parameters: CLIMATE, BIOCLIMATIC or RISK INDICATORS'}
                                        classes={{ tooltip: classes.custom }}
                                    ></TypeSelection>
                                </Grid>                     
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <Divider variant="middle" />
                                    <Typography label="Select Variable" title={'Choose a variable to be shown'} classes={{ tooltip: classes.custom }}/>
                                    <CustomizedSelects
                                        onChange={(event) => this.onSelectChange(event, type_selected)}  
                                        type={type_selected}
                                        // label={inputs[type_selected].label}
                                        value={inputs[type_selected].value}
                                        values={inputs[type_selected].values}/>
                                </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <Divider variant="middle" />
                                    <Typography title={''} label={monthly ? "Select Year and Month" : "Select Year"} style={{margin:'1%', padding:0}}/>
                                    <Picker
                                        values={this.range(sliderMin , sliderMax)} 
                                        last={parseInt((this.state.timeline-sliderMin)/3)} 
                                        rows={3} 
                                        slidesToShow ={3} 
                                        slidesToScroll={3} 
                                        fontSize={'0.30rem'}
                                        active={this.state.timeline}
                                        type='y'
                                        onClick={this.onChangeSlider}/>
                                    {monthly && <Picker values={this.range(this.state.month_min, this.state.month_max)} 
                                        last={parseInt(this.state.month/3)} 
                                        rows={2} 
                                        slidesToShow ={3}
                                        slidesToScroll={3} 
                                        type='m'
                                        fontSize={'0.30rem'}
                                        active={this.state.month} 
                                        onClick={this.onChangeMonthSlider}>
                                    </Picker>}
                                </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <Divider variant="middle" />
                                    <Typography title='' label="Select Starting Date"/>          
                                        <div style={{display:"flex", flexDirection:"row"}}>
                                            <CustomizedSelects
                                                onChange={(event) => this.onSelectStartChange(event, type_selected)}  
                                                type={type_selected} 
                                                // label={inputs[type_selected].slabel}
                                                value={inputs[type_selected].svalue}
                                                values={inputs[type_selected].svalues}
                                            />
                                            {inputs.QMarks.values.map(el => { return el !== 'Tercile' ?
                                                <Tooltip classes={{ tooltip: classes.custom }} style={{marginLeft: 0, marginBottom:'2%', padding:0, textSizeAdjust:16}} title={inputs.QMarks.description[0][el]}>
                                                    <IconButton  aria-label="Help">
                                                        <HelpIcon fontSize="small" style={{fill:'#8A3D44'}}/>
                                                    </IconButton>
                                                </Tooltip> : null})}
                                        </div>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <div>
                                        <Divider variant="middle" />
                                        <Typography title='' label="Filters" style={{margin:'1%'}}/>
                                        <Grid container spacing={1} style={{width:'100%', marginLeft:20}}>
                                            <div style={{display:"flex", flexDirection:"row"}}>
                                                <CustomSwitch 
                                                    color="default" 
                                                    onChange={(event) => this.onSwitchChange(event)} 
                                                    checked={this.state.filtered} 
                                                    size="small" 
                                                    disabled={false}
                                                    label1= {'Skill Off  '}
                                                    label2= {'Skill On   '}/> 
                                                <Tooltip classes={{ tooltip: classes.custom }} style={{marginLeft:'0%', marginBottom:'2%', padding:0, textSizeAdjust:16}} title={'Ranked Probability Skill Score (RPSS) A Skill Score based on RPS values. The most commonly used reference forecasts are persistence and climatology.'}>
                                                    <IconButton  aria-label="Help">
                                                        <HelpIcon  fontSize="small" style={{fill:'#8A3D44'}}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </Grid>
                                    </div>
                                </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    {selected && type_selected && inputs[type_selected].value &&
                                        <div>
                                            <Divider variant="middle" />
                                            <SimpleMenu 
                                                items={['Export as CSV', 'Export as NETCDF', 'Export as JPEG']}
                                                onClick={(e, n) => this.onClick(e, n)}
                                            ></SimpleMenu>
                                        </div>}
                                </Grid> 
                            </Grid>
                        </Grid>} 
                    </Grid>
                    <Grid item sm={this.state.showed ? 10 : 12} style={{padding:0, margin:0}}>
                        <Grid container spacing={0} style={{backgroundColor: '#FFFFFF',padding:0, 
                                        margin:0, display:'flex', flexWrap: "wrap"}}>
                            <Grid item sm={12} style={{padding:0, margin:0, height:"100%"}}>
                                <MyMap
                                    ref="child"
                                    tab={selected} 
                                    callbackFromParent={this.myCallback}
                                    type={type_selected} 
                                    var={this.state.variable.replace(' ', '_')} 
                                    timeline={this.state.timeline} 
                                    month={this.state.month}
                                    filtered = {this.state.filtered}
                                    cellSide={1}
                                    top_left={"44,-18"}
                                    bottom_right={"34,0"}
                                    fly_zoom={6}
                                    rcp={0}
                                    style={{position:'absolute', zIndex:0, margin:0, width:'100%', height:'100%'}}
                                    update={()=>this.setState({clicked: true})}
                                    value={inputs[type_selected] !== undefined ? inputs[type_selected].value : ""}
                                    sliderMin={this.state.sliderMin}
                                    sliderMax={this.state.sliderMax}
                                    latitude={this.state.latitude}
                                    longitude={this.state.longitude}
                                    location={this.state.location}
                                    monthly={monthly}
                                    leadt={leadt}
                                    description={inputs.QMarks.description[0] ? inputs.QMarks.description[0]['Tercile'] : ''}
                                    showed={this.state.showed}
                                    percentile_id={inputs[type_selected] !== undefined ? inputs[type_selected].percentile_id : ""}
                                    leadtValue = {inputs[type_selected] !== undefined ? inputs[type_selected].svalue : ""}
                                />   
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(Seasonal);