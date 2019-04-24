// import {featureList} from "../../features/index.js";

// const fid = "themes";

var Themes = function(theme) {
  this.theme = theme;
};

Themes.prototype.apply = function() {
	return this.theme();
};

var lightMode = function() {
  var size = document.querySelectorAll(".ui.segment").length;
  for (let i = 0; i < size; i++) {
    document.querySelectorAll(".ui.segment")[i].style="background-color:none";
  }
};

var darkMode = function() {
  var size = document.querySelectorAll(".ui.segment").length;
  for (let i = 0; i < size; i++) {
    document.querySelectorAll(".ui.segment")[i].style="background-color:#353C51";
  }
};

export function changeTheme(theme) {
  switch (theme) {
    case "light":
      var lightTheme = new Themes(lightMode);
      lightTheme.apply();
      console.log("light theme set");
      break;
    case "dark":
      var darkTheme = new Themes(darkMode);
      darkTheme.apply();
      console.log("dark theme set");
      break;
    default:
      console.log("theme does not exist");
      break;
  }
}
