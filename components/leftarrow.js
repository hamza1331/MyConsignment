import React from 'react'
import {Icon} from 'react-native-elements';
import {View} from 'react-native'
export default class Leftarrow extends React.Component{
render(){
    return(  
        <View>
        <Icon
        name='arrow-round-back'
        type='ionicon'
        color='black'
      />
          </View>
    )
}
}