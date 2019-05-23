import React from 'react'
import {StyleSheet,Button} from'react-native'
export default class MenuButton extends React.Component{
render(){
    return(  
         <Button
         onPress={(e)=>{this.props.navigation.toggleDrawer(e)}}
         style={styles.menuButton}
        title="Menu"
        color="#841584"
       
      />
    )
}
}
const styles=StyleSheet.create({
    menuButton:{
        zIndex:9,
        position:'absolute',
        marginTop:40,
        marginLeft:20,
 }
})