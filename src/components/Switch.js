import React from 'react';
import { Switch, Grid} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { makeStyles } from "@material-ui/core/styles";

class CustomSwitch extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <Grid container alignItems="center" spacing={1} style={{width:'80%',color:'#000000', marginBottom:'2%', marginRight:0, marginLeft:0}}>
                <Grid item sm={3} style={{fontSize: '45%', marginRight:'auto', marginLeft:'auto'}}>{this.props.label1}</Grid>
                <Grid item>
                    <Switch color="default" onChange={(event) => this.props.onChange(event)} checked={this.props.checked}  size="small" style={{marginRight:0, marginLeft:0, color:'#595b5c'}} disabled={false}/>
                </Grid>
                <Grid item sm={3} style={{fontSize: '45%',  marginRight:'auto', marginLeft:'auto'}}>{this.props.label2}</Grid>
            </Grid>
        )
    }
}

export default CustomSwitch;
