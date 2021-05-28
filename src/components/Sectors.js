import React from 'react';
import { Grid, Divider} from '@material-ui/core';
import oillogo from '../img/oil.png'
import winelogo from '../img/wine.png'
import wheatlogo from '../img/wheat.png'
import Typography from './Typography';


class Sectors extends React.Component{

    render(){
        return(
            <div>
                <Divider variant="middle" />
                <Typography classes={this.props.classes} label="Select Sector" title={this.props.title}/>
                <Grid container spacing={0} style={{padding:0, margin:0}}>
                    <Grid item sm={4}>
                        <img src={oillogo} alt='' onClick={(e) => this.props.onClick()} style={{width:'30%', height:'50%', margin:'30%', marginBottom:0}}/>
                    </Grid>
                    <Grid item sm={4}>
                        <img src={winelogo} alt='' onClick={(e) => this.props.onClick()} style={{width:'30%', height:'50%', margin:'30%', marginBottom:0}}/>
                    </Grid>
                    <Grid item sm={4}>
                        <img src={wheatlogo} alt='' onClick={(e) => this.props.onClick()} style={{width:'30%', height:'50%', margin:'30%', marginBottom:0}}/>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default Sectors;