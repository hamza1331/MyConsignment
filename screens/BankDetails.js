import React, {Component} from 'react';
import {Text, View,ScrollView,TouchableOpacity,KeyboardAvoidingView,AsyncStorage,ActivityIndicator,ToastAndroid,Platform,Alert} from 'react-native';
import {Icon} from 'react-native-elements';
import {Dropdown} from 'react-native-material-dropdown'
import {SafeAreaView} from 'react-navigation'
import {TextField} from 'react-native-material-textfield'
import {widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
  removeOrientationListener as rol} from 'react-native-responsive-screen';
import { connect } from "react-redux";
import { url } from "./Proxy";
 class Report extends Component{
     constructor(props){
         super(props)
        this.initialState ={    
            uploading:false,
            userData:null,
            account_holder_name:'',
            account_holder_type:'individual',
            routing_number:'',
            account_number:''
            }
         this.state={
             ...this.initialState
         }
         this.handleSubmit=this.handleSubmit.bind(this)
     }
     componentDidMount(){
        AsyncStorage.getItem('userData').then(response=>{
            if(response!==null){
              let user = JSON.parse(response)
             this.setState({
                 userData:user
             })
           }
           })
     }
     handleSubmit(){
         this.setState({
             uploading:true
         })
         let data = {
             routing_number:this.state.routing_number,
             account_holder_name:this.state.account_holder_name,
             account_number:this.state.account_number
         }
         for(let c in data){
             if(data[c]===this.initialState[c])
                {
                this.setState({
                    uploading:false
                })
                Alert.alert("Fill all the required fields")
                return
                }
         }
         let body = {
             ...data,
             firebaseUID:this.props.UID,
             account_holder_type:this.state.account_holder_type
         }
         fetch(url+'/createexternalacc',{method:"POST",body:JSON.stringify(body),headers: { "Content-Type": "application/json" }})
         .then(res=>res.json())
         .then(response=>{
             this.setState({uploading:false})
             if(response.message==="Failed")
                Alert.alert("Failed",'Enter correct info')
            else if(response.message==='Success'){
                Alert.alert("Success","Done")
            }
         })
     }
     render() {
       return (
        <SafeAreaView style={{flex:1}}>
        <View style={{flexDirection:'row',borderBottomColor:'gray',borderBottomWidth:2,paddingBottom:5}}>
        <TouchableOpacity onPress={()=>this.props.navigation.navigate('PaymentInfo')}><Text style={{fontSize:30,marginLeft:10,marginTop:10}}>X</Text></TouchableOpacity>
        <Text style={{fontSize:20,marginLeft:20,marginTop:20,fontWeight:'bold'}}>Bank Acount Details</Text>
        <Icon
        name='ios-arrow-dropdown'
        type='ionicon'
        color='black'
        size={15}
        containerStyle={{marginTop:28,marginLeft:10}}
         />
        </View>
        <ScrollView>
        
        <View style={{marginTop:40}}>
    <KeyboardAvoidingView>
  <TextField
        label='Account Holder Name'
        value={this.state.account_holder_name}
        onChangeText={ (account_holder_name) => this.setState({ account_holder_name }) }
        tintColor="darkred"
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </KeyboardAvoidingView>
      <KeyboardAvoidingView>
        <TextField
        label='Account Number'
        value={this.state.account_number}
        onChangeText={ (account_number) => this.setState({ account_number }) }
        tintColor="darkred"
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </KeyboardAvoidingView>
      <KeyboardAvoidingView>
        <TextField
        label='Routing Number'
        value={this.state.routing_number}
        onChangeText={ (routing_number) => this.setState({ routing_number }) }
        tintColor="darkred"
        placeholder='Routing Number on Bank Check'
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </KeyboardAvoidingView>
     
  </View>
  <View style={{alignItems:'center',marginTop:10,marginBottom:10}}>
  <TouchableOpacity disabled={this.state.uploading} onPress={this.handleSubmit} style={{width:wp('90%'),height:hp('5%'),backgroundColor:'darkred',borderRadius:15,alignItems:'center',justifyContent:'center'}}>
    {this.state.uploading===false && <Text style={{color:'white',fontSize:20}}>SUBMIT</Text>}
    {this.state.uploading===true && <ActivityIndicator size={20} animating color='white'/>}
  </TouchableOpacity>
  </View>
        </ScrollView>
          </SafeAreaView>
       )
     }
 }
 function mapStateToProps(state){
  return({
      UID:state.rootReducer.UID
  })
}
function mapActionsToProps(dispatch){
  return({
      
  })
}
export default connect(mapStateToProps,mapActionsToProps)(Report)
