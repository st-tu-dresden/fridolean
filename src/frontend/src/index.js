import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App/App';

import { Provider } from 'react-redux';
import store, {history, persistor} from './store';
import { PersistGate } from 'redux-persist/es/integration/react'

const Loading = () => (<div><h3>loading...</h3></div>)

//  use the provided PersistGate component for integration of redux persist.
// This will take care of delaying the rendering of the app
// until rehydration is complete.
ReactDOM.render(
<Provider store={store}>
    <PersistGate
      loading={<Loading />}
      persistor={persistor}
    >
        <App history={history}/>
    </PersistGate>
</Provider>,
document.getElementById('root'));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(const registration of registrations) {
            registration.unregister()
        }
    }).catch(function() {});
}
