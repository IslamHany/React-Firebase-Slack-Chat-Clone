import React, {Component, Fragment} from 'react';
import {Menu, Icon, Modal, Form, Button, Input, Label} from "semantic-ui-react";
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../actions';

class Channels extends Component{
  
  state = {
    user: this.props.currentUser,
    channel: null,
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages'),
    typingRef: firebase.database().ref('typing'),
    notifications: [],
    firstLoad: true,
    activeChannel: ''
  };

  componentDidMount(){
    this.addListeners();
  };

  componentWillUnmount(){
    this.removeListeners();
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach(channel => {
      this.state.messagesRef.child(channel.id).off();
    });
  };

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState({channels: loadedChannels}, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId => {
    this.state.messagesRef.child(channelId).on('value', snap => {
      if(this.state.channel){
        this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(notification => notification.id === channelId);
    if(index !== -1){
      if(channelId !== currentChannelId){
        lastTotal = notifications[index].total;
        if(snap.numChildren() - lastTotal > 0){
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    }else{
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }
    
    this.setState({notifications});
  };

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if(this.state.firstLoad && this.state.channels.length > 0){
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({channel: firstChannel});
    }
    this.setState({firstLoad: false});
  };

  closeModal = () => {
    this.setState({modal: false});
  };

  openModal = () => {
    this.setState({modal: true});
  };

  handleChange = e => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleSubmit = e => {
    e.preventDefault();
    if(this.isFormValid(this.state)){
      this.addChannel();
    }
  };

  addChannel = () => {
    const {channelsRef, channelName, channelDetails, user} = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    
    channelsRef.child(key).update(newChannel).then(() => {
      this.setState({channelName: '', channelDetails: ''});
      this.closeModal();
      console.log('Channel Added');
    })
    .catch(err => console.error(err));
  };

  isFormValid = ({channelName, channelDetails}) => {
    return channelDetails && channelName;
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.state.typingRef.child(this.state.channel.id).child(this.state.user.uid).remove();
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({channel});
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);
    if(index !== -1){
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({notifications: updatedNotifications});
    }
  };

  setActiveChannel = channel => {
    this.setState({activeChannel: channel.id});
  };

  displayChannels = channels => {
    if(channels.length > 0){
      return channels.map(channel => (
        <Menu.Item
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{opacity: 0.7}}
          active={channel.id === this.state.activeChannel}
        >
          {this.getNotificationCount(channel) && (
            <Label color="red">{this.getNotificationCount(channel)}</Label>
          )}
          # {channel.name}
        </Menu.Item>
      ));
    }else{
      return null;
    }
  };

  getNotificationCount = channel => {
    let count = 0;
    this.state.notifications.forEach(notification => {
      if(notification.id === channel.id){
        count = notification.count;
      }
    });
    if(count > 0) return count;
  };
  
  render(){
    
    const {channels, modal, channelName, channelDetails} = this.state;
    
    return(
      <Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange"/> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal}/>
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input 
                  fluid
                  label="Name Of The Channel"
                  name="channelName"
                  onChange={this.handleChange}
                  value={channelName}
                />
              </Form.Field>
              <Form.Field>
                <Input 
                  fluid
                  label="About The Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                  value={channelDetails}
                />
              </Form.Field>
              <Button color="green" inverted>
                <Icon name='checkmark' onClick={this.handleSubmit}/> Add
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name='remove' /> Cancel
              </Button>
            </Form>
          </Modal.Content>
        </Modal>
      </Fragment>
    );
  };
};

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);