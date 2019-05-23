import React, {Component} from 'react';
import {Platform, Text, View,FlatList,TouchableOpacity,StatusBar} from 'react-native';
import {Avatar,Header,Icon} from 'react-native-elements';
import { connect } from "react-redux";
import { url } from "./Proxy";
import { setChatDataAction } from "../store/actions/actions";
 class Conversation extends Component{
   constructor(props){
      super(props)
      this.state={
         chats:[],
         refreshing:false
      }
      this.handleRefresh=this.handleRefresh.bind(this)
   }
    componentDidMount(){
      if(this.props.firebaseUID){
         let data = {
            firebaseUID:this.props.firebaseUID
         }
         console.log(this.props.firebaseUID)
      fetch(url+'/api/getChats',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }}).then(res=>res.json()).then(response=>{
         this.setState({
            chats:response.data,
            refreshing:false
         })

      }).catch(err=>console.log(err))
      }
    }
    handleRefresh(){
       this.setState({refreshing:true})
      if(this.props.firebaseUID){
         let data = {
            firebaseUID:this.props.firebaseUID
         }
         fetch(url+'/api/getChats',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }}).then(res=>res.json()).then(response=>{
            this.setState({
               chats:response.data,
               refreshing:false
            })
   
         }).catch(err=>console.log(err))
         }
    }
    
     render(){
         return(
            <View style={{flex:1}}>
            <StatusBar barStyle='light-content'/>
            <Header  placement="left"
                  centerComponent={{ text: 'Conversations', style: { color: 'white',fontSize:22,marginBottom:10} }}
                  containerStyle={{backgroundColor:'#4d2600',
                  }}
                  leftComponent={
                    <Icon  
                    name="ios-menu"
                    type="ionicon"
                    color="white"
                    size={Platform.OS==='ios'?30:40}
                     onPress={(e)=>{this.props.navigation.toggleDrawer(e)}}
                    />
                      }
                  />

                    <View style={{flex:1,flexDirection:'row',flexWrap:'wrap'}}>
                    {this.state.chats.length>0 && <FlatList
                     onRefresh={this.handleRefresh}
                     data={this.state.chats}
                     refreshing={this.state.refreshing}
                     renderItem={({item,index})=>{
                        if(this.props.firebaseUID===item.sellerUserID)
                        {
                           return      <View style={{width:'100%',flexDirection:'row'}}>
                    <Avatar containerStyle={{marginLeft:5,marginTop:15}}
                   size="medium"
                   rounded
                   source={{
                      uri:item.buyerProfilePic,
                     }}
                     />  
                 <View style={{marginLeft:15,marginTop:20,borderBottomColor:'#4d2600',borderBottomWidth:2,paddingBottom:15,flexBasis:'70%'}}>
                 <TouchableOpacity onPress={()=>{
                           this.props.setChatData(item)
                           this.props.navigation.navigate('Chat')
                 }}>
                    
                    <Text style={{fontSize:20,fontWeight:"bold"}}>{item.buyerFname}</Text>
                    <Text>{item.messages.length>0?item.messages[item.messages.length-1].text:'Click here'}</Text>
                    </TouchableOpacity>
                 </View>
                     </View>
                        }
                        else if(this.props.firebaseUID===item.firebaseUID){
                           return      <View style={{width:'100%',flexDirection:'row'}}>
                    <Avatar containerStyle={{marginLeft:5,marginTop:15}}
                   size="medium"
                   rounded
                   source={{
                      uri:item.sellerProfilePic,
                     }}
                     />  
                 <View style={{marginLeft:15,marginTop:20,borderBottomColor:'#4d2600',borderBottomWidth:2,paddingBottom:15,flexBasis:'70%'}}>
                 <TouchableOpacity onPress={()=>{
                    this.props.setChatData(item)
                    this.props.navigation.navigate('Chat')
                 }}>
                    
                    <Text style={{fontSize:20,fontWeight:"bold"}}>{item.sellerFname}</Text>
                    <Text>{item.messages.length>0?item.messages[item.messages.length-1].text:'Click here'}</Text>
                    </TouchableOpacity>
                 </View>
                     </View>
                        }
                     }}
                     keyExtractor={item => item._id}
                    />}
                     </View>
                         </View>
         )
     }
 }

 function mapStateToProps(state){
   return({
     firebaseUID:state.rootReducer.UID
   })
 }
 function mapActionsToProps(dispatch){
   return({
      setChatData:(chatData)=>{
         dispatch(setChatDataAction(chatData))
      }
   })
 }
 export default connect(mapStateToProps,mapActionsToProps)(Conversation)
