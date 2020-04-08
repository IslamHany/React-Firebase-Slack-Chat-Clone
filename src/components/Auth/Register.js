import React, {Component} from 'react';
import firebase from '../../firebase';
import md5 from 'md5';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';

class Register extends Component{
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    };

    isFormValid = () => {
        let errors = [], error;
        if(this.isFormEmpty(this.state)){
            error = {message: 'Fill in all fields'};
            this.setState({errors: errors.concat(error)});
            return false;
        }else if(!this.isPasswordValid(this.state)){
            error = {message: 'Password is invalid'};
            this.setState({errors: errors.concat(error)});
            return false;
        }else if(!this.isEmailValid(this.state.email)){
            error = {message: 'Email is invalid'};
            this.setState({errors: errors.concat(error)});
            return false;
        }else {
            return true;
        }
    };

    isEmailValid = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    isPasswordValid = ({password, passwordConfirmation}) => {
        if(password.lenght < 6 || passwordConfirmation.length < 6){
            return false;
        }else if(password !== passwordConfirmation){
            return false;
        }
        return true;
    };

    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !password.length || !passwordConfirmation.length || !email.length;
    };

    displayErrors = errors => {
        return errors.map((error, i) => {
            return (
                <p key={i}>{error.message}</p>
            );
        });
    };

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    };

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        });
    };

    submitHandler = (e) => {
        e.preventDefault();
        if(this.isFormValid()){
            this.setState({errors: [], loading: true});
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(createdUser => {
                console.log(createdUser);
                createdUser.user.updateProfile({
                    displayName: this.state.username,
                    photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                })
                .then(() => {
                    this.saveUser(createdUser).then(() => {
                        console.log('user saved');
                    });
                })
                .catch(err => {
                    console.error(err);
                    const error = {message: err.message};
                    console.error(err.message);
                    this.setState({errors: this.state.errors.concat(error), loading: false});
                });
            })
            .catch(err => {
                const error = {message: err.message};
                console.error(err.message);
                this.setState({errors: this.state.errors.concat(error), loading: false});
            });
        }
    };
 
    handleInputError = (errors, inputName) => {
        return errors.some(error => {
            return error.message.toLowerCase().includes(inputName)
        }) ? "error" : "";
    }
    
    render(){
        const {username, email, password, passwordConfirmation, errors, loading} = this.state;
        return(
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange"/>
                        Register For DevChat
                    </Header>
                    <Form onSubmit={this.submitHandler} size="large">
                        <Segment stacked>
                            <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="Username" onChange={this.handleChange} type="text" value={username}/>
                            <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.handleChange} type="email" value={email} className={this.handleInputError(errors, 'email')}/>
                            <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password" value={password}
                            className={this.handleInputError(errors, 'password')}/>
                            <Form.Input fluid name="passwordConfirmation" icon="lock" iconPosition="left" placeholder="Password Confirmation" onChange={this.handleChange} type="password" value={passwordConfirmation}
                            className={this.handleInputError(errors, 'password')}/>
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Sign up</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Already a user ? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
};

export default Register;