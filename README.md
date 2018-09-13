
# sajjad-brick-list

this is a  staggered List view for react native (pure Js)


<img src="https://raw.githubusercontent.com/lvlrSajjad/sajjad-brick-list/master/screen.gif" >

## Installation

`$ npm install sajjad-brick-list --save`


## Usage
just be sure that in your list id and span is specified

and use it as below

Props{data (array),
    renderItem (react Component),
    columns (int),
    rowHeight (int) }

```javascript
import SajjadBrickList from 'sajjad-brick-list';
import React, {Component} from 'react';
import {View, Text} from 'react-native'


type Props = {};
export default class App extends Component<Props> {
    constructor(props){
        super(props);
        this.state={
            //Just id (unique) and span (1,2,3, ...) is required
            data:[
                {id: '1', name: "Red", color: "#f44336", span: 1},
                {id: '2', name: "Pink", color: "#E91E63", span: 2},
                {id: '3', name: "Purple", color: "#9C27B0", span: 3},
                {id: '4', name: "Deep Purple", color: "#673AB7", span: 1},
                {id: '5', name: "Indigo", color: "#3F51B5", span: 1},
                {id: '6', name: "Blue", color: "#2196F3", span: 1},
                {id: '7', name: "Light Blue", color: "#03A9F4", span: 3},
                {id: '8', name: "Cyan", color: "#00BCD4", span: 2},
                {id: '9', name: "Teal", color: "#009688", span: 1},
                {id: '10', name: "Green", color: "#4CAF50", span: 1},
                {id: '11', name: "Light Green", color: "#8BC34A", span: 2},
                {id: '12', name: "Lime", color: "#CDDC39", span: 3},
                {id: '13', name: "Yellow", color: "#FFEB3B", span: 2},
                {id: '14', name: "Amber", color: "#FFC107", span: 1},
                {id: '15', name: "Orange", color: "#FF5722", span: 3},
            ],
        }
    }


    render() {
        return (
            <SajjadBrickList
            data = {this.state.data}
            renderItem={(prop)=>renderView(prop)}
            columns = {3}
            />
        );
    }
}
//RenderAnyItem
renderView=(prop)=>{
    return(
        <View key={prop.id} style={{
            margin: 2,
            borderRadius: 2,
            backgroundColor: prop.color,
            flex:1,
            alignItems:'center',
            justifyContent:'center',
        }} >
            <Text style={{color:'white'}}>{prop.name}</Text>
        </View>
    )
};


```
