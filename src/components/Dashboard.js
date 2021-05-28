import React from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Climatology from './Climatology'
import Projection from './Projection'
import Seasonal from './Seasonal'
import api from '../api/client';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF'
  },
  tabsRoot: {
    background:'#FFFFFF'
  },
  tabsIndicator: {
    background:'#FFFFFF',    
    backgroundColor: '#A19C1B',
    textColor:'#000000'
  },
  tabRoot: {
    textTransform: 'initial',
    minWidth: 50,
    fontSize: 14,
    marginTop: '0',
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(4),
    marginBottom:0,
    '&:hover': {
      color: '#FFFFFF',
      opacity: 1,
    },
    '&$tabSelected': {
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: '#FFFFFF',
    },
  },
  tabSelected: {

  },
  typography: {
    padding: theme.spacing(3)  
  }
});

class Dashboard extends React.Component {
  state = {
    value: 0,
    add: false,
    edit: false,
    ids:[],
    showed: true
  };

  componentDidMount() {
    api.ids().then((response) => {
          this.setState({ids:response.body.reverse()})
        }
      )
    .catch(err => {
      this.setState({loading: false});
      console.error(err);
      alert(err);
    });
  }

  handleChange = (event, value) => {
    this.setState({value, showed:true});
  };

  handleEdit = (datasource) => {
    this.setState ({
      edit: true,
      datasource: datasource
    })
  }

  renderContent() {
    const { value } = this.state;
    return (
      
      <div>
        {value === 0 && <Climatology showed={this.state.showed}/>}
        {value === 1 && <Seasonal showed={this.state.showed}/>}
        {value === 2 && <Projection showed={this.state.showed}/>}
      </div>
    );
  }

  onClick = () => {
    var showed = this.state.showed
    this.setState({showed: !showed});
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    console.log(this.state.edit)
    //TODO: make tabs dynamic
    return (
      <div className={classes.root}>
        <div style={{display: 'flex',flexDirection:'row'}}> 
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            style={{width:'5%', height:'5%', marginRight:'25%'}}
            onClick={(e) => this.onClick(e)}
          >
            <MoreVertIcon style={{fill:'#000000'}}/>
        </IconButton>
        <Tabs
            value={value}
            onChange={this.handleChange}
            centered={true}
            classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
          >
          {this.state.ids.map((n, index) => {
              return(
                <Tab
                  key={index}
                  disableRipple
                  classes={{root: classes.tabRoot, selected: classes.tabSelected }}
                  label={<span style={{ color:'black' }}>{n.label.replace('-', ' ')}</span>}
                  disabled={this.state.edit}
              />
              );
          })}
          </Tabs>
        </div>

          {this.renderContent()}
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);
