import { /*makeStyles,*/ withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import React/*, { useRef, useEffect }*/ from "react";
import Select from '@material-ui/core/Select';
import Tooltip from '@material-ui/core/Tooltip';
import { divIcon } from 'leaflet';
import Popover from './Popover'
import { MenuItem } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import ListSubheader from '@material-ui/core/ListSubheader';
const useStyles = theme => ({
  formControl: {
    minWidth: '70%',
    '&:focus': {
      color:'#FFFFFF',
    },
    backgroundColor:'#D7B062',
    marginTop:'5%',
    marginBottom:'5%',
    marginRight: '5%',
    marginLeft:'10%', 
    zIndex:0, 
    fontSize:10
  },
  select: {
    backgroundColor:'#D7B062',
    borderColor:'#000000',
    height:'auto',
    width: '100%',
    '&:focus': {
      color:'#000000',
    },
  },
  active: {
    fontWeight: 'bold',
    height:'auto',
    width: '100%',
    backgroundColor:'#FFFFFF !important',
    color:'#000000 !important',
    '&:focus': {
      color:'#000000 !important',
      borderColor:'#D7B062 !important'
    }
  },
  options:{
    '&:hover': {
      fontWeight: 'bold',
      background:'#D7B062 !important',
      color:'#FFFFFF !important'
    },
    outlineColor:'#8A3D44'
  },
  popover:{
    '&:hover': {
      fontWeight: 'bold',
      // background:'#007090 !important',
      color:'#FFFFFF !important'
    },
  }
});

const useOutlinedInputStyles = makeStyles(theme => ({
  root: {
    "& $notchedOutline": {
      borderColor: "red"
    },
    "&:hover $notchedOutline": {
      borderColor: "blue"
    },
    "&$focused $notchedOutline": {
      borderColor: "green"
    }
  },
  focused: {},
  notchedOutline: {}
}));

class CustomizedSelects extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      labelWidth: 0,
      // values: [],
      disabled: this.props.disabled,
      value: this.props.value,
      tooltipOpen: false
    }
    this.InputLabel = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if(this.props !== prevProps)
    {
      this.setState({labelWidth: this.InputLabel.current.offsetWidth})
    }
  } 

  componentDidMount() {
    this.setState({
      labelWidth: this.InputLabel.current.offsetWidth
    });
  }


  render(){
    const { classes } = this.props;

    // TODO move to the backend
    const definitions={
      'GST': "GST: Average of daily average temperatures between April 1st and October 31st (Northern Hemisphere). [GST provide information onto which are the best suited varieties for a given site or inversely, which are the best places to grow a specific variety. In a climate change scenario, it becomes an important index to use when making decisions about planting or replanting a vineyard. For existing vineyards, GST also informs on the suitability of its varieties for the climate of specific years, explaining quality and production variation. This index became popular when climate change started becoming an issue, as a clear and intuitive way to have a general idea of which areas would gain or lose suitability to produce quality wines. Many grapevine varieties across the world have been characterized in function of their GST optimum.]",
      'HarvestR':"HarvestR: Total rainfall during usual harvest period: aug 21st to Oct 21st (Northern Hemisphere). [Wet harvests are one of the major risks for winegrowers and winemakers alike. Scarce and moderate rainfall values during summer can be positive, especially in dry and semi-arid to arid areas as they provide necessary water and humidity for the physiological processes of the grapevine to occur, thus avoiding the need to irrigate. However, heavy rain downpours are detrimental to quality as berries will absorb water and dilute quality compounds such as sugars, acids, polyphenols and aroma precursors. They may also reduce quantity if hail events occur. Continued rainfall during harvest time set the conditions for widespread fungal infections (Botrytis being the most prevalent, but also Armilaria, Pennicillium, etc.) destroying berries, causing grapes to develop acetic acid bacteria and increasing levels of acetic, gluconic acids, ethyl acetate and other compounds very detrimental for wine quality] ",
      'SprR':"SprR: Total rainfall from April 21st to June 21st (Northern Hemisphere). [Dry springs will delay vegetative growth and reduce vigour and leaf area total surface. Fungal disease pressure will be lower and therefore there will be less need for protective and / or curative treatments, translating as less costs. Wet springs will promote higher vigour, increase the risk of fungal disease and disrupt vineyard operations as it may prevent machinery from getting in the vineyard due to mud. They are usually associated with higher costs]",
      'SU35':"SU35: Annual count of days when daily maximum temperatures exceed 35°C. [35°C is the average established threshold for photosynthesis to occur in the grapevine. Above this temperature, the plant closes its stomata. If this situation occurs after veraison, maturation will be arrested for as long as the situation holds, decreasing sugar, polyphenol and aroma precursor levels, all essential for grape and wine quality. Deprived from its normal source of energy, the plant will turn to use organic acids which will lower berry acidity contents decreasing its quality. The plant will alsouse more water to cool down its tissues, mainly after temperatures decrease in the evening. The higher the index, the lower will be berry quality and aptitude to produce quality grapes. The loss of acidity will, even for lower index levels, mean higher costs from acidity correction and water needs. There are inter- and intra-varietal variations in grapevines towards this threshold.] ",
      'WSDI':"WSDI: Annual count of days with at least 6 consecutive days when the daily temperature maximum exceeds its 90th percentile. [Considered an index for heatwaves, the same considerations as SU35 apply here. This index, however, signals when warm regions start to become too extreme and causing additional losses because of flowering disruption (when too early in the season) or extreme berry and leaf dehydration and scalding (berry skin sunburn, leaf and shoot desiccation), on top of excessive water depletion.]",
      "Heat Risk":"Heat Risk: The risk of tempeartures that are higher or lower than normal condictions to the crop yield and quality, consequently affecting wine production.",
      "SU40": "Number of summer heat days with Tmax above 40°C during summer months (from 21 June to 21 September)",
      "SU36": "Number of summer heat days with Tmax above 36°C during summer months (from 21 June to 21 September)",
      "Sprtx":"Mean maximum temperature from Apr to May",
      "Spr32":"Number of spring heat days with Tmax above 32°C during spring months (from 21 April to 21 June)",
      "GDD":"Summation of daily differences between daily temperature averages and 10°C (vegetative growth minimum temperature) from 1 April  and 31 October"
    }
    const index_wine =['GST', 'HarvestR', 'SprR', 'SU35', 'WSDI',  'GDD']
    const index_oil =['SU40', 'SU36', 'Sprtx',  'Spr32', 'WINRR']
    const index_durum = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    var oil = this.props.values.filter(n => index_oil.includes(n))
    var wine = this.props.values.filter(n => index_wine.includes(n))
    var durum = this.props.values.filter(n => index_durum.includes(n))

    return (
      <FormControl variant="outlined" margin='dense' className={classes.formControl} onChange={this.props.onChange}>
        <InputLabel style={{color:this.props.value !== '' ? '#007090':'#000000'}}ref={this.InputLabel} htmlFor="grouped-select">{this.props.label}</InputLabel >
          {/* <Tooltip placement='right' classes={{ tooltip: classes.custom }} title={definitions[this.props.value] !== undefined ? definitions[this.props.value] : ''} arrow> */}
            <Select
              // native
              id="grouped-select"
              className={this.props.value !== '' ? classes.active : classes.select}
              onChange={this.props.onChange}
              value={this.props.value}
              style={{fontSize: 16, color:'#000000'}}
              disabled={this.state.disabled}
              //options={this.options}
              displayEmpty={false}
              classes={this.useOutlinedInputStyles}
            >
              {(this.props.type !== 'Index' ||  months.includes(this.props.value)) &&
                  this.props.values.map((n, index) => {
                    return(
                      <MenuItem  
                        className={classes.options}
                        value={n}
                        >
                          <Popover className={classes.options}  label={n} description={definitions[n]}/>
                      </MenuItem>
                    );
                  })
              }  
               
              {(this.props.type === 'Index' && oil.length !== 0 ) &&
                <ListSubheader style={{fontSize: 17, color:'#a19c1aff', fontWeight: 'bold'}}>Olive / Olive oil</ListSubheader>
              }
              {this.props.type === 'Index' &&
                  this.props.values.filter(n => index_oil.includes(n)).map((n, index) => {
                    return(
                        <MenuItem 
                          className={classes.options}
                          value={n}
                          style={{fontSize: 16, color:'#a19c1aff'}}>
                            <Popover className={classes.options}  label={n} description={definitions[n]}/>
                        </MenuItem>
                    );
                  })
              }

              {(this.props.type === 'Index' && wine.length !== 0) &&
                <ListSubheader style={{fontSize: 17, color:'#8a3d44ff', fontWeight: 'bold'}}>Grape/Wine</ListSubheader>
              }
              {this.props.type === 'Index' &&
                  this.props.values.filter(n => index_wine.includes(n)).map((n, index) => {
                    return(
                        <MenuItem 
                          className={classes.options}
                          value={n}
                          style={{fontSize: 16, color:'#8a3d44ff'}}> 
                            <Popover className={classes.options}  label={n} description={definitions[n]}/>
                        </MenuItem>                  
                      );
                    })
                }

                {(this.props.type === 'Index' && durum.length !== 0) &&
                  <ListSubheader style={{fontSize: 17, color:'#d8b162ff', fontWeight: 'bold'}}>Durum</ListSubheader>
                }
                {this.props.type === 'Index' &&
                  this.props.values.filter(n => index_durum.includes(n)).map((n, index) => {
                    return(
                      <MenuItem 
                        className={classes.options}
                        value={n}
                        style={{fontSize: 16, color:'#d8b162ff'}}> 
                          <Popover className={classes.options}  label={n} description={definitions[n]}/>
                      </MenuItem>   
                    );
                  })
                }         
            
            </Select>
        {/* </Tooltip> */}
      </FormControl>
  );
  }
}

export default withStyles(useStyles)(CustomizedSelects);