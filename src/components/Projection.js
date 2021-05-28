import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { RadioGroup, FormControlLabel, Grid, Radio, Switch } from '@material-ui/core';
import CustomizedSelects from './Select'
import api from '../api/client';
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MyMap from './Map'
import SimpleMenu from './SimpleMenu';
import TypeSelection from './TypeSelection'
import CustomSwitch from './Switch'
import Typography from './Typography';
import Divider from '@material-ui/core/Divider';
import Picker from './Picker'


const styles = theme => ({
    custom: {
        fontSize: 16,
        marginBottom:'15%',
    },
    radioButton: {
        fontSize: 8,
        '&$checked': {
          color: '#D7B062'
        },
        size: 'small'
      },
    checked: {},
    checkboxLabel:{
        fontWeight:'bold',
        fontSize:12,
        padding:0
    }
});

class Projection extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selected: "Projection",
            inputs: {
                Ecv: {
                    monthly: false,
                    values: [],
                    value: 'Tmax monthly',
                    intervals: [],
                    AndalusiaName: [],
                    label: 'Climate'
                },
                Index: {
                    monthly: false,
                    values: [],
                    value: 'GST',
                    intervals: [],
                    AndalusiaName: [],
                    label: 'Bioclimatic'
                },
                RCP: {
                    values: [],
                    value: 'Intermediate greenhouse gas emission',
                    intervals: [],
                    active: false,
                    description: "",
                    checked: false,
                    num_values:[]
                }
            },
            sliderMin: 1951,
            sliderMax: 2018,
            hasrcp: true,
            type_selected: 'Ecv',
            default_monthly: false,
            default_type: 'Ecv',
            interval: '2031-2060',
            type: 'Ecv',
            open: false,
            description: "",
            checked: false,
            r_checked: false, 
            value: "Tmax Monthly",
            month:12,
            activeChip: 'Climate',
            showed: this.props.showed,
            caseStudy: '',
            rcp_value: '',
            leadt:'',
            region: 'Douro'      
        }
    }

    componentDidUpdate = (prevProps) => {
        if(prevProps.showed !== this.props.showed){
            this.setState({showed: this.props.showed})
        }
    }
    

    componentDidMount() {
        api.info(this.state.selected)
        .then((response) => {
            var { inputs } = this.state;
            Object.keys(inputs).map(e => {
                inputs[e].intervals = response.body[0][e].Intervals;
                inputs[e].monthly = response.body[0][e].Monthly;
                inputs[e].values = response.body[0][e].Name;
                inputs[e].num_values = response.body[0][e].Values;
                inputs[e].label = response.body[0][e].label;
                inputs[e].description = response.body[0][e].Description
                inputs[e].AndalusiaName = response.body[0][e].AndalusiaName
                return inputs[e];
            });
            this.setState({inputs: inputs, rcp_value: inputs.RCP.values[0], rcp:'45'});
        }).catch(err => {
            console.error(err);
        });
    }

    onSwitchChange = (event, t) => {
        var type = this.state.type_selected
        var value
        var {inputs} = this.state
        if( t === 'anom'){
            if(event.target.checked){
                this.setState({type: type+t})
            }else{
                this.setState({type: type.replace(/anom/g, '')})
            }
            this.setState({checked: event.target.checked})
        }else{
            if(event.target.checked){
                inputs[type].value = value = inputs[type].AndalusiaName[0]
                if(type !== 'Ecv'){ this.setState({type: type.replace(/anom/g, '')})}
                this.setState({region: 'Andalusia'})
            }else{
                inputs[type].value = value = inputs[type].values[0]
                this.setState({region: 'Douro'})
            }
            this.setState({r_checked: event.target.checked, inputs: inputs, value: value})
        }
    }

    onSelectChange = (event, id, i=false) => {
        var { inputs, interval, type_selected, r_checked} = this.state;
        
        if(i){
            interval = event.target.value;
        }else {
            inputs[id].value = event.target.value;
            this.setState({value:event.target.value})
        }
        var hasrcp = false
        
        // inputs['RCP'].intervals.map(e =>{
        //     if(e === interval){
        //         hasrcp = true
        //     }else{
        //         this.setState({type:type_selected})
        //     }
        //     return null
        // })

        if(inputs['RCP'].intervals.includes(interval)){
            hasrcp = true
        }
        else {
            hasrcp = false
            let checked = false
            this.setState({type:type_selected, checked})
        }

        this.setState({inputs, interval, hasrcp:hasrcp});
    }

    onRadioChange = (event, type = null, el) => {
        var {inputs, type_selected} = this.state;
        if(type){
            inputs[type].value = el;
            this.setState({rcp: inputs['RCP'].num_values[0][el], inputs})
        }
        else{
            var type_selected = el;
            this.setState({type_selected,activeChip:inputs[el].label, region:'Douro', type: el, inputs, checked:false, r_checked:false, value: inputs[type_selected].value, type: el});
        } 
    }

    onChangeMonthSlider =(event, value) =>{
        this.setState({month: value});
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

    range(start, end){ return [...Array(1+end-start).keys()].map(v => start+v)}

    render(){
        const { inputs, region, selected,type,r_checked, type_selected, value ,hasrcp, rcp, month, interval, checked} = this.state
        const { classes } = this.props;      
        const monthly = type_selected ? inputs[type_selected].monthly : false;

        return ( 
            <div>
                <Grid container spacing={0} style={{padding:0, margin:0}} >
                    <Grid item sm={this.state.showed ? 2 : 0} style={{backgroundColor: '#FFFFFF', padding:0, margin:0, display:'flex', flexWrap: "wrap"}}>
                        {this.state.showed && 
                        <Grid container spacing={0} style={{padding:0}}>
                            <Grid item sm={12} style={{padding:0, margin:0}}>
                                <TypeSelection
                                    handleClick={(e, el) => {this.onRadioChange(e, null, el)}} 
                                    checked={this.state.activeChip} 
                                    inputs={inputs}
                                    title = {'Choose a group of parameters: CLIMATE, BIOCLIMATIC or RISK INDICATORS'}
                                    classes={{ tooltip: classes.custom }}
                                    />
                            </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <Divider variant="middle" />
                                    <Typography label="Region" title={'Choose the region to be shown'} classes={{ tooltip: classes.custom }}/>
                                    <Grid container alignItems="center" spacing={1} style={{width:'100%', marginLeft:'10%', marginBottom:0, paddingRight:'25%'}}>
                                        <CustomSwitch 
                                            color="default" 
                                            onChange={(event) => this.onSwitchChange(event, 'region')} 
                                            checked={r_checked} 
                                            size="small" 
                                            disabled={false}
                                            label1= {'Douro'}
                                            label2= {'Andalusia'}
                                        />
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
                                        values={r_checked ? inputs[type_selected].AndalusiaName : inputs[type_selected].values}
                                        />
                                </Grid>
                                <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <Divider variant="middle" /> 
                                    <Typography title={''} label={monthly ? "Select Interval and Month" : "Select Interval"} style={{margin:'1%', padding:0}}/>
                                    <CustomizedSelects 
                                        onChange={(event) => this.onSelectChange(event, type_selected, type_selected + ' Interval')}  
                                        type='Time Interval'
                                        value={interval}
                                        // label={'Time Interval'}
                                        values={inputs[type_selected].intervals}/>
                                    {monthly &&  <Picker 
                                        values={this.range(1 , 12)} 
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
                                {hasrcp &&  
                                    <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                        <Divider variant="middle" />
                                        <Typography title={''} label={"Select RCP"} style={{margin:'1%', padding:0}}/>
                                            <div style={{display:"flex", flexDirection:"row"}}>
                                                <RadioGroup value={inputs.RCP.value} onChange={(e, el) => this.onRadioChange(e,'RCP', el)}>
                                                    {inputs.RCP.values.map(el => 
                                                        <FormControlLabel
                                                                classes={{
                                                                    label:classes.checkboxLabel
                                                                }}
                                                                style={{margin: '1%', fontSize:'2%', fill:'#8A3D44'}}
                                                                key={el} 
                                                                value={el} 
                                                                control={ 
                                                                    <Radio classes={{root: classes.radioButton, checked: classes.checked}}/>
                                                                } 
                                                                label={el} 
                                                                />
                                                        )}
                                                </RadioGroup>
                                                <div style={{display:"flex", flexDirection:"column", marginLeft:'5%', marginRight:'5%'}}>
                                                    {inputs.RCP.values.map(el => 
                                                        <Tooltip classes={{ tooltip: classes.custom }} style={{marginBottom:'10%'}} title={inputs['RCP'].description[0][el]}>
                                                            <IconButton  aria-label="Help">
                                                                <HelpIcon  fontSize="small" style={{fill:'#8A3D44'}}/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                    </Grid>}
                                {/* {hasrcp  && 
                                    <Grid item sm={3} >
                                        {inputs.RCP.values.map(el => 
                                            <Tooltip classes={{ tooltip: classes.custom }} style={{padding:0, marginLeft:0, margin:'25%'}} title={inputs['RCP'].description[0][el]}>
                                                <IconButton  aria-label="Help">
                                                    <HelpIcon  fontSize="small" style={{fill:'#FFFFFF'}}/>
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Grid>} */}
                                {interval && hasrcp && <Grid item sm={12} style={{paddingTop:0, paddingBottom:0}}>
                                    <div>
                                        <Divider variant="middle" />
                                        <Typography title={''} label="Filter" style={{margin:'1%'}}/>
                                        {<Grid container spacing={1} style={{width:'100%', marginLeft:20}}>
                                            <div style={{display:"flex", flexDirection:"row"}}>
                                                <CustomSwitch 
                                                    color="default" 
                                                    onChange={(event) => this.onSwitchChange(event, 'anom')} 
                                                    checked={checked} 
                                                    size="small" 
                                                    disabled={false}
                                                    label1= {'Data'}
                                                    label2= {'Anomalies'}/> 
                                                <Grid style={{marginLeft:30}}>
                                                    <Tooltip classes={{ tooltip: classes.custom }} style={{marginLeft:20, marginBottom:0, padding:0}} title={'The term anomaly means a departure from a reference value or long-term average. A positive anomaly indicates that the observed variable value was smaller than the reference value, while a negative anomaly indicates that the observed variable value was higher than the reference value.'}>
                                                        <IconButton  aria-label="Help">
                                                            <HelpIcon  fontSize="small" style={{fill:'#8A3D44'}}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                                
                                            </div>
                                        </Grid>}
                                    </div>
                                </Grid>}
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
                        <Grid container spacing={0} style={{backgroundColor: '#FFFFFF',padding:0, margin:0, display:'flex', flexWrap: "wrap"}}>
                            <Grid item sm={12} style={{padding:0, margin:0, height:"100%", position:'relative'}}>
                                <MyMap
                                    ref="child"
                                    tab={selected} 
                                    callbackFromParent={this.myCallback}
                                    type={checked ? type : type_selected}
                                    var={this.state.value.replace(' ','_')} 
                                    timeline={this.state.interval} 
                                    month={this.state.month}
                                    filtered = {this.state.filtered}
                                    cellSide={1}
                                    top_left={"44,-18"}
                                    bottom_right={"34,0"}
                                    fly_zoom={this.state.region == 'Andalusia' ? 5 : 8}
                                    rcp={rcp}
                                    region={this.state.region}
                                    style={{position:'absolute', zIndex:0, margin:0, width:'100%', height:'100%'}}
                                    update={()=>this.setState({clicked: true})}
                                    value={inputs[type_selected] !== undefined ? inputs[type_selected].value : ""}
                                    sliderMin={this.state.sliderMin}
                                    sliderMax={this.state.sliderMax}
                                    latitude={this.state.latitude}
                                    longitude={this.state.longitude}
                                    location={this.state.location}
                                    monthly={monthly}
                                    showed={this.state.showed}
                                />   
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(Projection);