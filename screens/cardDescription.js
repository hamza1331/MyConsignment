import React, {Component} from 'react';
import {AsyncStorage, Text, View,ScrollView,Image,Alert,TouchableOpacity,StyleSheet} from 'react-native';
import {Avatar,Header,Icon,Rating,SocialIcon} from 'react-native-elements';
import MapView from 'react-native-maps'
import Modal from 'react-native-modal'
import { SafeAreaView } from "react-navigation";
import { connect } from "react-redux";
import Slideshow from 'react-native-image-slider-show';
import { hideDescriptionModalAction,setChatDataAction } from "../store/actions/actions";
import { url } from "./Proxy";
class CardDesp extends Component {
constructor(props){
  super(props);
  this.state={
    buyerProfilePic:'',
    imageUrls:[],
    favorite:false,
    buyerFname:'Test'
  }

  this.addFavorite=this.addFavorite.bind(this)
}
componentDidMount(){
  AsyncStorage.getItem('userData').then(response=>{
    if(response!==null){
      let user = JSON.parse(response)
      this.setState({
        buyerProfilePic:user.profilePic,
        buyerName:user.fName
      })
   }
   })
}
SampleFunction=()=>{
let data = {
  sellerUserID:this.props.item.userData._id,
  firebaseUID:this.props.UID,
  buyerProfilePic:this.state.buyerProfilePic,
  sellerFname:this.props.item.userData.fName,
  buyerFname:this.state.buyerFname
} 
 fetch(url+'/api/getMessages',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
    .then(res=>res.json())
    .then(data=>{
      if(data.message==='Success'){
        console.log(data)
        this.props.setChatData(data.data)
        this.props.hideDescriptionModal()
        this.props.navigation.navigate('Chat')
      }
      else{
        Alert.alert('Failed',"Unknown Error")
      }
    })
}
addFavorite(){
  if(this.state.favorite===false){
    let data = { 
      id : this.props.item.doc._id,
      firebaseUID:this.props.UID
    }
    fetch(url+'/api/addFavorite',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
    .then(res=>res.json())
    .then(data=>{
      if(data.message==='Success'){
        this.setState({
          favorite:true
        })
      }
      else{
        Alert.alert('Failed',"Unknown Error")
      }
    })
  }
}
  
    render(){ 
      if(this.props.item===null)
      {
        return(
          <Modal isVisible={this.props.showDescription}>
            <Text>Hello From App..</Text>
          </Modal>
        )
      }

     else return(
   <Modal isVisible={this.props.showDescription} 
   onBackButtonPress={()=>this.props.hideDescriptionModal()}
   style={{borderRadius:15,
       backgroundColor:'#F3F3F5',
       margin:0
       }}>
       <SafeAreaView style={{flex:1}}>
       <Header 
       leftComponent={
     <Icon  containerStyle={{marginBottom:8}}
     name="ios-arrow-round-back"
     type="ionicon"
     color="black"
     size={40}
     onPress={()=>this.props.hideDescriptionModal()}
     />
       }
       rightComponent={
         <View style={{flexDirection:'row',marginBottom:8}}>
           
        <Icon containerStyle={{marginRight:10}}
        name={this.state.favorite===true?"ios-heart":"ios-heart-empty"}
        type="ionicon"
        color="black"
        size={30}
        onPress={this.addFavorite}
        />
         </View>
       }
       containerStyle={{backgroundColor:'#F3F3F5', borderTopLeftRadius:15,
       borderTopRightRadius:15}}
       />
         <ScrollView>
           <View >
       {this.props.item.doc.imageLinks.length>0 && <Slideshow 
      dataSource={this.props.item.doc.imageLinks.map((image,index)=>{
           return {
             url:image
           }
      })}
      />}

        </View>
       <View style={{marginLeft:10,marginTop:10,paddingBottom:5,borderBottomColor:'gray',borderBottomWidth:2,marginRight:10}}>
         <Text style={{fontSize:50,fontWeight:'bold',color:'black'}} >{this.props.item.doc.title}</Text>
         <Text style={{fontSize:30,fontWeight:'bold',color:'black'}} >${this.props.item.doc.price}</Text>
         <Text style={{fontSize:15,color:'black'}}>{this.props.item.doc.description}.</Text>
   
       </View>
       <View style={{marginLeft:10,marginTop:10,paddingBottom:10,borderBottomColor:'gray',borderBottomWidth:2,marginRight:10}}>
       <MapView style={{width:'100%',height:200,marginTop:5}}  initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}>
       
         </MapView>
       </View>
       <View style={{flexDirection:'row',marginLeft:10,marginTop:15,paddingBottom:10,borderBottomColor:'gray',borderBottomWidth:2,marginRight:10}}>
       <Avatar
       size="medium"
       rounded
       source={{
         uri:this.props.item.userData.profilePic!==null?this.props.item.userData.profilePic : 'https://s3.amazonaws.com/uifaces/faces/twitter/ladysexy/128.jpg',
       }}
     />  
     <View style={{marginLeft:15}}>
       <Text style={{fontSize:20,fontWeight:'bold',color:'black',marginBottom:5}}>{this.props.item.userData.fName}</Text>
       <Rating 
     type='star'
     ratingCount={5}
     imageSize={20}
   />
     </View>
       </View>
       <View style={{flex:1,marginTop:5,marginBottom:10,borderBottomColor:'darkred',borderBottomWidth:1}}>
        <Text style={{fontSize:16,fontWeight:'bold',textAlign:'center'}}>Shipping Details</Text>
        <View style={{width:'80%',alignSelf:'center',marginTop:4}}>
        <Text style={{fontSize:14,fontWeight:'bold',textDecorationLine:'underline'}}>Domestic</Text>
        <Text style={{textAlign:'center'}}>Delivery Service : {this.props.item.shipping.domesticService}</Text>
        <Text style={{textAlign:'center'}}>Delivery Time : {this.props.item.shipping.domDelivery.from} to {this.props.item.shipping.domDelivery.to} days</Text>
        <Text style={{textAlign:'center'}}>Delivery Charges : {this.props.item.shipping.domCost}</Text>
        </View>
        <View style={{width:'80%',alignSelf:'center',marginTop:4}}>
        <Text style={{fontSize:14,fontWeight:'bold',textDecorationLine:'underline'}}>International</Text>
        <Text style={{textAlign:'center'}}>Delivery Service : {this.props.item.shipping.internationalService}</Text>
        <Text style={{textAlign:'center'}}>Delivery Time : {this.props.item.shipping.intDelivery.from} to {this.props.item.shipping.intDelivery.to} days</Text>
        <Text style={{textAlign:'center'}}>Delivery Charges : ${this.props.item.shipping.intCost}</Text>
        </View>
       </View>
       <View style={{marginLeft:10,marginTop:15,paddingBottom:5,borderBottomColor:'gray',borderBottomWidth:2,marginRight:10}}>
       </View>
       </ScrollView>
       <TouchableOpacity activeOpacity={0.5} onPress={this.SampleFunction} style={styles.TouchableOpacityStyle} >
 
          <Image source={{uri : 'https://freeiconshop.com/wp-content/uploads/edd/chat-outline-filled.png'}} 
          
                 style={styles.FloatingButtonStyle} />
       
        </TouchableOpacity>
       <View onTouchEnd={()=>{
         this.props.hideDescriptionModal()
         this.props.navigation.navigate('Credit')
       }} style={{backgroundColor:'#D1802E',position: 'absolute', left: 0, right: 0, bottom: 0,height:50,width:'100%',alignItems:'center',justifyContent:'center'}}>
       <Text style={{fontSize:20,color:'white',fontWeight:'bold'}}>Purchase</Text>
         </View>
   </SafeAreaView>
   </Modal>
      )
    }
   }
   function mapStateToProps(state){
    return({
      item:state.rootReducer.item,
      UID:state.rootReducer.UID,
      showDescription:state.rootReducer.showDescription
    })
  }
  function mapActionsToProps(dispatch){
    return({
      hideDescriptionModal:()=>{
        dispatch(hideDescriptionModalAction())
      },
      setChatData:(chatData)=>{
        dispatch(setChatDataAction(chatData))
     }
    })
  }
  export default connect(mapStateToProps,mapActionsToProps)(CardDesp)
  const styles = StyleSheet.create({
 
    MainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor : '#F5F5F5'
    },
   
    TouchableOpacityStyle:{
   
      position: 'absolute',
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      right: 30,
      bottom: 60,
    },
   
    FloatingButtonStyle: {
   
      resizeMode: 'contain',
      width: 60,
      height: 60,
    }
  });