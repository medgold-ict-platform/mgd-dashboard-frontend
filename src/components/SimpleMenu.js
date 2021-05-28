import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const styles = {
  root:{
    '&:hover':{
      background:'#D7B062',
      color: '#FFFFFF',
      fontWeight:'bold'
    },
    background:'#FFFFFF',
    minWidth:40,
    minHeight:5,
    fontSize:'0.8rem'
  },
  button:{
    '&:hover':{
      background:'#D7B062',
      color: '#FFFFFF',
      borderColor: 'black',
      border: '1px solid'
    },
    border: '1px solid',
    fontWeight: "bold",
    background:'#595b5c',
    borderColor:'#000000',
    minWidth:40,
    minHeight:5,
    fontSize:'0.8rem',
    color:'#FFFFFF'
  },
  active:{
    background:'#FFFFFF !important',
    color: '#007090 !important',
    minWidth:40,
    minHeight:5,
    fontSize:'0.8rem'
  }
};

function SimpleMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { classes, children, className, ...other } = props;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{marginLeft:'13%', marginRight:'13%',marginTop:0, padding:'5%'}}>
      <Button className={clsx(classes.button, className)} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        Export Map Data
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {props.items.map((n, index) => {
              return(
                <MenuItem className={clsx(classes.root, className)} onClick={(e) => props.onClick(e, n)}>{n}</MenuItem>
              );
          })}  
      </Menu>
    </div>
  );
}

export default withStyles(styles)(SimpleMenu);