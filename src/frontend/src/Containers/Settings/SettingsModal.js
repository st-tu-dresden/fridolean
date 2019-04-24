import React, {Component} from "react"
import {Modal, Breadcrumb, Button} from "semantic-ui-react"
import EntrySettings from './EntrySettings'
import CanvasSettings from './CanvasSettings'
import TagSettings from './TagSettings'
import ProjectSettings from './ProjectSettings'

const modalStyle = {
    margin: 'auto 0px 0px auto',
    top: '15%',
};

class SettingsModal extends Component{

    constructor(...args) {
        super(...args);
        this.state=this.state||{};
        this.loadTarget=this.loadTarget.bind(this);
    }

    UNSAFE_componentWillMount(){
        this.loadTarget(this.props.target);
    }

    loadTarget(target){
        if(!target)
            this.setState({open:false})
        else
            this.setState({
                open: true,
                canvas: target.canvas||null,
                block: target.block||null,
                entry: target.entry||null,
                tag: target.tag||null
            })
    }

    renderBreadcrumbs(){
        const defaultState={open:true,canvas:null,block:null,entry:null,tag:null}
        let sections=[{key:"Root",content:(<span>Settings <span style={{fontSize:"0.75rem"}}>(MURS)</span></span>)}]
        sections.push({key:"Project",content:this.props.store.title,onClick:()=>this.setState(defaultState)})
        let persistent=this.props.store.persistent;
        if(this.state.canvas){
            let canvas=persistent.canvases[this.state.canvas];
            sections.push({key:"Canvas",content:canvas.title,onClick:()=>this.setState({...defaultState,canvas:canvas._id})})
            if(this.state.block){
                let block=canvas.buildingBlocks[this.state.block]
                sections.push({key:"Block",content:block.title})
                if(this.state.entry){
                    let entry=block.entries[this.state.entry]
                    sections.push({key:"Entry",content:entry.content.title||entry._id,onClick:()=>this.setState({...defaultState,canvas:canvas._id,block:block._id,entry:entry._id})})
                }
            }
        }else if(this.state.tag){
            let tag=this.props.store.persistent.tags[this.state.tag];
            if(!tag)
                tag={_id:0,title:"example",color:"red"}
            sections.push({key:"Tag",content:tag.title,onClick:()=>this.setState({...defaultState,tag:tag._id})})
        }


        const lastSectIndex=sections.length-1
        sections=sections.map((sect,i)=>{
            const active=(i===lastSectIndex)
            const link=(sect.onClick&&!active)||undefined
            return <Breadcrumb.Section link={link} active={active} onClick={link&&sect.onClick} key={sect.key} content={sect.content}/>})
        for (var index = 1; index < sections.length; index+=2) {
            sections.push(null)//increase length by one
            sections.copyWithin(index+1,index)//shift array
            sections[index]=(<Breadcrumb.Divider key={"Divider"+index}/>)
        }
        return (<Breadcrumb size="massive">
        {sections}
        </Breadcrumb>)
    }

    renderCore(){
        if(this.state.canvas){
            if(this.state.block && this.state.entry)
                return <EntrySettings
                    readonly={this.props.readonly}
                    openSettings={this.loadTarget} 
                    store={this.props.store} 
                    dispatch={this.props.dispatch} 
                    canvasID={this.state.canvas} 
                    blockID={this.state.block} 
                    entryID={this.state.entry}/>
            else
                return <CanvasSettings
                    readonly={!!this.props.readonly}
                    openSettings={this.loadTarget}
                    store={this.props.store}
                    dispatch={this.props.dispatch}
                    canvasID={this.state.canvas}/>
        }else if(this.state.tag){
            return <TagSettings
                readonly={!!this.props.readonly}
                openSettings={this.loadTarget}
                store={this.props.store} 
                dispatch={this.props.dispatch} 
                tagID={this.state.tag}/>
        }else
            return <ProjectSettings
                readonly={!!this.props.readonly}
                openSettings={this.loadTarget}
                store={this.props.store}
                dispatch={this.props.dispatch}/>
    }

    render(){
        window.fridoProject=this.props.store;
        return (
        
        <Modal open={this.state.open} style={modalStyle}>
            <Modal.Header>
                <Button secondary circular onClick={this.props.onClose} icon="arrow left"/>
                &ensp;
                {this.renderBreadcrumbs()}
            </Modal.Header>
            <Modal.Content scrolling>
            {this.renderCore()}
            </Modal.Content>
        </Modal>
        )
    }
}

export default SettingsModal
