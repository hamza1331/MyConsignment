/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {AsyncStorage, Text, View,ToastAndroid,Platform} from 'react-native';
import {Header,Icon} from 'react-native-elements';
import { SafeAreaView } from "react-navigation";
import { GiftedChat,Bubble } from 'react-native-gifted-chat'
import { connect } from "react-redux";
import SocketIOClient from 'socket.io-client'
import ImagePicker from 'react-native-image-picker'
import Firebase from 'react-native-firebase'
import { url } from './Proxy';
const socket = SocketIOClient('http://192.168.0.100:5001', {
  transports: ['websocket'] // you need to explicitly tell it to use websockets
});
class ChatwGifted extends Component {
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      senderAvatarLink:'',
      image:'',
      tokens:[]
    }
    socket.on('Sent',this.onReceiveMessage)
    this.renderMessages=this.renderMessages.bind(this)
    this.messageIdGenerator=this.messageIdGenerator.bind(this)
    this.handleImageUpload=this.handleImageUpload.bind(this)
    this.selectPhotoTapped=this.selectPhotoTapped.bind(this)
    this.sendRemoteNotification=this.sendRemoteNotification.bind(this)
    this.fetchToken=this.fetchToken.bind(this)
    this.determineUser=this.determineUser.bind(this)
  }
  componentDidMount(){
   AsyncStorage.getItem('userData').then(response=>{
    if(response!==null){
      let user = JSON.parse(response)
      this.setState({
        senderAvatarLink:user.profilePic
      })
   }
   })
   this.renderMessages()
   this.fetchToken()
  }
  sendRemoteNotification(data) {
    let tokens = this.state.tokens
    let body = {
      notification:data,
      tokens
    }
    fetch('http://192.168.0.101:4000/api/sendNotification',{method:"POST",body:JSON.stringify(body),headers: { "Content-Type": "application/json" }})
    .then(res=>res.json())
    .then(data=>{
      console.log(data)
    }).catch(err=>console.log(err))
  }
  determineUser(){
    if(this.props.chatData.sellerUserID===this.props.UID){
      let firebaseUID = this.props.chatData.firebaseUID
      if(firebaseUID){
        return firebaseUID
      }
    }
    else if(this.props.chatData.firebaseUID===this.props.UID){
      let firebaseUID = this.props.chatData.sellerUserID
        if(firebaseUID){
          return firebaseUID
        }
    }
  }
  fetchToken(){
      let firebaseUID = this.determineUser()
    if(firebaseUID){
      fetch(url+'/api/getTokens'+firebaseUID).then(res=>res.json()).then(data=>{
        if(data.doc.tokens){
          console.log(data.doc.tokens)
          this.setState({
            tokens:data.doc.tokens
          })
        }
      })
    }
  }
  renderMessages(){
    if(this.props.chatData.messages.length>0){
      console.log(this.props.chatData)
      let oldMessages = this.props.chatData.messages.map(message=>{
        if(message.hasOwnProperty('text')){
          return{
            _id:message._id,
            text:message.text,
            createdAt:message.createdAt,
            user:{
              _id:message.senderID,
              name:message.fName,
              avatar:message.senderAvatarLink
            }
          }
        }
        else if(message.hasOwnProperty('image')){
          return{
            _id:message._id,
            image:message.image,
            createdAt:message.createdAt,
            user:{
              _id:message.senderID,
              name:message.fName,
              avatar:message.senderAvatarLink
            }
          }
        }
      })
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, oldMessages),
      }))
    }
  }
  onReceiveMessage=(response)=>{
    console.log(response)
    let msg = JSON.parse(response)
   if(msg.hasOwnProperty('text')){
    let newMsg = {
      _id:msg._id,
      text:msg.text,
      createdAt:msg.createdAt,
      user:{
        _id:msg.senderID,
        name:msg.fName,
        avatar:msg.senderAvatarLink
      }
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [newMsg]),
    }))
  }
  else if(msg.hasOwnProperty('image')){
    let newMsg = {
      _id:msg._id,
      image:msg.image,
      createdAt:msg.createdAt,
      user:{
        _id:msg.senderID,
        name:msg.fName,
        avatar:msg.senderAvatarLink
      }
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [newMsg]),
    }))
  }

  }
  componentWillMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
        
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
            _id: 2,
            image:'https://static.zerochan.net/Link.%28Daichi.no.Kiteki%29.full.175552.jpg',
            createdAt: new Date(),
          
            user: {
              _id: 2,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            }
          }
      ],
    })
  }

  renderCustomContainer= ()=>{
    return(
      <View style={{backgroundColor:'#963396',color:'white'}}><Text>cjacefhebchbe</Text></View>
    )
  }
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
      backgroundColor: 'brown',
    },
    left:{
      backgroundColor:'#e6e6e6',
    }
        }}
        textProps={{
          style: {
            color: props.position === 'left' ? '#000' : '#fff',
          },
        }}
       />
    );
  }
  onSend(messages = []) {
    console.log(messages)
    
    let data = {
      createdAt:messages[0].createdAt,
      text:messages[0].text,
      senderID:messages[0].user._id,
      senderAvatarLink:this.state.senderAvatarLink,
      chatId:this.props.chatData._id
    }
    socket.emit('input',JSON.stringify(data))
    let notificationData = {
      message:messages[0].text,
      fName:this.props.chatData.buyerFname
    }
    this.sendRemoteNotification(notificationData)
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }
  messageIdGenerator() {
    // generates uuid.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
selectPhotoTapped() {
  const options = {
    quality: 1.0,
    maxWidth: 800,
    maxHeight: 500,
    storageOptions: {
      skipBackup: true,
    },
  };

  ImagePicker.showImagePicker(options, (response) => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled photo picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    } else {
      let source = { uri: response.uri };
      this.setState({
        image:source.uri
      })
      this.handleImageUpload()
    }
  });
}
handleImageUpload(){
  if(Platform.OS==='android'){
    ToastAndroid.showWithGravityAndOffset(
      'Uploading Image...',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  }
  let {image} = this.state
  let storage = Firebase.storage()
  let storageRef = storage.ref(`artisan/${this.state.UID}/image`+Date.now())
  let task = storageRef.putFile(image)
  task.on('state_changed', function (snapshot) {
    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //   console.log('Upload is ' + progress.toFixed(2) + '% done');
    switch (snapshot.state) {
      case Firebase.storage.TaskState.PAUSED: // or 'paused'
        //   console.log('Upload is paused');
        break;
      case Firebase.storage.TaskState.RUNNING: // or 'running'
          console.log(progress);
        break;
        default:
        return
    }
  }, (error)=> {
    alert(error.message)
  }, () => {
    storageRef.getDownloadURL().then((downloadURL) => {
        let data = {
          createdAt:new Date(),
          image:downloadURL,
          senderID:this.props.UID,
          senderAvatarLink:this.state.senderAvatarLink,
          chatId:this.props.chatData._id
        }
        socket.emit('input',JSON.stringify(data))
        let message =  {
          _id: this.messageIdGenerator(),
          image:downloadURL,
          createdAt: new Date(),
        
          user: {
            _id: this.props.UID,
            name: 'React Native',
            avatar: this.state.senderAvatarLink,
          }
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [message]),
        }))
    });
  })
}
  render() {
    return (
      <SafeAreaView style={{flex:1,backgroundColor:'#F3F3F2'}}>
         <Header placement="left"
      leftComponent={
    <Icon  containerStyle={{marginBottom:8}}
    name="ios-arrow-round-back"
    type="ionicon"
    color="black"
    size={40}
    onPress={()=>this.props.navigation.navigate('Conversations')}
  
    />
      }
      centerComponent={{ text: this.props.chatData.firebaseUID===this.props.UID?this.props.chatData.sellerFname:this.props.chatData.buyerFname, style: { color: 'black',fontSize:20,marginBottom:10} }}
      rightComponent={
        <View style={{flexDirection:'row',marginBottom:8}}>
          
  <Icon containerStyle={{marginRight:10}}
  name="ios-image"
  type="ionicon"
  color="darkorange"
  onPress={this.selectPhotoTapped}
  size={30}
  />
  
        
        </View>
      }
      containerStyle={{backgroundColor:'#F3F3F6', borderTopLeftRadius:15,
      borderTopRightRadius:15,opacity:0.85
     }}
      />
      <GiftedChat
        messages={this.state.messages}

        onSend={messages => this.onSend(messages)}
        renderBubble={this.renderBubble.bind(this)}
        user={{
          _id: this.props.UID,
        }}
      />
      </SafeAreaView>
    )
  }
}
function mapStateToProps(state){
  return({
    UID:state.rootReducer.UID,
    chatData:state.rootReducer.chatData
  })
}
function mapActionsToProps(dispatch){
  return({
     
  })
}

export default connect(mapStateToProps,mapActionsToProps)(ChatwGifted)