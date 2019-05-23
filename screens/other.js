import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default class OthersScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
       <Text style={styles.text}>Others</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text:{
  fontSize:30
  }
});
