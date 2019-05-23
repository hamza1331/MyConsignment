import React, {Component} from 'react';
import { View,Image,ActivityIndicator,Alert,AsyncStorage} from 'react-native';
import { setUIDAction } from "../store/actions/actions";
import { connect } from "react-redux";
import { url } from "./Proxy";
class Splash extends Component {
    constructor(props){
        super(props)
        this.state={
            loading:false,
            showLogo:false
        }
    }
    componentWillMount(){
        this.setState({
          showLogo:true,loading:true
        })
        AsyncStorage.getItem('userData').then(data=>{

          if(data!==null)
          {            
            let user = JSON.parse(data)
            let userData = {
              firebaseUID:user.firebaseUID
            }
            fetch(url+'/api/status',{method:"POST",body:JSON.stringify(userData),headers: { "Content-Type": "application/json" }}).then(res=>res.json()).then(data=>{
              this.setState({loading:false,showLogo:false})
              if(data.error)
              Alert.alert("Failed",data.message)
              else
              {
                if(data.data.isLoggedIn){
                  this.props.setUID(userData.firebaseUID)
                  this.props.navigation.navigate('HomeScreen')
                }
                else{
                    this.props.navigation.navigate('ProviderLogin')
                }
              }
            }).catch(err=>console.log(err))
          }
          else{
                    this.setState({showLogo:false,loading:false})
                    this.props.navigation.navigate('ProviderLogin')
          }
        })
      }
  render() {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Image
      source={require('./splash.jpg')}
      />
     <ActivityIndicator animating size={40} color='darkred'/>
      </View>
    )
  }
}
function mapStateToProps(state){
  return({
  })
}
function mapActionsToProps(dispatch){
  return({
      setUID:(UID)=>{
        dispatch(setUIDAction(UID))
      }
  })
}
export default connect(mapStateToProps,mapActionsToProps)(Splash)