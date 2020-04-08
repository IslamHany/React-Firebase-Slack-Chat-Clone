import React, { Component } from 'react';
import {Grid} from 'semantic-ui-react';
import './App.css';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {connect} from 'react-redux';

class App extends Component {
  render() {
    return (
      <Grid columns="equal" className="app" style={{background: this.props.secondaryColor, height: "auto"}}>
        <ColorPanel 
          currentUser={this.props.currentUser}
          key={this.props.currentUser && this.props.currentUser.name}
          />
        <SidePanel 
          key={this.props.currentUser && this.props.currentUser.uid}
          currentUser={this.props.currentUser}
          primaryColor={this.props.primaryColor}/>
        <Grid.Column style={{marginLeft: 320}}>
          <Messages 
            key={this.props.currentChannel && this.props.currentChannel.id}
            currentUser={this.props.currentUser}
            currentChannel={this.props.currentChannel}
            isPrivateChannel={this.props.isPrivateChannel}/>
        </Grid.Column>
        <Grid.Column width={4}>
          <MetaPanel 
            key={this.props.currentChannel && this.props.currentChannel.name}
            currentChannel={this.props.currentChannel}
            userPosts={this.props.userPosts}
            isPrivateChannel={this.props.isPrivateChannel}
            />
        </Grid.Column>
      </Grid>
    );
  }
};

const mapStateToProps = state => {
  return{
    currentUser: state.user.currentUser,
    userPosts: state.user.userPosts,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    primaryColor: state.colors.primaryColor,
    secondaryColor: state.colors.secondaryColor,
  };
};

export default connect(mapStateToProps)(App);
