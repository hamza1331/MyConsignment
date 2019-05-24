import React, {Component} from 'react';
import { View,ScrollView,Image,KeyboardAvoidingView,Dimensions,Text,ActivityIndicator,Alert,AsyncStorage} from 'react-native';
import {Button,SocialIcon} from 'react-native-elements';
import {widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
  removeOrientationListener as rol} from 'react-native-responsive-screen';
import { url } from "./Proxy";
import { GoogleSignin } from 'react-native-google-signin';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import firebase from 'react-native-firebase'
import { connect } from "react-redux";
import { setUIDAction } from "../store/actions/actions";
class ProviderLogin extends Component{
    constructor(props){
      super(props)
      this.state={
        pass:"",
        email:'',
        orientation:'',
        loading:false,
        showLogo:false
    }
      this.facebookLogin=this.facebookLogin.bind(this)
     this.googleLogin=this.googleLogin.bind(this)
    
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
      async googleLogin() {
        try {
          // add any configuration settings here:      
      await GoogleSignin.signIn().then(user=>{

          const credential = firebase.auth.GoogleAuthProvider.credential(user.idToken, user.accessToken)
          // login with credential
          firebase.auth().signInWithCredential(credential).then(u=>{
          let user = u.user
          fetch(url+'/api/checkgoogle',{method:"POST",body:JSON.stringify(user),headers: { "Content-Type": "application/json" }})
          .then(res=>res.json())
          .then(data=>{
            if(data.message==='Success'){
              AsyncStorage.setItem('userData',JSON.stringify(data.doc))
              this.props.setUID(data.doc.firebaseUID)
              this.props.navigation.navigate('HomeScreen')
            }
          })
          }).catch(err=>console.log(err))
      
        })
      
          // create a new firebase credential with the token
        } catch (e) {
          console.error(e);
        }
      }
      async facebookLogin() {
        try {
          const result = await LoginManager.logInWithReadPermissions(['public_profile', 'email','user_friends']);
      
          if (result.isCancelled) {
            // handle this however suites the flow of your app
            throw new Error('User cancelled request'); 
          }
      
      
          // get the access token
          const data = await AccessToken.getCurrentAccessToken();
      
          if (!data) {
            // handle this however suites the flow of your app
            throw new Error('Something went wrong obtaining the users access token');
          }
      
          // create a new firebase credential with the token
          const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
      
          // login with credential
          const firebaseUserCredential = await firebase.auth().signInWithCredential(credential);
          /**
           displayName,
           uid,
           email,
           photoURL
           */
          let userData = firebaseUserCredential.user.toJSON()
          let user = {
            firebaseUID:userData.uid,
            isLoggedIn:true,
            profilePic:userData.photoURL,
            fName:userData.displayName,
            email:userData.email
          }
          fetch(url+'/api/fbLogin',{method:"PUT",body:JSON.stringify(user),headers: { "Content-Type": "application/json" }})
          .then(res=>res.json()).then(data=>{
            this.setState({loading:false})
            if(data.error)
            Alert.alert("Failed",data.message)
            else
            {
              this.setState({loading:false})
              AsyncStorage.setItem('userData',JSON.stringify(data.doc))
              this.props.setUID(data.doc.firebaseUID)
              this.props.navigation.navigate('HomeScreen')
            }
          }).catch(err=>console.log(err))
        } catch (e) {
          console.error(e);
        }
      }
      async componentDidMount() {
        loc(this);
        this.getOrientation();
    
        Dimensions.addEventListener( 'change', () =>
        {
          this.getOrientation();
        });
        await GoogleSignin.configure({
          webClientId:'1020995126307-a3rru7s0p9g7vktqp1baf2btok5q2shk.apps.googleusercontent.com'
        })
      
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
          source={require('./my1.png')}
          style={{width:wp('80%'),height:(this.state.orientation==="portrait")?hp('35%'):hp('89%')}}
          />
          </View>
          <SocialIcon
          title='Sign In With Facebook'
          button
          raised
          onPress={this.facebookLogin}
          style={{width:'50%',alignSelf:'center'}}
          type='facebook'
        />
        <SocialIcon
        button
        raised
        onPress={this.googleLogin}
        title='Login With Google'
        style={{width:'50%',alignSelf:'center'}}
        type='google-plus-official'
        />

        <KeyboardAvoidingView style={{justifyContenty:'center',width:wp('100%'),height:(this.state.orientation==="portrait")?hp('30%'):hp('50%')}}>
       
          <Text style={{margin:5,fontWeight:'bold',textAlign:'center'}}>OR</Text>
          <Button title="Continue with Email" onPress={()=>this.props.navigation.navigate('LoginScreen')}  containerStyle={{width:'60%',alignSelf:'center',borderRadius:50}}  buttonStyle={{backgroundColor:'seagreen',alignSelf:'center',borderRadius:50,width:'100%'}} />
       </KeyboardAvoidingView>
   </ScrollView>
      
        )
        else if(this.state.showLogo===false&&this.state.loading===true)
        return(
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <ActivityIndicator animating size={40} color='seagreen'/>
          </View>
        )
      }
}

function mapStateToProps(state){
    return({
        selectedCategory:state.rootReducer.selectedCategory,
        UID:state.rootReducer.UID
    })
  }
  function mapActionsToProps(dispatch){
    return({
      setUID:(UID)=>{
        dispatch(setUIDAction(UID))
      }
    })
  }

export default connect(mapStateToProps, mapActionsToProps)(ProviderLogin)
