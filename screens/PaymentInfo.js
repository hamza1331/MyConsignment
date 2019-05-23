import React, { Component } from 'react';
import { Text, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, AsyncStorage, ActivityIndicator, ToastAndroid, Platform, Alert,DatePickerAndroid,DatePickerIOS} from 'react-native';
import { Icon,CheckBox,Header } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown'
import { SafeAreaView } from 'react-navigation'
import { TextField } from 'react-native-material-textfield'
import {states} from './States'
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { connect } from "react-redux";
import { url } from "./Proxy";
class PaymentInfo extends Component {
    constructor(props) {
        super(props)
        this.initialState = {
            first_name: '',
            last_name: '',
            uploading: false,
            userData: null,
            showIndividual: true,
            showBusiness: false,
            type: 'Individual',
            email:'',
            line1:'',
            line2:'',
            city:'',
            country:'US',
            postal_code:'',
            state:'Alabama',
            dob:'',
            phone:'',
            ssn:'',
            mcc:"",
            businesweb:'',
            gender:'Male',
            chosenDate: new Date(),
            taxId:'',
            name:'',
            allow:true,
            stateData:[],
            stateNames:[],
            accountID:''
            }
        this.state = {
            ...this.initialState
        }
        this.showIndividualForm=this.showIndividualForm.bind(this)
        this.showBusinessForm=this.showBusinessForm.bind(this)
        this.openDatePickerAndroid=this.openDatePickerAndroid.bind(this)
        this.setDate=this.setDate.bind(this)
        this.uploadData=this.uploadData.bind(this)
        this.fetchData=this.fetchData.bind(this)
    }
    showBusinessForm() {
        this.setState({
            showBusiness: true,
            showIndividual: false,
            type: "Business"
        })
    }
   
    setDate(newDate) {
        this.setState({chosenDate: newDate});
      }
   async openDatePickerAndroid(){
        try {
            let {action, year, month, day} = await DatePickerAndroid.open({
              // Use `new Date()` for current date.
              // May 25 2020. Month 0 is January.
              date: new Date(1990, 0, 1),
            });
            if (action !== DatePickerAndroid.dismissedAction) {
              // Selected year, month (0-11), day

              let m = ++month
              let dob = ''+m.toString()+'/'+day.toString()+'/'+year.toString()
              this.setState({
                  dob
              })
            }
          } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
          }
    }
    showIndividualForm() {
        this.setState({
            showBusiness: false,
            showIndividual: true,
            type: "Individual"
        })
    }
    componentDidMount() {
        AsyncStorage.getItem('userData').then(response => {
            if (response !== null) {
                let user = JSON.parse(response)
                this.setState({
                    userData: user,
                    email:user.email
                })
                let names = user.fName.split(' ')
                if(names.length>1){
                    this.setState({
                        first_name:names[0],
                        last_name:names[1]
                    })
                }
                else if(names.length===1){
                    this.setState({
                        first_name:names[0]
                    })
                }
            }
        })
        let stateData = states.map(state=>{
            return{
                value:state.value
            }
        })
        let stateNames = states.map(state=>state.value)
        this.setState({
            stateData,
            stateNames
        })
        this.fetchData()
    }
    fetchData=()=>{
        fetch(url+'/api/getPaymentInfo'+this.props.UID)
        .then(res=>res.json())
        .then(data=>{
           if(data.message==='Success'){
               console.log('Success...')
               console.log(data)
            if(data.doc!==null)
            {
                let paymentProfile = data.doc
                console.log(paymentProfile)
           let dob = ''+paymentProfile.dob.month+'/'+paymentProfile.dob.date+'/'+paymentProfile.dob.year
           this.setState({
               showIndividual:true,
               type:paymentProfile.businessType,
               first_name:paymentProfile.first_name,
               last_name:paymentProfile.last_name,
               gender:paymentProfile.gender,
               ssn:paymentProfile.ssn,
               email:paymentProfile.email,
               phone:paymentProfile.phone,
               country:paymentProfile.address.country,
               line1:paymentProfile.address.line1,
               city:paymentProfile.address.city,
               postal_code:paymentProfile.address.postal_code.toString(),
               dob,
               accountID:paymentProfile.accountID
           })
            }
           }
        })
    }
    uploadData(){
        this.setState({uploading:true})
        if(this.state.showIndividual){
            
                let {
                first_name,last_name,email,gender,phone,ssn,
                line1,state,postal_code,city,country,dob,businesweb,mcc,type
                } = this.state
                let g = gender==='Male'?'male':'female'
                let stateNames = this.state.stateNames
                let index = stateNames.indexOf(state)
                let value = states[index].abbreviation
                let data = {
                    first_name,last_name,email,gender:g,phone,ssn,
                    line1,state:value,postal_code,city,country,dob,businesweb,mcc,type,
                    firebaseUID:this.props.UID
                }
                fetch('http://192.168.0.101:5000/createacc',{method:"POST",body:JSON.stringify(data),headers: { "Content-Type": "application/json" }})
                .then(res=>res.json())
                .then(data=>{
                    this.setState({
                        uploading:false
                    })
                    if(data.message==='Failed')
                    {
                        Alert.alert("Failed",'Fill all the required fields!')
                    }
                    else if(data.message==='Success'){
                        Alert.alert('Done',"WoW!")
                        this.props.navigation.navigate('BankDetails')
                    }
                })
                
        }
        else{
            let data = this.state
        }
    }
    render() {
        const Options = [{
            value: 'Male'
        }, {
            value: 'Female'
        }
        ]
      
        return (
            <SafeAreaView style={{ flex: 1 }}>
              
                {/* <Header leftContainerStyle={{flexBasis:'10%',marginBottom:18}}  centerContainerStyle={{flexBasis:"60%"}} rightContainerStyle={{flexBasis:'30%',alignItems:'center'}}
      collapsable={true}
      leftComponent={
        <Icon  
        name="ios-arrow-round-back"
        type="ionicon"
        color="#4d2600"
        size={Platform.OS==='ios'?30:40}
         onPress={()=>{this.props.navigation.navigate('HomeScreen')}}
        />
          }
          containerStyle={{backgroundColor:"#FFF"}}
          rightComponent={
            <Text onPress={()=>this.props.navigation.navigate("Filter")} style={{fontSize:14,color:'brown',textDecorationLine:'underline'}}>Bank Profile</Text>
       }
       centerComponent={
        <Text style={{fontSize:16,color:'black'}}>PAYMENT PROFILE</Text>
       }
       /> */}
       <Header    placement="left"
                  centerComponent={{ text: 'Payment Info', style: { color: 'white',fontSize:22,marginBottom:10} }}
                  containerStyle={{backgroundColor:'#4d2600',
                  }}
                  rightContainerStyle={{flexBasis:'30%',alignItems:'center'}}
                  collapsable={true}
                  leftComponent={
                    <Icon  
                    name="ios-menu"
                    type="ionicon"
                    color="white"
                    size={Platform.OS==='ios'?30:40}
                     onPress={(e)=>{this.props.navigation.toggleDrawer(e)}}
                    />
                    }
                    rightComponent={
                        <Text onPress={()=>this.props.navigation.navigate("BankDetails")} style={{fontSize:16,color:'white',textDecorationLine:'underline',fontWeight:'bold'}}>Bank Details</Text>
                    }
                  />
                <ScrollView>
                    <View style={{flex:1,justifyContent:'center',marginTop:3}}>
                      <Text style={{fontSize:16,fontWeight:'bold',textAlign:'center'}}>Submit your Payment info to create Stripe Connect Account enable receiving payments.</Text>
                    </View>
                    <View style={{ width: '100%', height: hp('9%'), backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Select Business Type</Text>
                    </View>
                    <View style={{ width: '100%', height: hp('11%'), backgroundColor: 'white', flexDirection: 'row' }}>
                        <CheckBox
                            title='Individual'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={this.state.showIndividual}
                            onPress={this.showIndividualForm}
                            checkedColor='darkred'
                            containerStyle={{ marginLeft: 25, backgroundColor: 'white', borderWidth: 0 }}
                        />
                        <CheckBox
                            center
                            title='Business'
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checked={this.state.showBusiness}
                            onPress={this.showBusinessForm}
                            containerStyle={{ marginLeft: 25, backgroundColor: 'white', borderWidth: 0 }}
                            checkedColor='darkred'
                        />
                    </View>
                    {this.state.showIndividual && <View style={{ marginTop: 5 }}>
                    <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Personal Info</Text>
                    </View>
                        <KeyboardAvoidingView>
                            <TextField
                                label='First Name'
                                value={this.state.first_name}
                                onChangeText={(first_name) => this.setState({ first_name })}
                                tintColor="darkred"
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                        <KeyboardAvoidingView>
                            <TextField
                                label='Last Name'
                                value={this.state.last_name}
                                onChangeText={(last_name) => this.setState({ last_name })}
                                tintColor="darkred"
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                        <KeyboardAvoidingView>
                            <TextField
                                label='Email'
                                value={this.state.email}
                                onChangeText={(email) => this.setState({ email })}
                                tintColor="darkred"
                                keyboardType='email-address'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                        {Platform.OS==='android'&&<KeyboardAvoidingView>
                            <TextField
                                label='Date of Birth'
                                value={this.state.dob}
                                onTouchEnd={this.openDatePickerAndroid}
                                tintColor="darkred"
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>}

                        {Platform.OS==='ios' && <KeyboardAvoidingView>
                        <DatePickerIOS
                        date={this.state.dob}
                        mode='date'
                        onDateChange={this.setDate}
                        />
                        </KeyboardAvoidingView>
                        }
                        <View style={{ marginLeft: 7, marginTop: 7, flexDirection: 'row' }}>
                            <View style={{ flexBasis: '80%' }}>
                                <Dropdown containerStyle={{ marginLeft: 3, marginRight: 8, width: '100%', }}
                                    label='Gender'
                                    itemTextStyle={{ fontSize: 18, fontWeight: 'bold' }}
                                    value={this.state.gender}
                                    data={Options}
                                    onChangeText={text => this.setState({ option: text })}
                                />
                            </View>
                        </View>
                    <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Address Info</Text>
                    </View>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Line 1'
                                value={this.state.line1}
                                onChangeText={(line1) => this.setState({ line1 })}
                                tintColor="darkred"
                                placeholder='Street, PO BOX or Company'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                                characterRestriction={600}
                            />
                        </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Line 2'
                                value={this.state.line2}
                                onChangeText={(line2) => this.setState({ line2 })}
                                tintColor="darkred"
                                placeholder='Apartment, Suite, or Building'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                                characterRestriction={600}
                            />
                        </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Postal Code'
                                value={this.state.postal_code}
                                onChangeText={(postal_code) => this.setState({ postal_code })}
                                tintColor="darkred"
                                keyboardType='number-pad'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                        <View style={{ marginLeft: 7, marginTop: 7, flexDirection: 'row' }}>
                            <View style={{ flexBasis: '80%' }}>
                                <Dropdown containerStyle={{ marginLeft: 3, marginRight: 8, width: '100%', }}
                                    label='State'
                                    itemTextStyle={{ fontSize: 18, fontWeight: 'bold' }}
                                    value={this.state.state}
                                    data={this.state.stateData}
                                    onChangeText={text => this.setState({ state: text })}
                                />
                            </View>
                        </View>
                        <KeyboardAvoidingView>
                            <TextField
                                label='City'
                                value={this.state.city}
                                onChangeText={(city) => this.setState({ city })}
                                tintColor="darkred"
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Mobile Phone'
                                value={this.state.phone}
                                onChangeText={(phone) => this.setState({ phone })}
                                tintColor="darkred"
                                keyboardType='phone-pad'
                                placeholder='+15551234567'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                     <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Verification Details</Text>
                    </View>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Social Security Number (SSN)'
                                value={this.state.ssn}
                                onChangeText={(ssn) => this.setState({ ssn })}
                                tintColor="darkred"
                                keyboardType='number-pad'
                                placeholder='001234567'
                                maxLength={9}
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                   
                        <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Business Details</Text>
                    </View>
                    
                    <KeyboardAvoidingView>
                            <TextField
                                label='Industry'
                                value={this.state.mcc}
                                onChangeText={(mcc) => this.setState({ mcc })}
                                tintColor="darkred"
                                keyboardType='numeric'
                                placeholder='Merchant Category Code'
                                maxLength={5}
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView> 
                        <KeyboardAvoidingView>
                            <TextField
                                label='Business Web'
                                value={this.state.businesweb}
                                onChangeText={(businesweb) => this.setState({ businesweb })}
                                tintColor="darkred"
                                keyboardType='url'
                                placeholder='Web or Social Profile Link'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView> 
                    </View>}
                   {this.state.showBusiness && <View style={{ marginTop: 5 }}>
                    <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Personal Info</Text>
                    </View>
                        <KeyboardAvoidingView>
                            <TextField
                                label='Name'
                                value={this.state.name}
                                onChangeText={(name) => this.setState({ name })}
                                tintColor="darkred"
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                      
                    <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Address Info</Text>
                    </View>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Line 1'
                                value={this.state.line1}
                                onChangeText={(line1) => this.setState({ line1 })}
                                tintColor="darkred"
                                placeholder='Street, PO BOX or Company'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                                characterRestriction={600}
                            />
                        </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Line 2'
                                value={this.state.line2}
                                onChangeText={(line2) => this.setState({ line2 })}
                                tintColor="darkred"
                                placeholder='Apartment, Suite, or Building'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                                characterRestriction={600}
                            />
                        </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Postal Code'
                                value={this.state.postal_code}
                                onChangeText={(postal_code) => this.setState({ postal_code })}
                                tintColor="darkred"
                                keyboardType='number-pad'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                        <View style={{ marginLeft: 7, marginTop: 7, flexDirection: 'row' }}>
                            <View style={{ flexBasis: '80%' }}>
                                <Dropdown containerStyle={{ marginLeft: 3, marginRight: 8, width: '100%', }}
                                    label='State'
                                    itemTextStyle={{ fontSize: 18, fontWeight: 'bold' }}
                                    value={this.state.state}
                                    data={this.state.stateData}
                                    onChangeText={text => this.setState({ state: text })}
                                />
                            </View>
                        </View>
                        <KeyboardAvoidingView>
                            <TextField
                                label='City'
                                value={this.state.city}
                                onChangeText={(city) => this.setState({ city })}
                                tintColor="darkred"
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Mobile Phone'
                                value={this.state.phone}
                                onChangeText={(phone) => this.setState({ phone })}
                                tintColor="darkred"
                                keyboardType='number-pad'
                                placeholder='+15551234567'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                     <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Verification Details</Text>
                    </View>
                    <KeyboardAvoidingView>
                            <TextField
                                label='Tax ID'
                                value={this.state.taxId}
                                onChangeText={(taxId) => this.setState({ taxId })}
                                tintColor="darkred"
                                placeholder='00-0000000'
                                maxLength={10}
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView>
                   
                        <View style={{ width: '100%', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 10, color: 'gray', fontSize: 15, fontWeight: 'bold' }}>Business Details</Text>
                    </View>
                        <KeyboardAvoidingView>
                            <TextField
                                label='Business Web'
                                value={this.state.businesweb}
                                onChangeText={(businesweb) => this.setState({ businesweb })}
                                tintColor="darkred"
                                keyboardType='url'
                                placeholder='Web or Social Profile Link'
                                containerStyle={{ marginLeft: 15, marginRight: 15 }}
                            />
                        </KeyboardAvoidingView> 
                    </View>}
                    <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                        <TouchableOpacity disabled={this.state.uploading} onPress={this.uploadData} style={{ width: wp('90%'), height: hp('5%'), backgroundColor: 'darkred', borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                            {this.state.uploading === false && <Text style={{ color: 'white', fontSize: 20 }}>SUBMIT</Text>}
                            {this.state.uploading === true && <ActivityIndicator size={20} animating color='white' />}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
function mapStateToProps(state) {
    return ({
        UID: state.rootReducer.UID
    })
}
function mapActionsToProps(dispatch) {
    return ({

    })
}
export default connect(mapStateToProps, mapActionsToProps)(PaymentInfo)
