import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import $ from 'jquery';
import {changeCanvasConfiguration} from '../../../Containers/CanvasEditor/actions';
import {featureList} from "../../../features/index.js";

var configXml = "";
var configXmlString = "";
var canvasEditor = null;

export function getConfig() {
  return configXml;
}

export function getConfigString() {
  return configXmlString;
}

export function getCanvasEditor(canEdit) {
  canvasEditor = canEdit;
}

function featureManager(featureName) {
  // var featureKeys = Object.keys(featureList);
  var feature = require("../../../features/" + featureName + "/index");
  if ("onMoveEntry" in feature) {
    featureList[featureName].onMoveEntry = feature.onMoveEntry;
  }
  return feature;
}

// Setting Button with feature model and configurator
export class FeatureSetting extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        titleError: false,
        disabled: true,
        configXml: null,
      };
      this.parentObj = props.parentObj;
      this.loadModel = this.loadModel.bind(this);
    }

    saveChanges() {
        this.setState({open: false});
    }

    loadModel() {
      // TODO rename temp to something better
      var temp = this;
      // changeTheme("dark");
      // load xml file from the same directory as index.html
      $.ajax("/feature_model.xml").then(function(xml) {
       // creating a model from the xml file
       var model = new window.Model(new window.XmlModel(xml));

       // eslint-disable-next-line
       var configurator = new window.Configurator( // the feature configurator
         model,
         { // additional options
           target: window.$(".configurator"), // where to render the configurator
           renderer: { // options for the ConfigurationRenderer
             // in every function "this" refers to the ConfigurationRenderer,
             // so you can access this.configuration and this.model
              renderAround: function(fn) { // used to supply additional html on each rerender
                 var html = "<p>This configuration is " + (this.configuration.isValid() ? "<b>valid</b>" : "<b>invalid</b>") +
                     " and " + (this.configuration.isComplete() ? "<b>complete</b>" : "<b>incomplete</b>") + ".</p>";
                 html += fn();
                 html += '<Button class="export" ' + (this.configuration.isComplete() ? "" : "disabled") + '>Save Configuration</Button>';
                 this.configuration.isComplete() ? temp.setState({disabled: false}) : temp.setState({disabled: true});
                 return html;
              },
              afterRender: function() { // hook called after rendering
                 $(".export").click(() => {
                  // TODO configXml should not only be stored when pressing on export
                  configXml = $.parseXML(this.configuration.serialize());
                  configXmlString = this.configuration.serialize().toString();
                  // temp.parentObj.configXml = configXmlString;
                  switch (temp.props.access) {
                    case "pre":
                      temp.setState({configXml: configXml});
                      console.log(temp.state.configXml);
                      break;
                    case "post":
                      canvasEditor.props.dispatch(changeCanvasConfiguration(temp.parentObj.props.canvasid, configXmlString));
                      console.log("saved: ", temp.parentObj.props.canvases[temp.parentObj.props.canvasid].configuration);

                      // console.log(configXml);
                      $(configXml).find("feature").each((i, attr) => {
                        let feature = $(attr);
                        if(feature.attr("manual") !== "undefined") { // optional feature that has to be either selected or unselected
                          switch (feature.attr("name")) {
                            case "drag and drop":
                              if ($(attr).attr("manual") === "selected") {
                                featureManager("moveEntry").enable();
                              } else if ($(attr).attr("manual") === "unselected") {
                                featureManager("moveEntry").disable();
                              }
                              break;
                            case "markdown":
                              if ($(attr).attr("manual") === "selected") {
                                featureManager("markdown").enable();
                              } else if ($(attr).attr("manual") === "unselected") {
                                featureManager("markdown").disable();
                              }
                              break;
                            case "helper":
                              if ($(attr).attr("manual") === "selected") {
                                featureManager("helper").enable();
                              } else if ($(attr).attr("manual") === "unselected") {
                                featureManager("helper").disable();
                              }
                              break;
                            default:
                              break;
                          }
                        }
                        if((feature.attr("automatic") === "undefined" && feature.attr("manual") === "selected")
                          || (feature.attr("automatic") === "selected" && feature.attr("manual") === "undefined")) { // for alternative cases where one or the other is chosen
                            switch (feature.attr("name")) {
                              case "Light Mode":
                                featureManager("themes").changeTheme("light");
                                break;
                              case "Dark Mode":
                                featureManager("themes").changeTheme("dark");
                                break;
                              default:
                                break;
                            }
                          }
                      });

                      break;
                    default:
                      console.log("not working");
                      break;
                  }
                  temp.setState({open: false});
                 });
              }
           }
         },
         window.Configuration.fromXml(model, (temp.props.access === "pre") ? temp.state.configXml : temp.parentObj.props.canvases[temp.parentObj.props.canvasid].configuration)
       );
    });
  }

    render() {
        return (
            <Modal trigger={
              <Button basic onClick={() => {this.setState({open: true})}} >Settings</Button>
            }
              open={this.state.open}
              onOpen={() => {this.setState({open: true}); this.loadModel()}}
              onClose={() => this.setState({open: false})}
            closeIcon>
              <Modal.Header>
                <Button secondary circular onClick={() => this.setState({open: false})} icon="arrow left"/>
                &ensp;
                Feature Configuration
              </Modal.Header>
              <Modal.Content> {/* Configurator rendered here */}
                <div className="configurator"></div>
                <pre></pre>
              </Modal.Content>
              {/*<Modal.Actions>
                <Button
                  id="saveButton"
                  className="Save"
                  primary
                  content="Save"
                  onClick={() => this.saveChanges()}
                  disabled={this.state.disabled}
                />
              </Modal.Actions>*/}
            </Modal>
                )
    }
}
