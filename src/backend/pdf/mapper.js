const sizes = require('./template/index.json')
const typos = require('./typos.json')

export function stateMapper(canvasState){
    let buildingBlocks=canvasState.buildingBlocks;
    let result={TITLE: canvasState.title, TITEL: canvasState.title};
    buildingBlocks.forEach((block)=>{
        let newTitle=block.title;
        if(typos[newTitle]){
            //console.log("Fixing typo: "+newTitle);
            newTitle=typos[newTitle];
        }
        newTitle=newTitle.toUpperCase().replace(/[^A-Z]/g,'');
        
        //console.log(block.title+" --> "+newTitle);
        block.entries.forEach((entry,index)=>{
            result[newTitle+"_"+index]=entry.content.text;
        });
    });
    //console.log("PDF-Result: ",result)
    return result;
}

export function getTemplatePath(type, size="default"){
    if(!sizes[type]) return null;
    let sizePaths=sizes[type];
    let selectedSize=sizeSelector(Object.keys(sizePaths),size);
    if(!selectedSize) return null;
    return "../../pdf/template/"+sizePaths[selectedSize];
}

function sizeSelector(availableSizes, size="default"){
    if(availableSizes.length<1) return null;
    if(availableSizes.length==1) return availableSizes[0];
    if(availableSizes.indexOf(size)>-1) return size;
    if(availableSizes.indexOf("default")>-1) return "default";
    return null;
}