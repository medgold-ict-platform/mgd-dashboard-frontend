import React from 'react';
import { Grid, Divider} from '@material-ui/core';
import Chip from './Chip'
import Typography from './Typography';
import "fontsource-amatic-sc"
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    appbarRoot:{
        fontFamily:"Amatic SC",
        fontWeight:'bold',
        color:'#000000'
    }
}));

class TypeSelection extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <div>
                <Divider variant="middle" />
                <Typography style={{marginleft:'auto'}} classes={this.props.classes} className={useStyles.appbarRoot} label="Select Type" title={this.props.title}/>
                {Object.keys(this.props.inputs).map(el => 
                    this.props.inputs[el].label !== undefined ? <Chip key={el} value={el} 
                    handleClick={(e) => {this.props.handleClick(e, el)}} 
                    checked={this.props.checked} 
                    label={this.props.inputs[el].label}/> : null
                )}
            </div>
        )
    }
}

export default TypeSelection;