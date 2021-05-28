import React from "react";
// import CustomizedTabs from '../components/tabs';
import { makeStyles } from '@material-ui/core/styles';
import Dashboard from '../components/Dashboard'
import Amplify from 'aws-amplify';
import awsmobile from '../aws-exports';
import HideAppBar from '../components/HideAppBar';
import logo from '../img/flag.png'
import "fontsource-amatic-sc"
import BottomNavigation from '@material-ui/core/BottomNavigation';
import {Grid} from '@material-ui/core';

Amplify.configure(awsmobile);

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    background:'red',
    overflowY: 'hidden',
    height: "100%",
    margin:0,
    padding:0
  },
  font:{
    fontFamily:"Amatic SC",
    fontWeight:'bold'
  }
}));



export default function Homepage(props) {

  const classes = useStyles();
  return (
    <div className={classes.root} style={{background: '#000000'}}>
      <HideAppBar style={{height:'5%'}}></HideAppBar>
      <Dashboard ></Dashboard>
      <BottomNavigation style={{height:'10%'}}>
        <Grid container spacing={12} style={{padding:20, margin:0, backgroundColor:'#FFFFFF'}}>
            <Grid item sm={2}></Grid>
            <Grid item sm={10} style={{padding:0, margin:0, backgroundColor:'#FFFFFF'}}>
                <img src={logo} style={{width:45, height:30, marginRight:'3%'}}/>
                <text style={{color:'#000000', fontSize:12}}>This project has received funding from the European Union's</text>
                <text style={{fontWeight: "bold", color:'#000000', fontSize:12}}> Horizon 2020 </text>
                <text style={{color:'#000000', fontSize:12}}>Research and Innovation programme under Grant agreement No.</text>
                <text style={{fontWeight: "bold", color:'#000000', fontSize:12}}>776467</text>
            </Grid>
        </Grid>
      </BottomNavigation>
    </div>
  );
}