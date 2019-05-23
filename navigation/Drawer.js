
import React from 'react'
import {createAppContainer,createStackNavigator,createSwitchNavigator,createDrawerNavigator} from 'react-navigation'
import HomeScreen from '../screens/homescreen'
import Conversation from '../screens/conversations'
import Filter from '../screens/filter'
import Profila from '../screens/profila'
import Signup from '../screens/signup'
import ProviderLogin from '../screens/ProviderLogin'
import LoginScreen from '../screens/login'
import Chat from '../screens/ChatGifted'
import Shipping from '../screens/Shipping'
import Splash from '../screens/Splash'
import Report from '../screens/Report'
import Credit from '../screens/Credit'
import ListingScreen from '../screens/listingform'
import PaymentInfo from '../screens/PaymentInfo'
import BankDetails from '../screens/BankDetails'
import MenuDrawer from '../components/MenuDrawerComp'
import { Dimensions } from "react-native";
const Width = Dimensions.get('window').width
const conversationStack = createStackNavigator({
    Conversations:Conversation,
    Chat:Chat
},{headerMode:'none',initialRouteName:'Conversations'})
const profileStack = createStackNavigator({
  Profile:Profila,
  Shipping:{
    screen:Shipping,
    
  }
},{initialRouteName:'Profile',headerMode:'none'})

profileStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName === "Shipping") {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }

  return {
    tabBarVisible
  };
};
const paymentStack = createStackNavigator({
  PaymentInfo:PaymentInfo,
  BankDetails:BankDetails
},
{
  initialRouteName:'PaymentInfo',headerMode:'none'
}
)
paymentStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName === "PaymentInfo") {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }

  return {
    tabBarVisible
  };
};
conversationStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName === "Chat") {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }

  return {
    tabBarVisible
  };
};
const Stack = createStackNavigator({
    Filter:Filter,
    HomeScreen:HomeScreen,
    Chat:Chat,
    ListingScreen:ListingScreen,
    Report,
    Credit
},{
    headerMode:'none',
    initialRouteName:'HomeScreen'
})
const LoginStack = createStackNavigator({
    LoginScreen:LoginScreen,
    Signup:Signup,
    SplashScreen:Splash,
    ProviderLogin:ProviderLogin
},
{
    initialRouteName:'SplashScreen',
    headerMode:'none'
}
)
LoginStack.navigationOptions = ({navigation})=>{
    let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
}
const drawerConfig={
  drawerWidth:Width*0.73,
  contentComponent:({navigation})=>{
      return <MenuDrawer navigation={navigation} /> 
  }
}
const drawerNavigator = createDrawerNavigator({
  HomeScreen:Stack,
  Profile:profileStack,
  Conversations:conversationStack,
  Payment:paymentStack
},drawerConfig)
const rootSwitch = createSwitchNavigator({
    Login:LoginStack,
    DrawerNavigator:drawerNavigator,
    
})
export default createAppContainer(rootSwitch)

