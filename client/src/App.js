import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { Provider } from 'react-redux';

import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';
import Landing from './components/layouts/Landing';

import Register from './components/auth/Register';
import Login from './components/auth/Login';

import setAuthToken from './utils/setAuthToken';
import { setCurrentUser } from './actions/authActions';

import store from './store';

import './App.css';

// Check for token
if(localStorage.jwtToken){
    // Set auth token header auth
    setAuthToken(localStorage.jwtToken);
    // Decode token and get user info and expiry
    const decoded = jwt_decode(localStorage.jwtToken);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
}


class App extends Component{
    render(){
        return(
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Route exact path='/' component={Landing} />
                        <div className="container">
                            <Route exact path='/register' component={Register} />
                            <Route exact path='/login' component={Login} />
                        </div>
                        <Footer />
                    </div>
                </Router>
            </Provider>
        )
    }
}

export default App;