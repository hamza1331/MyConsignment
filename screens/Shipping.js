/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import { Platform, Text, View,ScrollView,ToastAndroid,ActivityIndicator,AsyncStorage} from 'react-native';
import {Header,Icon} from 'react-native-elements';
import {TextField} from 'react-native-material-textfield'

import {Dropdown} from 'react-native-material-dropdown'
import { SafeAreaView } from "react-navigation";
import { url } from "./Proxy";
import { connect } from "react-redux";
class Shipping extends Component {
  constructor(props){
    super(props)
    this. state = {
      domCost:'0',
      domDelivery:{
        from:'0',
        to:'0'
      },
      domesticService:"",
      intCost:'0',
      intDelivery:{
        from:'0',
        to:'0'
      },
      internationalService:"",
      domAdditional:'0',
      intAddtional:'0',
      loading:false
    }
    this.handleSubmit=this.handleSubmit.bind(this)
  }
  componentDidMount(){
    console.log(this.props.UID)
    AsyncStorage.getItem('shippingProfile').then(data=>{
      if(data!==null){
        let shippingProfile = JSON.parse(data)
        this.setState({
          ...shippingProfile
        })
      }
      else{
        fetch(url+'/api/getShipping'+this.props.UID).then(res=>res.json()).then(response=>{
          if(response.data){
            const {data} = response
            let shippingProfile = {
              domCost:data.domCost.toString(),
              domDelivery:{
                from:data.domDelivery.from.toString(),
                to:data.domDelivery.to.toString()
              },
              domesticService:data.domesticService,
              intCost:data.intCost.toString(),
              intDelivery:{
                from:data.intDelivery.from.toString(),
                to:data.intDelivery.to.toString()
              },
              internationalService:data.internationalService,
              domAdditional:data.domAdditional?data.domAdditional.toString():'',
              intAddtional:data.intAddtional?data.intAddtional.toString():''
            }
            AsyncStorage.setItem('shippingProfile',JSON.stringify(shippingProfile))
            this.setState({...shippingProfile})
          }
        })
      }
    })
  }
  handleSubmit(){
    let data = this.state
    this.setState({
      loading:true
    })
    let shippingProfile = {
      domCost:parseInt(data.domCost),
      domDelivery:{
        from:parseInt(data.domDelivery.from),
        to:parseInt(data.domDelivery.to)
      },
      domesticService:data.domesticService,
      intCost:parseInt(data.intCost),
      intDelivery:{
        from:parseInt(data.intDelivery.from),
        to:parseInt(data.intDelivery.to)
      },
      internationalService:data.internationalService,
      domAdditional:parseInt(data.domAdditional),
      intAddtional:parseInt(data.intAddtional),
      firebaseUID:this.props.UID
    }
    fetch(url+'/api/addShipping',{method:"PUT",body:JSON.stringify(shippingProfile),headers: { "Content-Type": "application/json" }}).then(res=>res.json()).then(response=>{
      if(response.message==='Success'){
        this.setState({
          ...data,
          loading:false
        })
        if(Platform.OS==='android'){
          ToastAndroid.showWithGravityAndOffset(
            'Shipping Profile Updated!!',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
        }
      }
    }).catch(err=>console.log(err))
  }
  
  render() {
    const Company=[{
      value:'TCS'
    }
    ,{
      value:'Fedex'
    }
    ,{
      value:'TNTExpress'
    }
    ,{
      value:'DHL'
    }
  ]
    return (
  <SafeAreaView style={{flex:1}}>
     <Header placement="left"
      leftComponent={
    <Icon  containerStyle={{marginBottom:8}}
    name="ios-arrow-round-back"
    type="ionicon"
    color="green"
    size={40}
    onPress={()=>this.props.navigation.navigate('Profile')}
  
    />
      }
      centerComponent={{ text: 'Shipping', style: { color: 'darkgreen',fontSize:20,marginBottom:10} }}
      containerStyle={{backgroundColor:'#F4FFF6', borderTopLeftRadius:15,
      borderTopRightRadius:15
    }}
      />
      <ScrollView style={{backgroundColor:'#F4FFF6'}}>
   <View style={{marginTop:25,marginLeft:15}}>
              <Text style={{color:'seagreen',fontSize:30}}>Shipping Profile</Text>
            </View>
            <View style={{borderBottomColor:'gray',borderBottomWidth:1,paddingBottom:10}}>
            <View style={{marginTop:15,marginLeft:15}}>
              <Text style={{color:'darkcyan',fontSize:22}}>Domestic</Text>
            </View>
<Dropdown containerStyle={{marginLeft:15,marginRight:15}} 
        label='Company'
        value={this.state.domesticService}
      data={Company}
      onChangeText={text=>{this.setState({domesticService:text})}}
/>
<TextField
        label='The Cost'
        suffix="$"
        value={this.state.domCost}
        onChangeText={(price) => this.setState({domCost:price }) }
        tintColor="green"
        keyboardType='numeric'
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      <TextField
      suffix="$"
        label='Fast Delivery Cost'
        keyboardType='numeric'
        onChangeText={ (price) => this.setState({domAdditional:price}) }
        tintColor="green"
        value={this.state.domAdditional}
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      <View style={{marginLeft:7,marginTop:7,flexDirection:'row'}}>
      <View style={{flexBasis:'45%'}}>
      <TextField
        label='Delivery Time'
        keyboardType='numeric'
        tintColor="green"
        value={this.state.domDelivery.from}
        onChangeText={text=>{
          let {domDelivery} = this.state
          domDelivery.from = text
          this.setState({domDelivery})

        }}
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </View>
      <View style={{flexBasis:'10%',marginTop:35,paddingLeft:10}}>
      <Text style={{fontSize:20,fontWeight:'bold'}}>to</Text>
      </View>
      <View style={{flexBasis:'45%'}}>
      <TextField
        tintColor="green"
        containerStyle={{marginLeft:15,marginRight:15}}
        keyboardType='numeric'
        label='Maximum time'
        value={this.state.domDelivery.to}
        onChangeText={text=>{
          let {domDelivery} = this.state
          domDelivery.to = text
          this.setState({domDelivery})

        }}
      />
      </View>
      </View>
      </View>
      <View>
            <View style={{marginTop:15,marginLeft:15}}>
              <Text style={{color:'darkcyan',fontSize:22}}>International</Text>
            </View>
<Dropdown containerStyle={{marginLeft:15,marginRight:15}} 
        label='Company'
        value={this.state.internationalService}
      data={Company}
      onChangeText={text=>this.setState({internationalService:text})}
/>
<TextField
        label='Cost'
        value={this.state.intCost}
        onChangeText={(price) => this.setState({intCost:price }) }
        keyboardType='numeric'
        tintColor="green"
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      <TextField
        label='Fast Delivery Cost'
        value={this.state.intAddtional}
        onChangeText={ (price) => this.setState({intAddtional:price}) }
        keyboardType='numeric'
        tintColor="green"
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      <View style={{marginLeft:7,marginTop:7,flexDirection:'row'}}>
      <View style={{flexBasis:'45%'}}>
      <TextField
        label='Delivery Time'        
        keyboardType='numeric'
        tintColor="green"
        value={this.state.intDelivery.from}
        onChangeText={text=>{
          let {intDelivery} = this.state
          intDelivery.from = text
          this.setState({intDelivery})

        }}
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </View>
      <View style={{flexBasis:'10%',marginTop:35,paddingLeft:10}}>
      <Text style={{fontSize:20,fontWeight:'bold'}}>to</Text>
      </View>
      <View style={{flexBasis:'45%'}}>
      <TextField
        keyboardType='numeric'
        label='Maximum time'
        tintColor="green"
        value={this.state.intDelivery.to}
        onChangeText={text=>{
          let {intDelivery} = this.state
          intDelivery.to = text
          this.setState({intDelivery})

        }}
        containerStyle={{marginLeft:15,marginRight:15}}
      />
      </View>
      </View>
      </View>
        </ScrollView>
        <View onTouchEnd={this.handleSubmit} style={{backgroundColor:'#50BE64',position: 'relative', left: 0, right: 0, bottom: 0,height:40,width:'100%',alignItems:'center',justifyContent:'center'}}>
       {this.state.loading===false && <Text style={{fontSize:20,color:'white',fontWeight:'bold'}}>Save</Text>}
       {this.state.loading && <ActivityIndicator size={18} color='white' animating/>}
         </View>
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
export default connect(mapStateToProps,mapActionsToProps)(Shipping)