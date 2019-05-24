
import React, { Component } from 'react';
import { Text, View, ScrollView,PermissionsAndroid,Platform,Alert,ToastAndroid,ActivityIndicator} from 'react-native';
import { Icon, Input } from 'react-native-elements';
import { SafeAreaView } from "react-navigation";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { connect } from "react-redux";
import { url } from "./Proxy";
import { setQueryAction,addtListingsAction } from "../store/actions/actions";
class Filter extends Component {
  constructor(props){
    super(props)
    this.inititalState={
      multiSliderValue: [0, 200],
      deliverable:false,
      trade:false,
      page:1,
      days:0,
      daysFilter:false,
      distance:0,
      longitude:0,
      latitude:0,
      title:'',
      loading:false
    }
    this.state = {
     ...this.inititalState
    };
    this.handleSubmit=this.handleSubmit.bind(this)
    this.handleReset=this.handleReset.bind(this)
    this.handleLocationSearch=this.handleLocationSearch.bind(this)
    this.callLocation=this.callLocation.bind(this)
  }
  handleLocationSearch(){
    var that =this;
    //Checking for the permission just after component loaded
    if(Platform.OS === 'ios'){
      this.callLocation(that);
    }else{
      async function requestLocationPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
              'title': 'Location Access Required',
              'message': 'This App needs to Access your location'
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //To Check, If Permission is granted
            that.callLocation(that);
          } else {
            alert("Permission Denied");
          }
        } catch (err) {
          alert("err",err);
          console.warn(err)
        }
      }
      requestLocationPermission();
    }
  }
  getDataByLocation(){
    this.setState({
      loading:true
    })
    let {longitude,latitude,distance} = this.state

    if(longitude!=='unknown'&&latitude!=='unknown'&& distance!==0){
      let data ={
        longitude,
        latitude,
        distance
      }
    fetch(url+'/api/findByLocation',{body:JSON.stringify(data),method:"POST",headers: { "Content-Type": "application/json" }}).then(res=>res.json())
    .then(response=>{
      console.log(response)
      if(response.docs.length>0){
        this.props.addtListings({
          page:1,
          listings:response.docs
        })
        this.setState({
          loading:false
        })
      this.props.navigation.navigate('HomeScreen')
      }
      else{
        if(Platform.OS==='android'){
          ToastAndroid.showWithGravityAndOffset(
            `No Listing found ${this.state.distance} Miles nearby!!`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
        }
        this.setState({
          loading:false
        })
        this.props.navigation.navigate('HomeScreen')
      }
    }).catch(err=>console.log(err))  
    }
  }
  callLocation(that){
    //alert("callLocation Called");
      navigator.geolocation.getCurrentPosition(
        //Will give you the current location
         (position) => {
            const currentLongitude = JSON.stringify(position.coords.longitude);
            //getting the Longitude from the location json
            const currentLatitude = JSON.stringify(position.coords.latitude);
            //getting the Latitude from the location json
            that.setState({ longitude:currentLongitude });
            //Setting state Longitude to re re-render the Longitude Text
            that.setState({ latitude:currentLatitude });
            //Setting state Latitude to re re-render the Longitude Text
         },
         (error) => {
           if(error.message=="Location request timed out")
           {
             return
            }
           else if(error.message.includes('provider')){
           Alert.alert('Failed',"User must enable location")
           this.props.navigation.navigate('HomeScreen')
           }
           else
           Alert.alert('Failed',error.message)
         },
         { enableHighAccuracy: true, timeout: 20000 }
      );
      that.watchID = navigator.geolocation.watchPosition((position) => {
        //Will give you the location on location change
          const currentLongitude = JSON.stringify(position.coords.longitude);
          //getting the Longitude from the location json
          const currentLatitude = JSON.stringify(position.coords.latitude);
          //getting the Latitude from the location json
         that.setState({ longitude:currentLongitude });
         //Setting state Longitude to re re-render the Longitude Text
         that.setState({ latitude:currentLatitude });
         this.getDataByLocation()
         //Setting state Latitude to re re-render the Longitude Text
      },err=>{
        if(err.message.includes('out'))
        return
      });
   }
  multiSliderValuesChange = values => {
    this.setState({
      multiSliderValue: values,
    });
  };
  handleSubmit(){
    this.setState({
      loading:true
    })
    let data = {
      deliverable:this.state.deliverable,
      trade:this.state.trade,
      minPrice:this.state.multiSliderValue[0],
      maxPrice:this.state.multiSliderValue[1]
    }
    if(this.state.daysFilter)
    data.last = this.state.days
    this.props.setQuery(data)
    fetch(url+'/api/getListings'+this.state.page,{body:JSON.stringify(data),method:"POST",headers: { "Content-Type": "application/json" }}).then(res=>res.json())
    .then(response=>{
      this.props.addtListings({
        page:this.state.page,
        listings:response.data
      })
      this.setState({
        loading:false
      })
      this.props.navigation.navigate('HomeScreen')
    }).catch(err=>console.log(err))

  }
  handleReset(){
    this.setState({
      ...this.inititalState
    })
    this.setState({
      loading:true
    })
    fetch(url+'/api/getListings'+this.state.page,{method:"POST",headers: { "Content-Type": "application/json" }}).then(res=>res.json())
    .then(response=>{
      console.log(response)
      this.props.addtListings({
        page:this.state.page,
        listings:response.data
      })
      this.setState({
        loading:false
      })
      this.props.navigation.navigate('HomeScreen')
    }).catch(err=>console.log(err))
  }
  handleSearch(){
    if(this.state.searchText.length>1){
      let data = {
        title:this.state.searchText
      }
      fetch(url+'/api/searchListing',{method:"PUT",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
      .then(res=>res.json()).then(listings=>{
        if(listings.length>0){
          this.props.addtListings({
            page:1,
            listings
          })
          this.props.navigation.navigate('HomeScreen')
        }
        else{
          if(Platform.OS==='android'){
            ToastAndroid.showWithGravityAndOffset(
              `No Listing found ${this.state.distance} Miles nearby!!`,
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50,
            );
          }
          this.props.navigation.navigate('HomeScreen')
        }
      }).catch(err=>console.log(err))
    }
  }
  render() {
    if(this.state.loading){
      return(
       <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
       <ActivityIndicator animating size={40} color='darkred'/>
   </View>
      )
    }
    else return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4FFF6' }}>
        <ScrollView>
          <Input
            leftIcon={
              <Icon
                name='ios-search'
                type='ionicon'
                color='darkgreen'
              />
            }
            value={this.state.title}
            placeholder='What are you looking for?'
            shake={true}
            onChangeText={text=>this.setState({title:text})}
            inputContainerStyle={{ width:300, backgroundColor: 'white', borderRadius: 15, borderBottomColor: 'white' }}
            containerStyle={{ marginBottom: 5, height:50, marginTop: 20, alignItems: 'center' }}
          />
          <View style={{ marginTop: 25, borderBottomColor: 'white', borderBottomWidth: 2, paddingBottom: 10 }}>
            <Text style={{ marginLeft: 20, fontSize: 25, fontWeight: 'bold', color: 'seagreen' }}>Your budget</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ marginLeft: 20, fontSize: 20, fontWeight: 'bold', color: 'seagreen' }}>${this.state.multiSliderValue[0]} </Text>

              <Text style={{ marginRight: 20, fontSize: 20, fontWeight: 'bold', color: 'seagreen' }}>${this.state.multiSliderValue[1]}</Text>
            </View>
            <MultiSlider
              values={[
                this.state.multiSliderValue[0],
                this.state.multiSliderValue[1],
              ]}
              sliderLength={280}
              onValuesChange={this.multiSliderValuesChange}
              min={0}
              max={20000}
              step={30}
              allowOverlap
              snapped
              prefix='$'
              containerStyle={{
                marginLeft: 20
              }}
            />
          </View>
          <View style={{ marginTop: 25, borderBottomColor: 'white', borderBottomWidth: 2, paddingBottom: 10 }}>
            <Text style={{ marginLeft: 20, fontSize: 25, fontWeight: 'bold', color: 'seagreen' }}>What else?</Text>
            <View style={{ alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
              <View>
                <Icon name={this.state.deliverable===true?'check':'inbox'}
                  type={this.state.deliverable===true?'font-awesome':'community'}
                  onPress={()=>{
                    this.setState({
                      deliverable:!this.state.deliverable
                    })
                  }}
                  color='seagreen' />
                <Text style={{ color: 'seagreen' }}>Deliverable</Text>

              </View>
              <View>
                <Icon name={this.state.trade===true?'check':'ios-git-compare'}
                  onPress={()=>{
                    this.setState({
                      trade:!this.state.trade
                    })
                  }}
                  type={this.state.trade===true?'font-awesome':'ionicon'}
                  color='seagreen' />
                <Text style={{ color: 'seagreen' }}>Acceptance & Trade</Text>

              </View>
            </View>
          </View>
          <View style={{ marginTop: 25, borderBottomColor: 'white', borderBottomWidth: 2, paddingBottom: 10 }}>
            <Text style={{ marginLeft: 20, fontSize: 25, fontWeight: 'bold', color: 'seagreen' }}>Publication date</Text>
            <View style={{ alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
              <View onTouchEnd={()=>{
                this.setState({
                  days:1,
                  daysFilter:true
                })

              }}>
                <Text style={{ fontSize: this.state.days===1?30:20, color: 'seagreen', fontWeight: 'bold', alignSelf: 'center' }}>24</Text>
                <Text style={{ color: 'seagreen',textDecorationLine:this.state.days===1?'underline':'none',fontWeight:this.state.days===1?'bold':'normal' }}>Hours</Text>

              </View>
              <View onTouchEnd={()=>{
                this.setState({
                  days:7,
                  daysFilter:true
                })
              }}>
                <Text style={{ fontSize: this.state.days===7?30:20, color: 'seagreen', fontWeight: 'bold', alignSelf: 'center' }}>7</Text>
                
                <Text style={{ color: 'seagreen',textDecorationLine:this.state.days===7?'underline':'none',fontWeight:this.state.days===7?'bold':'normal' }}>Days</Text>

              </View>
              <View onTouchEnd={()=>{
                this.setState({
                  days:30,
                  daysFilter:true
                })

              }}>
                <Text style={{ fontSize: this.state.days===30?30:20, color: 'seagreen', fontWeight: 'bold', alignSelf: 'center' }}>30</Text>
                <Text style={{ color: 'seagreen',textDecorationLine:this.state.days===30?'underline':'none',fontWeight:this.state.days===30?'bold':'normal' }}>Days</Text>

              </View>
            </View>
          </View>
          <View style={{ marginTop: 25, borderBottomColor: 'white', borderBottomWidth: 2, paddingBottom: 10 }}>
            <Text style={{ marginLeft: 20, fontSize: 25, fontWeight: 'bold', color: 'seagreen' }}>Search By Distance</Text>
            <View style={{ alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
              <View onTouchEnd={()=>{

                this.setState({
                  distance:50
                })
                this.handleLocationSearch()

              }}>
                <Text style={{ fontSize: 20, color: 'seagreen', fontWeight: 'bold', alignSelf: 'center' }}>50</Text>
                <Text style={{ color: 'seagreen',textAlign:'center' }}>Miles</Text>

              </View>
              <View onTouchEnd={()=>{
                this.setState({
                  distance:100
                })
                this.handleLocationSearch()

              }}>
                <Text style={{ fontSize: 20, color: 'seagreen', fontWeight: 'bold', alignSelf: 'center' }}>100</Text>
                <Text style={{ color: 'seagreen',textAlign:'center' }}>Miles</Text>

              </View>
              <View onTouchEnd={()=>{

                this.setState({
                  distance:200
                })
                this.handleLocationSearch()

              }}>
                <Text style={{ fontSize: 20, color: 'seagreen', fontWeight: 'bold', alignSelf: 'center' }}>200</Text>
                <Text style={{ color: 'seagreen',textAlign:'center' }}>Miles</Text>

              </View>
            </View>
          </View>
          <View style={{ borderBottomColor: 'white', height: 40, borderBottomWidth: 2, marginTop: 25, paddingBottom: 10 }}>
          </View>

        </ScrollView>
        <View style={{ display: 'flex', backgroundColor: 'white', justifyContent: 'space-between', flexDirection: 'row', position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, width: '100%' }}>
          <View onTouchEnd={this.handleReset} style={{ alignItems: 'center', justifyContent: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 30 }}>Reset Filters</Text>
          </View>
          <View onTouchEnd={this.handleSubmit} style={{ alignItems: 'center', justifyContent: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginRight: 30 }}>Apply Filters</Text>
          </View>
        </View>

      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return({
    UID:state.rootReducer.UID
  })
}
function mapActionsToProps(dispatch){
  return({
     setQuery:(query)=>{
       dispatch(setQueryAction(query))
     },
     addtListings:(listings)=>{
       dispatch(addtListingsAction(listings))
     }
  })
}

export default connect(mapStateToProps,mapActionsToProps)(Filter)