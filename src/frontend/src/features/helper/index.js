import {featureList} from "../../features/index.js";

const fid = "helper";
var grid = null;

export function enable() {
  if (!featureList[fid].enabled) {
    grid.setState({helperState: true});
  }
  featureList[fid].enabled = true;
}

export function disable() {
  if (featureList[fid].enabled) {
    grid.setState({helperState: false});
  }
  featureList[fid].enabled = false;
}

export function getCanvasGrid(canvasGrid) {
  grid = canvasGrid;
}

export function toggle() {
  if (!featureList[fid].enabled) {
    enable();
  } else {
      disable();
    }
}
