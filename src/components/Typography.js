import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import {Grid} from '@material-ui/core';

const theme = createMuiTheme({
    overrides: {
        MuiTypography: {
            root:{
                color: '#000000',
                variant: 'h5',
                paddingLeft: 20,
                paddingBottom:5
            }
        },
    },
  });

export default function TypographyVariants(props) {

  const { classes, title, label} = props;
  console.log(title)
  return (
    <div style={{display:"flex", flexDirection:"row", marginTop:0}}>
      <ThemeProvider theme={theme}>
      <Typography align='left'>{label}</Typography>        
        {title !== '' && 
            <Tooltip classes={classes} style={{marginLeft:'15%', marginBottom:0, padding:0, marginTop:0}} title={title}>
                <IconButton  aria-label="Help">
                    <HelpIcon  fontSize="small" style={{fill:'#8A3D44'}}/>
                </IconButton>
            </Tooltip>  
      }
      </ThemeProvider>
    </div>
  );
}