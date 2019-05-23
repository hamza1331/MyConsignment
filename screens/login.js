import React, {Component} from 'react';
import { View,ScrollView,Image,KeyboardAvoidingView,Dimensions,Text,ActivityIndicator,Alert,AsyncStorage} from 'react-native';
import {Button} from 'react-native-elements';
import {TextField} from 'react-native-material-textfield'
import {widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
  removeOrientationListener as rol} from 'react-native-responsive-screen';
import firebase from 'react-native-firebase'
import { url } from "./Proxy";
import { connect } from "react-redux";
import { setUIDAction } from "../store/actions/actions";
class LoginScreen extends Component{
    constructor(props){
      super(props)
      this.state={
        pass:"",
        email:'',
        orientation:'',
        loading:false,
        showLogo:false
    }
      this.handleSubmit=this.handleSubmit.bind(this)
      }
      getOrientation = () =>
      {
        if( this.refs.rootView )
        {
            if( Dimensions.get('window').width < Dimensions.get('window').height )
            {
              this.setState({ orientation: 'portrait' });
            }
            else
            {
              this.setState({ orientation: 'landscape' });
            }
        }
      }
      handleSubmit(){
        this.setState({
          loading:true
        })
         firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.pass).then((user)=>{

          let userData = {
            firebaseUID:user.user.uid
          }
          console.log('login firebase',user.user)
          fetch(url+'/api/login',{method:"PUT",body:JSON.stringify(userData),headers: { "Content-Type": "application/json" }}).then(res=>res.json()).then(data=>{
            this.setState({loading:false})
            if(data.error)
            Alert.alert("Failed",data.message)
            else
            {
              this.setState({loading:false})
              console.log(data.user)
              AsyncStorage.setItem('userData',JSON.stringify(data.user))
              this.props.setUID(data.user.firebaseUID)
              this.props.navigation.navigate('HomeScreen')
            }
          }).catch(err=>console.log(err))
        }).catch(err=>{ 
         this.setState({loading:false});
         Alert.alert('Failed',err.message)})
      }
      componentDidMount() {
        loc(this);
        this.getOrientation();
    
        Dimensions.addEventListener( 'change', () =>
        {
          this.getOrientation();
        });
      
      }
      componentWillUnMount() {
        rol();
      }
      render(){
        if(this.state.loading===false&&this.state.showLogo==false)
        return(
          <ScrollView ref="rootView" style={{flex:1,backgroundColor:'white'}}>
          <View style={{alignItems:'center',marginTop:2,width:wp('100%'),height:(this.state.orientation==="portrait")?hp('35%'):hp('88.5%')}}>
          <Image 
          source={require('./art.jpg')}
          style={{width:wp('80%'),height:(this.state.orientation==="portrait")?hp('35%'):hp('89%')}}
          />
          </View>
          <View   style={{width:wp('100%'),height:hp('15%')}}>
          <TextField 
          label='Email'
          value={this.state.email}
          onChangeText={ (email) => this.setState({ email }) }
          tintColor="darkred"
          containerStyle={{marginLeft:15,marginRight:15,marginTop:2}}
          keyboardType='email-address'
        />
         <KeyboardAvoidingView>    
             <TextField 
          label='Password'
          value={this.state.pass}
          onChangeText={ (pass) => this.setState({ pass }) }
          tintColor="darkred"
          containerStyle={{marginLeft:15,marginRight:15,marginTop:10}}
          secureTextEntry={true}
          
        />
        </KeyboardAvoidingView>
           
          </View>
        
        
        <KeyboardAvoidingView style={{alignItems:'center',justifyContenty:'center',marginTop:(this.state.orientation==='portrait')?90:130,width:wp('100%'),height:(this.state.orientation==="portrait")?hp('30%'):hp('50%')}}>
        <Button title="Login" onPress={this.handleSubmit} containerStyle={{borderRadius:15,width:'50%',marginBottom:5}}  buttonStyle={{backgroundColor:'#B17E4E',borderRadius:10}} />
          <Text style={{margin:5,fontWeight:'bold'}}>OR</Text>
          <Button title="Register Free" onPress={()=>this.props.navigation.navigate('Signup')}  containerStyle={{borderRadius:15,width:'50%'}}  buttonStyle={{backgroundColor:'#7F7472',borderRadius:10}} />
       </KeyboardAvoidingView>
   </ScrollView>
      
        )
        else if(this.state.showLogo===false&&this.state.loading===true)
        return(
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
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

export default connect(mapStateToProps,mapActionsToProps)(LoginScreen)