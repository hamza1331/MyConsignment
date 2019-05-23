import React, {Component} from 'react';
import {Text, View,Alert,ActivityIndicator,ScrollView,AsyncStorage} from 'react-native';
import {Button} from 'react-native-elements';
import firebase from 'react-native-firebase'
import {TextField} from 'react-native-material-textfield'
import { connect } from "react-redux";
import KeyboardAwareScrollView from "react-native-keyboard-aware-scroll-view"
import { url } from "./Proxy";
class Signup extends Component{
    constructor(props){
      super(props)
      this.state={
        name:"",
        pass:"",
        email:'',
        loading:false
      }
      this.handleSubmit=this.handleSubmit.bind(this)
    }
       async handleSubmit(){
       this.setState({loading:true})
        await firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.pass).then((user)=>{
          let userData = {
            fName:this.state.name,
            email:this.state.email,
            firebaseUID:user.user.uid
          }
          console.log(userData)
          fetch(url+'/api/addUser',{method:"POST",body:JSON.stringify(userData),headers: { "Content-Type": "application/json" }}).then(res=>res.json()).then(data=>{
            this.setState({loading:false})
            if(data.error)
            Alert.alert("Failed",data.message)
            else
            {
              this.setState({loading:false})
              AsyncStorage.setItem('userData',data.user)
              this.props.navigation.navigate('LoginScreen')
            }
          }).catch(err=>console.log(err))
        }).catch(err=>{ 
         this.setState({loading:false});
         Alert.alert('Failed',err.message)})
      }
      render(){
        if(this.state.loading===false){
          return(
            <ScrollView style={{flex:1,backgroundColor:'white'}}>


            <View style={{marginTop:35,marginLeft:20}}>
              <Text style={{color:'brown',fontSize:40}}>Join Pure Artisan</Text>
            </View>
            <TextField style={{alignSelf:'center'}}
            label='Full Name'
            value={this.state.name}
            onChangeText={ (name) => this.setState({ name }) }
            tintColor="darkred"
            containerStyle={{marginLeft:15,marginRight:15,marginTop:20}}
            
            />
          
            <TextField style={{alignSelf:'center'}}
            label='Email'
            value={this.state.email}
            onChangeText={ (email) => this.setState({ email }) }
            tintColor="darkred"
            containerStyle={{marginLeft:15,marginRight:15}}
            keyboardType='email-address'
            returnKeyType='next'
            enablesReturnKeyAutomatically={true}
            />
          
            <TextField style={{alignSelf:'center'}}
            label='Password'
            value={this.state.pass}
            onChangeText={ (pass) => this.setState({ pass }) }
            tintColor="darkred"
            secureTextEntry={true}
            containerStyle={{marginLeft:15,marginRight:15}}
            
            />
          <View style={{marginLeft:20,marginTop:40,width:'70%'}}>
            <Text>By registering or logging in, you accept our Terms and Privacy Policy.</Text>
          </View>
          
          
          <View style={{alignItems:'center',justifyContenty:'center',marginTop:65}}>
            <Button title="Register"  onPress={this.handleSubmit} containerStyle={{borderRadius:20,width:'80%'}}  buttonStyle={{backgroundColor:'#B1A54E'}} />
         </View>
          <View style={{alignItems:'center',marginTop:10}}>
            <Text>Already a member?</Text>
            <Text onPress={()=>this.props.navigation.navigate('LoginScreen')} style={{color:'darkred',fontSize:20}}>Go to Login</Text>
          </View>
     </ScrollView>
          )
        }
        else
        return(
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator size={40} animating color='darkred'/>
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
      
  })
}
export default connect(mapStateToProps,mapActionsToProps)(Signup)