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
            title:'',
            description:'',
            option:'Suggestion',
            uploading:false,
            userData:null
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
         if(this.state.title.length===0){
             Alert.alert('Failed',"Enter title")
         }
        else if(this.state.description.length<10){
            Alert.alert('Failed','Description must be at least 10 Characters long!')
         }
         else{
             let data = {
                 title:this.state.title,
                 description:this.state.description,
                 type:this.state.option,
                 email:this.state.userData.email,
                 fName:this.state.userData.fName,
                 firebaseUID:this.props.UID
             }
            fetch(url+'/api/report',{method:"POST",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
            .then(res=>res.json())
            .then(data=>{
                if(data.message==='Success')
                    {
                        if(Platform.OS==='android'){
                            ToastAndroid.showWithGravityAndOffset(
                              'Request Submitted, We\'ll contact you Shortly!!',
                              ToastAndroid.LONG,
                              ToastAndroid.BOTTOM,
                              25,
                              50,
                            );
                          }
                        this.setState({
                            ...this.initialState
                        })
                    }
            }).catch(err=>console.log(err))
         }
     }
     render() {
      const Options=[{
        value:'Suggestion'
      },{
        value:'Report'
      },
      {
          value:'Query'
      }
    ]
       return (
        <SafeAreaView style={{flex:1}}>
        <View style={{flexDirection:'row',borderBottomColor:'gray',borderBottomWidth:2,paddingBottom:5}}>
        <TouchableOpacity onPress={()=>this.props.navigation.navigate('HomeScreen')}><Text style={{fontSize:30,marginLeft:10,marginTop:10}}>X</Text></TouchableOpacity>
        <Text style={{fontSize:20,marginLeft:20,marginTop:20,fontWeight:'bold'}}>REPORT/SUGGESTION</Text>
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
        label='Title'
        value={this.state.title}
        onChangeText={ (title) => this.setState({ title }) }
        tintColor="darkred"
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </KeyboardAvoidingView>
      <KeyboardAvoidingView>
        <TextField
        label='Description'
        value={this.state.description}
        onChangeText={ (description) => this.setState({ description }) }
        tintColor="darkred"
        containerStyle={{marginLeft:15,marginRight:15}}
   characterRestriction={600}
      />
      </KeyboardAvoidingView>
      <View style={{marginLeft:7,marginTop:7,flexDirection:'row',justifyContent:'center'}}>
      <View style={{flexBasis:'80%'}}>
      <Dropdown containerStyle={{marginLeft:3,marginRight:8,width:'100%',}} 
        label='Options'
        itemTextStyle={{fontSize:18,fontWeight:'bold'}}
      value={this.state.option}
      data={Options}
      onChangeText={text=>this.setState({option:text})}
/>
      </View>
      </View>
     
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
