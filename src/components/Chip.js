import React, {useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: theme.spacing(0.5)
    // color:'#FFFFFF'
  },
  clickable:{
    fontSize: 16,
    border: '1px solid',
    borderColor:'#000000',
    color:'#FFFFFF !important',
    backgroundColor:'#D7B062 !important',
    fontWeight: 'bold',
  },
  clickable2:{
    fontSize: 16,
    border: '1px solid',
    color:'#FFFFFF',
    backgroundColor:'#595b5c',
    borderColor:'#FFFFFF',
    '&:hover': {
      color:'#FFFFFF',
      fontWeight: 'bold',
      backgroundColor:'#D7B062 !important',
      borderColor:'#000000'
    },
    '&:focus': {
      color:'#000000',
      fontWeight: 'bold',
      backgroundColor:'#FFFFFF !important',
    },
  }
}));

export default function SmallOutlinedChips(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Chip 
        className={props.checked === props.label ? classes.clickable : classes.clickable2} 
        onClick={props.handleClick} 
        clickable={true} 
        variant="outlined" 
        size="small" 
        label={props.label} 
      />
    </div>
  );
}
