import {featureList} from "../../features/index.js";

const fid = "bgColor";
var size = document.querySelectorAll(".ui.segment").length;

export function enable() {
  // document.querySelectorAll(".ui.large.borderless.stackable.top.fixed.menu")
  if (!featureList[fid].enabled) {
    for (let i = 0; i < size; i++) {
      document.querySelectorAll(".ui.segment")[i].style="background-color:#333333";
    }
  }
  featureList[fid].enabled = true;
}

// export function onAddEntryBefore(editor) {
//   // console.log("add entry - bgcolor");
//   // console.log(editor);
//   var size = document.querySelectorAll(".textarea").length;
//   for (let i = 0; i < size; i++) {
//     document.querySelectorAll(".textarea")[i].style="background-color:green";
//   }
// }

export function disable() {
  if (featureList[fid].enabled) {
    for (let i = 0; i < size; i++) {
    document.querySelectorAll(".ui.segment")[i].style="background-color:none";
    }
  }
  featureList[fid].enabled = false;
}

export function toggle() {
  if (!featureList[fid].enabled) {
    enable();
  } else {
      disable();
    }
}
