import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import { routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/es/storage' // default: localStorage

import signupReducer from './Views/SignUp/reducers';
import signinReducer from './Views/SignIn/reducers';
import userProfileReducer from './Views/UserProfile/reducers';
import userReducer from './modules/user/reducers';

import { projectReducer } from './Views/ProjectSubview/reducers';
import { overviewReducer } from './Views/ProjectOverview/reducers';
import { publicProjectReducer } from './Views/PublicProjects/reducers'
import { subviewErrorAlert, projectSubviewNavigator } from './Views/ProjectSubview/middleware';
import { overviewErrorAlert, projectOverviewNavigator } from './Views/ProjectOverview/middleware';
import { publicProjectsErrorAlert } from './Views/PublicProjects/middleware'


// ---- Redux persist integration ----
// redux persist for storing f.e. user data on a webpage refresh
const config = {
    key: 'root',
    storage,
  }
// our persistent reducers
const persistentUserReducer = persistReducer(config, userReducer);


const rootReducer = combineReducers({
    signup: signupReducer,
    signin: signinReducer,
    userProfile: userProfileReducer,
    user: persistentUserReducer, // stores the current(active) users information
    routing: routerReducer,
    projectinfo: projectReducer, // stores the current project
    projectoverview: overviewReducer, // stores all projects of current user
    publicprojects : publicProjectReducer
});


// ---- React Router+Redux integration ----
// Create a history of your choosing 
// (we're using a browser history in this case)
export const history = createHistory()

// Build the middleware for intercepting and dispatching navigation actions
const router = routerMiddleware(history)
// our store
const store = createStore(
    rootReducer,
    applyMiddleware(thunk, logger, router,
        overviewErrorAlert, projectOverviewNavigator,
        subviewErrorAlert, projectSubviewNavigator,
        publicProjectsErrorAlert)
);

// to persist certain redux store objects (for React)
export const persistor = persistStore(store)

export default store;

