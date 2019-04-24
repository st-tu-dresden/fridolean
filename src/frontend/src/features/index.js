/*
  Array consisting of names of feature folders for management
*/
export const featureList = {
  // "bgColor": {name: "Background Color", enabled: false},
  "markdown": {name: "Markdown", enabled: false},
  "moveEntry": {name: "Drag and Drop", enabled: true},
  "helper": {name: "Helper", enabled: true}
}

export function runCallBacks(name, ...parameters) {
  var featureKeys = Object.keys(featureList);
  featureKeys.forEach((key) => {
    if (!featureList[key].enabled) return;
    if(name in featureList[key]) {
      featureList[key][name](...parameters);
    }
  });
}
