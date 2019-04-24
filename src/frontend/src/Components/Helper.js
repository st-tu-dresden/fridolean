import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { SharedSnackbarConsumer } from '../Containers/CanvasEditor/SharedSnackbarProvider';

const helpText=require("./HelpText.json")
const verbose=false
let queue = []

export class Helper extends Component{

    //queue = [];

    state = {
        open: false,
        messageInfo: {}
    };

    handleClick = (hovermsg, clickmsg) => () => {
        queue.push({
            hovermsg,
            clickmsg,
            key: new Date().getTime()
        });
        if (this.state.open) {
            // immediately begin dismissing current message
            // to start showing new one
            //this.setState({ open: false });
            this.handleExited();
        } else {
            this.processQueue();
        }
    };

    processQueue = () => {
        if (queue.length > 0) {
            this.setState({
                open: true,
                messageInfo: queue.shift()
            });
        }
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ open: false, messageInfo: {}, });
    };

    handleExited = () => {
        this.setState({ open: false, messageInfo: {}, });
        this.processQueue();
    };

    render(){
        let hoverText = this.getText("hover",false)
        let clickText = this.getText("click",true)
        if(!hoverText && !clickText){
            if(verbose)
                return <Icon color="red" name="warning sign" title={`Missing help for '${this.props.topic}'`}/>
            else
                return ""
        }
        return (
            <SharedSnackbarConsumer>
                {({ openSnackbar }) => 
                    (<Icon name="question circle"
                        link={!!clickText}
                        onClick = {() => openSnackbar(hoverText, clickText)}
                        title={hoverText}
                    />)
                } 
            </SharedSnackbarConsumer>
            )
    }

    getText(source=undefined,useCommon=true){
        let text=helpText[this.props.topic]
        if(!text)
            return undefined
        if(typeof text === "string")
            return (source===undefined||useCommon?text:undefined)
        else
            return (text[source])
    }
}
