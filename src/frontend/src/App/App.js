import React, {Component} from 'react';

import Header from '../Containers/Header/Header';
import Footer from '../Components/Footer/Footer';
import Home from '../Views/Home';
import SignUp from '../Views/SignUp/index';
import SignIn from '../Views/SignIn/index';
import EditorView from '../Views/EditorView/index';
import NotFound from '../Views/NotFound';
import ProjectSubview from '../Views/ProjectSubview/index';
import ProjectOverview from '../Views/ProjectOverview';
import PublicProjectView from '../Views/PublicProjects'
import UserProfile from '../Views/UserProfile/index';
import {getCanvasTypes, getCanvasInfo} from '../common/model/canvas';

import Auth from '../modules/Auth';
import LogoutFunction from '../Containers/LogOutFunction';
import jsLogger from '../common/errorhandler';
import {backendLocation} from '../api';

import {
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import { ConnectedRouter } from 'react-router-redux';

import initKeycloak from '../modules/Keycloak';
import kccallbacks from '../modules/Keycloak-callbacks.js';

if (process.env.REACT_APP_KEYCLOAK.valueOf() === "Y") {
    initKeycloak({
        "url": process.env.REACT_APP_KC_URL,
        "realm": process.env.REACT_APP_KC_REALM,
        "clientId": process.env.REACT_APP_KC_CLIENT,
    }, kccallbacks);
} else {
    initKeycloak(false, false);
    window.createLoginUrl = function() {
        return "/sign-in";
    }
    window.createLogoutUrl = function() {
        return "/sign-out"
    }
}

jsLogger.logUrl = backendLocation + "/jserror/jserror";
jsLogger.credentials = false;
jsLogger.attachErrorHandler();

let canvasPathNames=[];
getCanvasTypes().map(getCanvasInfo).forEach((info)=>{
    let result=info.view.split(" ").join("").toLowerCase();
    canvasPathNames.push(result);
    if(result.endsWith("canvas"))
        canvasPathNames.push(result.substring(0,result.length-6))
});

// only show if logged in
const PrivateRoute = ({ component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        Auth.isUserAuthenticated() ? (
            <Component {...props} {...rest} />
        ) : (
            <Redirect to={{
                pathname: "/sign-in",
                state: { from: props.location }
            }}/>
        )
    )}/>
)

// only show if logged out
const LoggedOutRoute = ({ component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        Auth.isUserAuthenticated() ? (
            <Redirect to={{
                pathname: "/",
                state: { from: props.location }
            }}/>
        ) : (
            <Component {...props} {...rest} />
        )
    )}/>
)

const PropsRoute = ({ component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        <Component {...props} {...rest} />
    )}/>
)


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            authenticated: false,
            printing: false
        };
        this.printingListener = this.printingListener.bind(this);
        this.toggleAuthenticationStatus = this.toggleAuthenticationStatus.bind(this);
    }

    componentDidMount() {
        // check if user is logged in on refresh
        this.toggleAuthenticationStatus();
        window.matchMedia("print").addListener(this.printingListener);
    }

    componentWillUnmount(){
        window.matchMedia("print").removeListener(this.printingListener);
    }

    printingListener(evt){
        this.setState({...this.state||{}, printing:evt.matches});
    }

    toggleAuthenticationStatus() {
        // check user auth status and set state
        this.setState({
            ...this.state||{},
            authenticated: Auth.isUserAuthenticated()
        });
    }

    render() {
        return(
            // { /* Tell the Router to use our enhanced history */ }
            <ConnectedRouter history={this.props.history}>
                <div style={{backgroundColor: /* See body->background-color for reasoning */ "white"}}>
                    {this.state.printing?"":<Header isAuthenticated={this.state.authenticated}/>}
                    <Switch>
                        <PropsRoute
                            exact
                            path="/"
                            component={Home}
                            toggleAuthenticationStatus={this.toggleAuthenticationStatus}
                        />
                        <PropsRoute
                            exact
                            path="/explore"
                            component={PublicProjectView}
                            toggleAuthenticationStatus={this.toggleAuthenticationStatus}
                        />
                        <LoggedOutRoute
                            path="/sign-up"
                            component={SignUp}
                        />
                        <LoggedOutRoute
                            path="/sign-in"
                            component={SignIn}
                            toggleAuthenticationStatus={this.toggleAuthenticationStatus}
                        />
                        {canvasPathNames.map((name)=>(
                            <PropsRoute
                                key={name}
                                path={"/projects/:projectId/editor/"+name}
                                component={EditorView}
                            />
                        ))}
                        <PropsRoute
                            path="/projects/:projectId"
                            component={ProjectSubview}
                        />
                        <PrivateRoute
                            path="/projects"
                            component={ProjectOverview}
                            toggleAuthenticationStatus={this.toggleAuthenticationStatus}
                        />
                        <PrivateRoute
                            path="/profile"
                            component={UserProfile}
                        />
                        <PrivateRoute
                            path="/sign-out"
                            component={LogoutFunction}
                        />
                        <Route component={NotFound}/>
                    </Switch>
                    {this.state.printing?"":<Footer/>}
                </div>
            </ConnectedRouter>
        );
    }
}

export default App;
