import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Grid} from '@material-ui/core';
import CustomizedSelects from './Select'
import api from '../api/client';
import MyMap from './Map'
import Typography from './Typography';
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import Picker from './Picker'
import 'rsuite/dist/styles/rsuite-default.css';
import SimpleMenu from './SimpleMenu';
import TypeSelection from './TypeSelection'
import CustomSwitch from './Switch'

const styles = theme => ({
    switch:{
        marginRight:0, 
        marginLeft:0,
        color:'#000000'
    },
    custom: {
        fontSize: 16
     },
});

class Climatology extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selected: "climatology",
            inputs: {
                Ecv: {
                    id: '',
                    disabled: false,
                    monthly: false,
                    values: [],
                    value: 'Tmin monthly',
                    label: 'Climate',
                    era5interval:[],
                    definterval:[],
                    averageInterval:[],
                    switch_id:"",
                    steps: [],
                    average: false
                },
                Index: {
                    id: '',
                    disabled: false,
                    monthly: false,
                    values: [],
                    value: 'GST',
                    label: '' ,
                    era5interval:[],
                    definterval:[],
                    averageInterval:[],
                    switch_id:"",
                    era5Name: [],
                    steps: [],
                    average: false
                },
                Risk: {
                    id: '',
                    disabled: false,
                    monthly: false,
                    values: [],
                    value: 'Heat Risk',
                    label: '',
                    era5interval:[],
                    definterval:[],
                    switch_id:"",
                    era5Name: [],
                    steps: [],
                    average: false
                },
                QMarks: {
                    description: [],
                    monthly: false,
                    values: []
                }
            },
            average: false,
            sliderMin: 1951,
            sliderMax: 2015,
            timeline: 2015,
            default_monthly: false,
            type_selected: 'Ecv',
            default_type: 'Ecv',
            // clicked: false,
            location: "",
            variable: "Tmin_monthly",
            month: 12,
            checked: false,
            activeChip: 'Climate',
            caseStudy: '',
            showed: this.props.showed
        }
        this.child = React.createRef();
    }

    componentDidUpdate = (prevProps) => {
        if(prevProps.showed !== this.props.showed){
            this.setState({showed: this.props.showed})
        }
    }

    componentDidMount() {
        api.info(this.state.selected)
        .then((response) => {
            var { inputs, default_type } = this.state;
            var { start_date: sliderMin, end_date: sliderMax} = response.body[0][default_type].Timeline.default;
            sliderMin = parseInt(sliderMin)
            sliderMax = parseInt(sliderMax)
            Object.keys(inputs).map(e => {
                if (e === "QMarks") {
                    inputs[e].description = response.body[0][e].Description
                } else {
                    inputs[e].monthly = response.body[0][e].Monthly;
                    inputs[e].values = response.body[0][e].Name;
                    inputs[e].label = response.body[0][e].label;
                    inputs[e].era5interval = response.body[0][e].Timeline.era5
                    inputs[e].definterval = response.body[0][e].Timeline.default
                    inputs[e].switch_id = response.body[0][e].switch_id
                    inputs[e].era5Name = response.body[0][e].era5Name
                    inputs[e].steps = response.body[0][e].Steps
                    inputs[e].average = response.body[0][e].Average
                    inputs[e].averageInterval = response.body[0][e].Timeline.Average
                    inputs[e].id = response.body[0].id
                }
                return inputs[e];
            });
            this.setState({inputs, sliderMin, sliderMax});
        })
        .catch(err => {
            console.error(err);
        });
    }

    onSwitchChange(event, t){
        var {type_selected, inputs, checked, average, sliderMin, sliderMax, timeline} = this.state
        if(t ==='avg'){
            var average = event.target.checked
            if(average){
                timeline =  inputs[type_selected].averageInterval.Intervals[0]
            }else{
                timeline = checked ? parseInt(inputs[type_selected].era5interval.end_date) 
                : parseInt(inputs[type_selected].definterval.end_date)
                sliderMin = checked ? parseInt(inputs[type_selected].era5interval.start_date) 
                : parseInt(inputs[type_selected].definterval.start_date)
                sliderMax = checked ? parseInt(inputs[type_selected].era5interval.end_date) 
                : parseInt(inputs[type_selected].definterval.end_date)
            }
            this.setState({
               average: event.target.checked,
               timeline: timeline,
               inputs,
            //    sliderMin: sliderMin,
            //    sliderMax: sliderMax
            })
        }else{
            var variable
            if(!(inputs[type_selected].value in inputs[type_selected].values)){
                variable = inputs[type_selected].value = inputs[type_selected].values[0]
            }else{
                variable = inputs[type_selected].value
            }
            if(event.target.checked){
                if(this.state.timeline > parseInt(inputs[type_selected].era5interval.end_date) || this.state.timeline < parseInt(inputs[type_selected].era5interval.start_date)){
                    timeline = average ? inputs[type_selected].averageInterval.Intervals[0] 
                     : parseInt(inputs[type_selected].era5interval.end_date)
                }else{
                    timeline = this.state.timeline
                }
                this.setState({
                    selected: inputs[type_selected].switch_id, 
                    sliderMax:parseInt(inputs[type_selected].era5interval.end_date),
                    sliderMin:parseInt(inputs[type_selected].era5interval.start_date),
                    timeline: average ? inputs[type_selected].averageInterval.Intervals[0] : timeline,
                    checked:true, inputs,
                    variable: variable
                })
            }else{
                if(this.state.timeline > parseInt(inputs[type_selected].definterval.end_date) || this.state.timeline < parseInt(inputs[type_selected].definterval.start_date)){
                    timeline = average ? inputs[type_selected].averageInterval.Intervals[0] : parseInt(inputs[type_selected].definterval.end_date)
                }else{
                    timeline = this.state.timeline
                }
                this.setState({
                    selected:inputs[type_selected].id, 
                    sliderMax:parseInt(inputs[type_selected].definterval.end_date),
                    sliderMin:parseInt(inputs[type_selected].definterval.start_date),
                    timeline: timeline,
                    checked:false, inputs,
                    variable: variable
                })
            }
            
        }
               
    }

    onSelectChange = (event, id) => {
        if(event.target.value){
            var { inputs, type_selected, selected} = this.state;
            inputs[id].value = event.target.value;
            this.setState({inputs, type_selected: id, variable: inputs[id].value.replace(' ', '_'), 
            sliderMin: selected === 'era5' ? parseInt(inputs[type_selected].era5interval.start_date): parseInt(inputs[type_selected].definterval.start_date), 
            sliderMax: selected === 'era5' ? parseInt(inputs[type_selected].era5interval.end_date): parseInt(inputs[type_selected].definterval.end_date)})
        }
    }

    onRadioChange = (event, type = null, el) => {
        var {inputs, type_selected, timeline, average} = this.state
        var variable
        if(type){
            inputs[type].value = el;
        }else{
            type_selected = el;
            this.setState({type_selected, checked:false, selected: inputs[type_selected].id, inputs});
        }
        // if(this.state.clicked){
        //     this.setState({clicked: !this.state.clicked})
        // }
        if(average || timeline > parseInt(inputs[type_selected].definterval.end_date))
        {timeline = parseInt(inputs[type_selected].definterval.end_date)}
        // inputs[type_selected].clicked = true;
        if(!(inputs[el].value in inputs[el].values)){
            variable = inputs[el].value = inputs[el].values[0]
        }else{
            variable = inputs[el].value
        }
        this.setState({inputs, 
            activeChip:inputs[el].label, 
            variable: variable, 
            average:false, 
            sliderMin: parseInt(inputs[type_selected].definterval.start_date), 
            sliderMax: parseInt(inputs[type_selected].definterval.end_date), 
            timeline: timeline});
    }

    onChangeSlider =(event, value) =>{
        var {inputs} = this.state
        this.setState({timeline: value, inputs});
        // if(this.state.clicked){
        //     this.setState({clicked: !this.state.clicked})
        // }
    }

    onChangeMonthSlider =(event, value) =>{
        var {inputs} = this.state
        this.setState({month: value, inputs});
        // if(this.state.clicked){
        //     this.setState({clicked: !this.state.clicked})
        // }
    }

    myCallback = (longitude, latitude) => {
        // if(!this.state.clicked){
        //     this.setState({clicked: !this.state.clicked})
        // }
        if(this.state.location !== latitude+','+longitude){
            this.setState({location:latitude+','+longitude, latitude, longitude})
        }
    }

    range(start, end){ return [...Array(1+end-start).keys()].map(v => start+v)}
    
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

    onClickCase =()=>{
        this.setState({caseStudy:'cliccato'});
    }

    render(){
        const { default_monthly, inputs, selected, sliderMin, sliderMax, type_selected , checked, average} = this.state;
        const { classes } = this.props;
        const monthly = type_selected ? inputs[type_selected].monthly : default_monthly;
        var label = ""
        if(average){
            monthly ? label = "Select Interval and Month" : label = "Select Interval"
        }else{
            monthly ? label = "Select Year and Month" : label = "Select Year"
        }

        return ( 
            <div>
                 <Grid container spacing={0} style={{padding:0, margin:0}} >
                    <Grid item sm={this.state.showed ? 2 : false} style={{backgroundColor: '#FFFFFF', padding:0, margin:0, display:'flex', flexWrap: "wrap"}}>
                        {this.state.showed && 
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
                                    <Typography label="Region"  title={''} style={{margin:'5%'}} />
                                    <Grid container spacing={1} style={{width:'100%', marginLeft:'10%'}}>
                                        <div style={{display:"flex", flexDirection:"row"}}>
                                            <CustomSwitch 
                                                color="default" 
                                                onChange={(event) => this.onSwitchChange(event)} 
                                                checked={checked} 
                                                size="small" 
                                                disabled={false}
                                                label1= {'Douro Valley'}
                                                label2= {'Iberian Peninsula'}/> 
                                            <Grid>
                                                <Tooltip classes={{ tooltip: classes.custom }} style={{marginLeft:'auto', marginBottom:0, padding:0}} title={inputs.QMarks.description[0] ? inputs.QMarks.description[0]['Filters'] : ''}>
                                                    <IconButton  aria-label="Help">
                                                        <HelpIcon  fontSize="small" style={{fill:'#8A3D44'}}/>
                                                    </IconButton>
                                                </Tooltip>  
                                            </Grid>
                                        </div>
                                    </Grid>
                                </Grid>                      
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <Divider variant="middle" />
                                    <Typography label="Select Variable" title={'Choose a variable to be shown'} classes={{ tooltip: classes.custom }}/>
                                    <CustomizedSelects
                                        onChange={(event) => this.onSelectChange(event, type_selected)}  
                                        type={type_selected}
                                        // label={inputs[type_selected].label}
                                        value={inputs[type_selected].value}
                                        values={ selected === 'era5' ? inputs[type_selected].era5Name : inputs[type_selected].values}/>
                                </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    {type_selected &&<Divider variant="middle" />  } 
                        {type_selected && <Typography label={label} title={''} style={{margin:'1%', padding:0}} classes={{ tooltip: classes.custom }}/> }
                                    {type_selected && <Picker
                                        values={!average ? this.range(sliderMin , sliderMax) : inputs[type_selected].averageInterval.Intervals} 
                                        last={!average ? parseInt((this.state.timeline-sliderMin)/3): 1} 
                                        rows={!average ? 3 : 1} 
                                        slidesToShow ={!average ? 3 : 1} 
                                        slidesToScroll={!average ? 3 : 1} 
                                        fontSize={!average ? '0.45rem' : '0.30rem'}
                                        active={this.state.timeline}
                                        type='y'
                                        onClick={this.onChangeSlider}/>}
                                    {type_selected && monthly && <Picker values={this.range(1 , 12)} 
                                        last={parseInt(this.state.month/3)} 
                                        rows={2} 
                                        slidesToShow ={3} 
                                        slidesToScroll={3} 
                                        type='m'
                                        fontSize={!average ? '0.45rem' : '0.30rem'}
                                        active={this.state.month} 
                                        onClick={this.onChangeMonthSlider}>
                                    </Picker>}
                                </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                {type_selected && inputs[type_selected].average &&
                                    <div>
                                    <Divider variant="middle" />
                                    <Typography label="Filter" title={''} style={{margin:'5%'}} />
                                    {inputs[type_selected].average &&
                                        <Grid container alignItems="center" spacing={1} style={{width:'100%', marginLeft:'10%', marginBottom:0, paddingRight:'25%'}}>
                                            <CustomSwitch 
                                                color="default" 
                                                onChange={(event) => this.onSwitchChange(event, 'avg')} 
                                                checked={average} 
                                                size="small" 
                                                disabled={false}
                                                label1= {'Data'}
                                                label2= {'Average'}
                                            />
                                        </Grid>
                                    }
                                    </div> }
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
                        </Grid>} 
                    </Grid>
                    <Grid item sm={this.state.showed ? 10 : 12} style={{padding:0, margin:0}}>
                    <Grid container style={{backgroundColor: '#FFFFFF',padding:0, margin:0, display:'flex', flexWrap: "wrap"}}>
                        <Grid item sm={12} style={{padding:0, margin:0, height:"100%"}}>
                            <MyMap
                                ref="child"
                                tab={selected} 
                                callbackFromParent={this.myCallback}
                                type={average ?  type_selected+'avg' : type_selected} 
                                var={this.state.variable.replace(' ','_')} 
                                timeline={this.state.timeline} 
                                month={this.state.month}
                                cellSide={1}
                                top_left={"41.65011494603294,-8.80712280273437"}
                                bottom_right={"40.6107687369317,-6.792877197269576"}
                                fly_zoom={8}
                                rcp={0}
                                style={{position:'absolute', zIndex:0, margin:0, width:'100%', height:'100%'}}
                                // update={()=>this.setState({clicked: true})}
                                value={inputs[type_selected] !== undefined ? inputs[type_selected].value : ""}
                                sliderMin={this.state.sliderMin}
                                sliderMax={this.state.sliderMax}
                                latitude={this.state.latitude}
                                longitude={this.state.longitude}
                                location={this.state.location}
                                average={average}
                                monthly={monthly}
                                showed={this.state.showed}
                            >  
                            </MyMap>   
                        </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(Climatology);