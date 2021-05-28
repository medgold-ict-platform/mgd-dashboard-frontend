import React, { Component } from 'react';
import Modal from 'react-modal';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
// import Iframe from 'react-iframe'
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FeedbackIcon from '@material-ui/icons/Feedback';
import Iframe from '@trendmicro/react-iframe';


class Panel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPaneOpen: false,
            isPaneOpenLeft: false
        };
    }
 
    componentDidMount() {
        Modal.setAppElement(this.el);
    }

    render() {
        return <div ref={ref => this.el = ref} >
             <div style={{display:"flex" , flexDirection:"row"}} onClick={() => this.setState({ isPaneOpen: true })}>
                <Tooltip  title = '' style={{margin:'0 0 0 0', padding:0}}>
                    <IconButton onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdqPHXMSTS_AKKTDEKajxtF7GZBXCcPgJAzgA11MP0j6pSVSw/viewform?usp=sf_link')} style={{marginRight:'1%'}}>
                        <text style={{elevation:1 ,fontSize:'50%', color:'#000000', fontFamily: "sans-serif", fontStyle:'italic', marginRight:'2%'}}>Leave your feedback</text>
                        <FeedbackIcon style={{fill:'#8A3D44', size:'small',  padding:0}}/>
                    </IconButton>
                </Tooltip>
            </div>
            <div>
            {/* <SlidingPane
                style={{height:'100%', width:300, position:'absolute'}}
                isOpen={ this.state.isPaneOpen }
                title='FeedBack Form'
                onRequestClose={ () => {
                    // triggered on "<" on left top click or on outside click
                    this.setState({ isPaneOpen: false });
                } }>
                    <Iframe src='https://docs.google.com/forms/d/e/1FAIpQLSdqPHXMSTS_AKKTDEKajxtF7GZBXCcPgJAzgA11MP0j6pSVSw/viewform?usp=sf_link'
                        width="100%"
                        height="100%"
                        frameborder= '0' 
                        marginwidth= '0' 
                        marginheight= '0' 
                        // style= 'border: none'
                        display="initial"
                        max-width="100%"
                        max-height="100vh"
                        position="absolute"/>
                </SlidingPane> */}
            </div>
        </div>;
    }
}
 
export default Panel;
 