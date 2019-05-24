import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View,AsyncStorage,ToastAndroid,TouchableOpacity,Alert,ActivityIndicator} from 'react-native';
import {Avatar,Header,Icon,Button} from 'react-native-elements';
import ScrollableTabView, { ScrollableTabBar} from 'react-native-scrollable-tab-view'
import { SafeAreaView } from "react-navigation";
import ImagePicker from 'react-native-image-picker';
import { connect } from "react-redux";
import Firebase from 'react-native-firebase'
import { url } from "./Proxy";
import { showDescriptionModalAction,renderItemAction } from "../store/actions/actions";
import { ScrollView } from 'react-native-gesture-handler';
class Profila extends Component {
  constructor(props){
    super(props)
    this.state={
      username:'',
      profilePic:'',
      image:'',
      UID:'',
      sales:[],
      loading:false,
      favorites:[],
      showLoading:false
    }
    this.selectPhotoTapped=this.selectPhotoTapped.bind(this)
    this.handleImageUpload=this.handleImageUpload.bind(this)
  }
  componentDidMount(){
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
      fetch(url+'/api/getProfile'+user.firebaseUID).then(res=>res.json()).then(data=>{
      }).catch(err=>console.log(err))
      this.setState({
        loading:true
      })
      fetch(url+'/api/getUserListings'+this.props.UID).then(res=>res.json())
      .then(data=>{
        if(data.message==='Failed')
          Alert.alert('Failed',"Couldn't get listings")
        else{
          let sales = data.docs
          this.setState({
            sales,
            loading:false
          })
        }
      }).catch(err=>console.log(err))
      fetch(url+'/api/getFavorites'+this.props.UID).then(res=>res.json())
      .then(doc=>{
        if(doc.message==='Failed')
          Alert.alert('Failed',"Couldn't get listings")
        else{
          let favorites = doc.data
          this.setState({
            favorites,
            loading:false
          })
        }
      }).catch(err=>console.log(err))
    })
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
          firebaseUID:this.state.UID,
          profilePic:downloadURL
        }
        fetch(url+'/api/addImage',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
        .then(res=>res.json()).then((response)=>{
          if(Platform.OS==='android'){
            ToastAndroid.showWithGravityAndOffset(
              'Upload Complete!!',
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50,
            );
          }
          this.setState({
            profilePic:response.data.profilePic
          })
        }).catch(err=>console.log(err))
      });
    })
  }
  render() {
    if(this.state.showLoading){
      return(
       <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
       <ActivityIndicator animating size={40} color='darkred'/>
   </View>
      )
    }
    else return (
          <SafeAreaView style={{flex: 1,backgroundColor:'#F3F3F2'}}>
       <Header 
       backgroundColor='#F3F3F2'
       leftComponent={
        <Icon  
        name="ios-menu"
        type="ionicon"
        color="green"
        size={Platform.OS==='ios'?30:40}
         onPress={(e)=>{this.props.navigation.toggleDrawer(e)}}
        />
          }
          centerComponent={
            <View style={{flexDirection:'row',marginBottom:8}}>
                  <Text style={{fontSize:20,fontWeight:'bold',color:'green'}}>MY PROFILE</Text>
            </View>
          }
       rightComponent={
         <View style={{flexDirection:'row',marginBottom:8}}>
           
           <Text onPress={()=>this.props.navigation.navigate('Shipping')} style={{fontSize:16,color:'green',fontWeight:'bold'}}>
             Shipping
           </Text>
         </View>
       }
       containerStyle={{backgroundColor:'#F3F3F6', borderTopLeftRadius:15,
       borderTopRightRadius:15
       }}
       />
<View style={{flexDirection:'row'}}>
  <View style={{flexBasis:'75%'}}>
       {this.state.username.length>0 && <Text style={{fontSize:30,fontWeight:'bold',marginTop:10,marginLeft:5}}>{this.state.username}</Text>}
  </View>
  {this.state.profilePic.length>0&&<Avatar containerStyle={{flexBasis:'25%',marginTop:5}}
  size="large"
  rounded
  title="Add Photo"
  source={{uri:this.state.profilePic}}
  onPress={this.selectPhotoTapped}
  activeOpacity={0.7}
/>}
  {this.state.profilePic.length===0 && <Avatar containerStyle={{flexBasis:'25%',marginTop:5}}
  size="large"
  rounded
  title="AJ"
  onPress={this.selectPhotoTapped}
  activeOpacity={0.7}
/>}
</View>
<View style={{marginTop:10,alignItems:'center'}}>
  <Button buttonStyle={{width:300,borderRadius:15,backgroundColor:'#B17E4E'}} disabled disabledStyle={{backgroundColor:'#58685b'}} disabledTitleStyle={{color:'white'}} title="Become Pro (Coming Soon)"/>
</View>
<View style={styles.spCount}>
<View style={{flexDirection:'row',marginTop:5,marginLeft:7}}>
<Icon containerStyle={{marginRight:5}}
    name='ios-stats'
    type='ionicon'
    color='green'
    />
  <Text style={{fontWeight:'bold',marginTop:5}}>{this.state.sales.length>0?this.state.sales.length:0}</Text>
  <Text style={{marginTop:5,marginLeft:5}}>Items on sale</Text>
</View>
</View>
<ScrollableTabView
    style={{marginTop: 20}}
    initialPage={0}
    tabBarActiveTextColor='seagreen'
    tabBarUnderlineStyle={{backgroundColor:'seagreen'}}
    renderTabBar={() => <ScrollableTabBar />}
    >
  <ScrollView tabLabel="On Sale">
  {this.state.sales.length>0&&this.state.loading===false&&this.state.sales.map((sale)=>{
   return <View key={sale._id} style={{width:'90%',flexDirection:'row',alignSelf:'center'}}>
    <Avatar containerStyle={{marginLeft:5,marginTop:15}}
   size="medium"
   rounded
   source={{
      uri:sale.imageLinks[0],
     }}
     />  
 <View style={{marginLeft:15,marginTop:20,borderBottomColor:'seagreen',borderBottomWidth:2,paddingBottom:15,flexBasis:'70%'}}>
 <TouchableOpacity onPress={()=>{
            this.setState({
              showLoading:true
            })
            fetch(url+'/api/getListing'+sale._id).then(res=>res.json()).then(data=>{
              this.props.renderItem(data.result)
              this.setState({
                showLoading:false
              })
              this.props.showDescriptionModal()
          })
 }}>
    
    <Text style={{fontSize:20,fontWeight:"bold"}}>{sale.title}</Text>
    <Text>{sale.description.substring(0,100)}</Text>
    </TouchableOpacity>
 </View>
     </View>
  })}
  {this.state.loading && this.state.sales.length===0 && <ActivityIndicator animating color='orange' size={16}/>}
  {this.state.loading===false && this.state.sales.length===0 && <Text style={{fontWeight:'bold',textAlign:'center'}}>No Listing on Sale Yet</Text>}
  </ScrollView>
  <ScrollView tabLabel="Favorites">
  {this.state.favorites.length>0&&this.state.loading===false&&this.state.favorites.map((favorite)=>{
   return <View key={favorite._id} style={{width:'90%',flexDirection:'row',alignSelf:'center'}}>
    <Avatar containerStyle={{marginLeft:5,marginTop:15}}
   size="medium"
   rounded
   source={{
      uri:favorite.imageLinks[0],
     }}
     />  
 <View style={{marginLeft:15,marginTop:20,borderBottomColor:'seagreen',borderBottomWidth:2,paddingBottom:15,flexBasis:'70%'}}>
 <TouchableOpacity onPress={()=>{
            this.setState({
              showLoading:true
            })
            fetch(url+'/api/getListing'+favorite._id).then(res=>res.json()).then(data=>{
              this.props.renderItem(data.result)
              this.setState({
                showLoading:false
              })
              this.props.showDescriptionModal()
          })
 }}>
    
    <Text style={{fontSize:20,fontWeight:"bold"}}>{favorite.title}</Text>
    <Text>{favorite.description.substring(0,100)}</Text>
    </TouchableOpacity>
 </View>
     </View>
  })}
  {this.state.loading && this.state.favorites.length===0 && <ActivityIndicator animating color='orange' size={16}/>}
  {this.state.loading===false && this.state.favorites.length===0 && <Text style={{fontWeight:'bold',textAlign:'center'}}>No Listing on Sale Yet</Text>}
  </ScrollView>

  </ScrollableTabView>
          </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  header:{
    borderTopLeftRadius:15,
    borderTopRightRadius:15,
    height: Platform.OS === 'ios' ? 70 :  70 - 24
  },
  spCount:{
    marginTop:10,
    borderBottomWidth:1,
    borderBottomColor:'lightgray',
    paddingBottom:15,
    borderTopWidth:1,
    borderTopColor:'lightgray',
    paddingTop:10
  }
})

function mapStateToProps(state){
  return({
    UID:state.rootReducer.UID
  })
}
function mapActionsToProps(dispatch){
  return({
        showDescriptionModal:()=>{
          dispatch(showDescriptionModalAction())
        },
        renderItem:(item)=>{
          dispatch(renderItemAction(item))
        }
  })
}

export default connect(mapStateToProps,mapActionsToProps)(Profila)