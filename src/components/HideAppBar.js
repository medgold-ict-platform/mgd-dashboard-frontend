import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Slide from '@material-ui/core/Slide';
import logo from '../img/logo-100.png'; // with import
import { makeStyles } from "@material-ui/core/styles";
import Panel from './panel'
import "fontsource-amatic-sc"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appbarRoot:{
    fontFamily:"Amatic SC",
    fontWeight:'bold',
    color:'#000000'
  }
}));



function HideOnScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({ target: window ? window() : undefined });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default function HideAppBar(props) {
  const classes = useStyles();

  return (
        <AppBar className={classes.appbarRoot} style={{background:'#FFFFFF'}} position="static">
          <Toolbar style={{paddingRight:'1%', paddingLeft:'1%'}}>
            <img src={logo} alt='' style={{width:'4%', height:'4%', marginRight:'3%'}}/>
              <div style={{width: '90%', marginTop:5,display:'inline-block', marginBottom:5}}>
                {/* <Typography className={classes.appbarRoot} variant="h3" color='inherit'  >MED-GOLD</Typography> */}
                <Typography className={classes.appbarRoot} variant="h5" color='inherit' >Turning climate-related information into added value for traditional MEDiterranean Grape, OLive and Durum wheat food systems</Typography>
              </div>
              <Panel></Panel>
          </Toolbar>
        </AppBar>
  );
}
