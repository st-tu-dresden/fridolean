import {featureList} from "../../features/index.js";
import {changeCanvasOptions} from '../../Containers/CanvasEditor/actions';

var fid ="markdown";
export var canvas=null;

export function enable() {
  if (!featureList[fid].enabled) {
    canvas.props.dispatch(changeCanvasOptions(canvas.state.values.canvasID, { ...canvas.props.store.persistent.canvases[canvas.state.values.canvasID].options, enableMarkdown: true }));
    // console.log("markdown enabled");
  }
  featureList[fid].enabled = true;
}

export function disable() {
  if (featureList[fid].enabled) {
    canvas.props.dispatch(changeCanvasOptions(canvas.state.values.canvasID, { ...canvas.props.store.persistent.canvases[canvas.state.values.canvasID].options, enableMarkdown: false }));
    // console.log("markdown disabled");
  }
  featureList[fid].enabled = false;
}

export function getParams(editor) {
  canvas = editor;
  // console.log("params get!", canvas);
}

export function toggle() {
  // console.log(canvas.props.store.persistent.canvases[canvas.state.values.canvasID].options.enableMarkdown);
  if (!featureList[fid].enabled) {
    enable();
  } else {
    disable();
    }
}
