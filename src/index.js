import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import { AppComponent } from './App.jsx';
import Login from './Login'
import Register from './Register'
import {ViewRow} from './ViewRow'
import { isSessionCookieSet, USER_TOKEN, ORG_TOKEN } from './helpers/session/auth.js'
import { Route, Link, BrowserRouter as Router, Redirect } from 'react-router-dom'
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {userData} from './reducers/userData.js'

const store = createStore(userData)

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
        isSessionCookieSet(USER_TOKEN) && isSessionCookieSet(ORG_TOKEN)
        ? <Component {...props} />
        : <Redirect to='/login' />
    )} />
)

// const routing = (
//     <Router>
//         <div>
//             <PrivateRoute exact path="/" component={<Provider store={store}> <AppComponent/> </Provider>}/>
//             <Route path="/login" component={Login}/>
//             <Route path="/register" component={Register}/>
//             <PrivateRoute path="/viewrow" component={ViewRow}/>
//         </div>
//     </Router>
// )

function routing() {
    return (
        <Router>
            <div>
                <PrivateRoute exact path="/" component={() => <Provider store={store}> <AppComponent/> </Provider>}/>
                <Route path="/login" component={Login}/>
                <Route path="/register" component={Register}/>
                <PrivateRoute path="/viewrow" component={() => <Provider store={store}> <ViewRow/> </Provider>}/>
            </div>
        </Router>
    )
}

ReactDOM.render(routing(), document.getElementById('root'));
