import React, { Component } from 'react'
import { Dropdown, Label, Popup } from 'semantic-ui-react'
import {ChromePicker}  from 'react-color'
export const SemanticColors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']
export const CSSColors = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"]

const HexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

const ColorOptions = CSSColors.map((color) => ({
    key: color,
    text: color,
    value: color,
    content: (SemanticColors.indexOf(color) < 0 ?
        <Label content={color} style={{ "backgroundColor": color, "borderColor": color }} /> :
        <Label color={color} content={color} />)
}))

export class SemanticColorPicker extends Component {

    changeSearchValid(evt, data) {
        this.props.onChange(data.value)
    }

    changeSearch(evt, data) {
        if (!HexRegex.test(data.searchQuery)) return;
        this.props.onChange(data.searchQuery);
    }

    UNSAFE_componentWillMount() {
        this.setState({ color: this.props.color || "red" })
    }

    render() {
        let colorProp=this.props.color||"red";
        return <span>
            {this.props.readonly?<Label content="Color" pointing="right"/>:
                <Popup trigger={<Label as="a" content="Color" pointing="right" />} on='click' position="bottom left">
                    <ChromePicker color={HexRegex.test(colorProp)?colorProp:"#ff0000"} disableAlpha onChangeComplete={(color)=>this.props.onChange(color.hex)}/>
                </Popup>
            }
            <Dropdown disabled={this.props.readonly} search selection selectOnNavigation={false} selectOnBlur={false} options={
                ColorOptions
            }
                value={colorProp} text={colorProp}
                onChange={this.changeSearchValid.bind(this)}
                onSearchChange={this.changeSearch.bind(this)}
            >
            </Dropdown>&ensp;{this.props.example && this.props.example(colorProp)}</span>
    }
}