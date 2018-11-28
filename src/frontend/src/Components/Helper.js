import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
const helpText=require("./HelpText.json")
const verbose=false

export class Helper extends Component{

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
            <Icon name="question circle"
            link={!!clickText}
            onClick={(clickText?()=>alert(clickText):undefined)}
            title={hoverText}
            />)
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