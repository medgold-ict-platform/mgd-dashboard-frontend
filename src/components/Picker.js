import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Moment from 'moment';
import '../mapButton.css';

const styles = {
  root:{
    display: 'inline',
    '&:hover':{
      background:'#D7B062',
      color: '#FFFFFF',
      fontWeight: 'bold',
      border: '1px solid',
      borderColor:'#000000'
    },
    color: '#FFFFFF',
    background:'#595b5c',
    minWidth:'10%',
    fontWeight: 'bold',
    border: '1px solid',
    minHeight:'2%',
    fontSize:10 ,
    height:'100%',
    width:'100%'
  },
  active:{
    background:'#D7B062 !important',
    color: '#FFFFFF !important',
    borderColor: '#000000',
    minWidth:'10%',
    minHeight:'2%',
    fontWeight: 'bold',
    fontSize:10,
    border: '1px solid',
    height:'100%',
    width:'100%'
  }
};


class Picker extends React.Component{
  slider = React.createRef();
  constructor(props){
    super(props);
    this.state = {
        active: props.active,
        checked: []
    }}

    componentDidUpdate(prevprops){
      if(this.props.last !== prevprops.last){
        console.log(this.props.last)
        console.log(this.slider)
        this.slider.slickGoTo(this.props.last)
      }
    }


    handleClick(e){
      this.setState({active: e})
    }

    render() {
      var settings = {
        dots: false,
        infinite: true,
        speed: 700,
        slidesToShow: this.props.slidesToShow,
        slidesToScroll: this.props.slidesToScroll,
        rows: this.props.rows,
        // focusOnSelect:true,
        initialSlide: this.props.last,
        // slideIndex: this.props.last+1
      };
      const { classes, children, className, ...other } = this.props;
      let i = 0
      return (
        <div style={{marginLeft:'15%', marginRight:'15%', marginBottom:'5%'}}>
          <Slider ref={slider => (this.slider = slider)} {...settings} style={{fontSize:0}}> 
            {this.props.values.map((e) =>{
              return(
                <div class="slider-nav">
                    <Button variant='outlined' className={this.props.active === e ? classes.active : clsx(classes.root, className)} 
                    onClick={(event) => this.props.onClick(event, e)}>
                    {this.props.type === 'm' ? Moment(e, 'M').format('MMM') : e}
                    </Button> 
                </div>
              );})}
          </Slider>
        </div>
          
    );
  }
}

Picker.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default withStyles(styles)(Picker);
