import React from 'react'
import {View,Text,TouchableOpacity,FlatList,AsyncStorage} from'react-native'
import {Avatar,Button,Icon,Header} from 'react-native-elements'
import Modal from 'react-native-modal'
import { SafeAreaView } from "react-navigation";
import { connect } from "react-redux";
import { url } from "../screens/Proxy";
import { selectCategoryAction } from "../store/actions/actions";
import firebase from 'react-native-firebase';
class MenuDrawer extends React.Component{
    constructor(props){
        super(props)
            this.state={
                data:[],
                ismodalVisible:false,
                profilePic:'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                username:'',
                UID:''
            }
        this.NavigateToHome=this.NavigateToHome.bind(this)
        this.messageIdGenerator=this.messageIdGenerator.bind(this)
    }
    Openmodal=()=>{
        this.setState({
            ismodalVisible:true
        })
    }
    Closemodal=()=>{
        this.setState({
            ismodalVisible:false
        })
    }
    messageIdGenerator() {
        // generates uuid.
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    navLink(nav,text){ 
        return(
            <TouchableOpacity onPress={()=>{this.props.navigation.navigate(nav)}}>
                <Text style={{fontSize:15,fontWeight:'bold',marginLeft:20,marginTop:20}}>{text}</Text>
            </TouchableOpacity>
        )
    }
    componentDidMount(){
        fetch(url+'/api/getCategories').then(res=>res.json()).then(data=>{
            this.setState({
                data:data.docs
            })
        }).catch(err=>console.log(err))
        AsyncStorage.getItem('userData').then(data=>{
            let user = JSON.parse(data)
            console.log(user)
            this.setState({
              username:user.fName,
              UID:user.firebaseUID
            })
            if(user.profilePic){
              this.setState({
                profilePic:user.profilePic
              })
            }
        })
    }
    NavigateToHome(name){
        this.props.navigation.toggleDrawer()
        this.props.selectCategory(name)
        this.Closemodal()
        // this.props.navigation.navigate('HomeScreen')
    }
render(){
    return(  
    <View style={{flex:1}}>
     <View style={{backgroundColor:'#C3B09D',height:160,width:'100%',flexDirection:'row'}}>
     <Avatar containerStyle={{marginLeft:30,marginTop:40}} onPress={()=>{this.props.navigation.navigate('Profile')}}
       size="large"
       rounded
       source={{
         uri:this.state.profilePic,
       }}
     />  
     <Text style={{fontSize:20,fontWeight:'bold',color:'white',marginLeft:10,marginTop:60}}>{this.state.username!==''?this.state.username:"No Name"}</Text>
     </View>
     <View style={{marginTop:20}}>
     {this.navLink('HomeScreen','Home')}
     {this.navLink('Conversations','Conversation')}
     {this.navLink('Report','Report/Suggestionn')}
     {this.navLink('Payment','Payment Info')}
     {this.navLink('Profile','Profile')}
     <TouchableOpacity onPress={()=>{
         firebase.auth().signOut()
         .then(()=>{
             let data = {
                 firebaseUID:this.props.UID
             }
            AsyncStorage.removeItem('userData')
            fetch(url+'/api/logout',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
            .then(res=>res.json())
            .then(response=>{
                if(response.message==='Success'){
                    this.props.navigation.navigate('ProviderLogin')
                }
            })
         }).catch(err=>console.log(err))
}}>
<Text style={{fontSize:15,fontWeight:'bold',marginLeft:20,marginTop:20,color:'red'}}>Sign Out</Text>
</TouchableOpacity>
     </View>
     <View style={{alignItems:'center',justifyContent:'flex-end'}}>
          <View style={{position: 'absolute',
      width:180,
      height:40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:'#D1802E',
      borderRadius:10,
      marginTop:50,
      top:'50%',
      bottom:'10%',
      marginBottom:15
      }}>
            <Button title="All categories" onPress={this.Openmodal} buttonStyle={{backgroundColor:'#D1802E',height:40}}/>
          </View>
          </View>
          <Modal isVisible={this.state.ismodalVisible} style={{backgroundColor:'white',marginBottom:0,marginTop:0,marginLeft:0,marginRight:'17.5%',borderRadius:8}} onBackButtonPress={this.Closemodal} swipeDirection="left" onSwipeComplete={this.Closemodal}>
   <SafeAreaView style={{flex:1}}>
   <Header placement="left"
    leftComponent={
    <Icon  containerStyle={{marginBottom:8}}
    name="ios-arrow-round-back"
    type="ionicon"
    color="black"
    size={40}
    onPress={this.Closemodal}
   />
      }
      containerStyle={{backgroundColor:'white', borderTopLeftRadius:15,
      borderTopRightRadius:15,
}}
      />
   <Text style={{textAlign:"center",fontSize:28,fontWeight:'bold',marginTop:10,color:'darkorange'}}>CATEGORIES</Text>
 {this.state.data.length>0&&<FlatList data={this.state.data} keyExtractor={()=>this.messageIdGenerator()} renderItem={({item})=>
  <View key={item._id} onTouchEnd={()=>this.NavigateToHome(item.name)} style={{paddingBottom:10,borderBottomColor:'orange',borderBottomWidth:2,flexDirection:'row'}}>
     <Icon
     containerStyle={{marginTop:12,marginLeft:10}}
          name={item.iconType}
          type={item.iconName}
          color='darkred'
          size={24}
        />
  <Text style={{fontSize:20,marginLeft:10,marginRight:10,paddingTop:10}}>{item.name}</Text>
  </View>
  } 
  />}
     </SafeAreaView>
    </Modal>

    </View>
    )
}
}

function mapStateToProps(state){
    return({
      UID:state.rootReducer.UID,
    })
  }
  function mapActionsToProps(dispatch){
    return({
        selectCategory:(category)=>{
            dispatch(selectCategoryAction(category))
        }
    })
  }
  export default connect(mapStateToProps,mapActionsToProps)(MenuDrawer)