import React from 'react'
import './css/AuthPage.scss'
import './helpers/session/auth.js'
import { setSessionCookie } from './helpers/session/auth.js'

class OrgAuth extends React.Component{
    constructor(){
        super()

        this.state = {
            authType: 'login' // login - register
        }
    }

    toggleAuthType = (e) => {
        let {authType} = this.state

        if(authType === 'login')
            authType = 'register'
        else
            authType = 'login'

        this.setState({
            authType: authType,
        })
    }

    handleOrgId = (e) => {
    }


    render(){
        switch(this.state.authType){
            case 'register':
                return (
                    <Register authTypeHandler={this.toggleAuthType}/>
                )
            case 'login':
            default:
                return (
                    <Login authTypeHandler={this.toggleAuthType}/>
                )
        }
    }

}

class Login extends React.Component{
    constructor(){
        super()
        this.state = {
            orgId: "",
            orgPassword: "",
            cred: "",
            userEmail: "",
            userPassword: "",
            loginState: "org_login"
        }
    }

    orgIdHandlerOnChange = (e) => {
        this.setState({
            orgId: e.target.value
        })
    }

    orgPasswordHandlerOnChange = (e) => {
        this.setState({
            orgPassword: e.target.value
        })
    }


    userEmailHandlerOnChange = (e) => {
        this.setState({
            userEmail: e.target.value
        })
    }

    userPasswordHandlerOnChange = (e) => {
        this.setState({
            userPassword: e.target.value
        })
    }


    render(){
        return (
            <div className='auth-bg'>
                <div className="auth-container">
                    {(this.state.loginState === 'org_login')
                        ?
                            <div>
                                <h1>Organization Log in</h1>

                                <form onSubmit={async e =>  {
                                    e.preventDefault();
                                    const reqData = {
                                        name_id: this.state.orgId,
                                        password: this.state.orgPassword
                                    }
                                    
                                    fetch('https://us-central1-multi-manage.cloudfunctions.net/orgLogin', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(reqData)})
                                        .then(res => res.json())
                                        .then(orgLoginResp => {
                                            console.log(orgLoginResp)
                                            if(orgLoginResp.status === 'success'){
                                                this.setState({
                                                    cred: orgLoginResp.cred,
                                                    loginState: 'user_login'
                                                })
                                            }
                                        })
                                }}>
                                    <input type="text" className="txt-field" value={this.state.orgId} onChange={this.orgIdHandlerOnChange} placeholder="Organization id"/>
                                    <input type="password" className="txt-field" value={this.state.orgPassword} onChange={this.orgPasswordHandlerOnChange} placeholder="Password"/>
            
                                    <input type="submit" className="btn auth-submit" value="Log in organization"/>
                                    <button className="button-label" onClick={this.props.authTypeHandler}>New to the app? Register your organization now!</button>
                                </form>
                            </div>
                        : (this.state.loginState === 'user_login') ?
                            <div>
                                <h1>User Log in</h1>

                                <form onSubmit={e => {
                                    e.preventDefault();
                                    const reqData = {
                                        orgId: this.state.cred,
                                        userEmail: this.state.userEmail,
                                        userPassword: this.state.userPassword
                                    }
                                    
                                    fetch('https://us-central1-multi-manage.cloudfunctions.net/userLogin', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(reqData)})
                                        .then(res => res.json())
                                        .then(userLoginResp => {
                                            console.log(userLoginResp)
                                            if(userLoginResp.status === 'success'){
                                                setSessionCookie(userLoginResp.idToken)
                                                window.location = "/"
                                            }
                                            // Manage session here!!!
                                        })
                                }}>
                                    <input type="email" className="txt-field" value={this.state.userEmail} onChange={this.userEmailHandlerOnChange} placeholder="User email"/>
                                    <input type="password" className="txt-field" value={this.state.userPassword} onChange={this.userPasswordHandlerOnChange} placeholder="User Password"/>
            
                                    <input type="submit" className="btn auth-submit" value="Log in organization"/>
                                    <button className="button-label" onClick={this.props.authTypeHandler}>New to the app? Register your organization now!</button>
                                </form>
                            </div>
                        : ""

                    }
                </div>
            </div>
        )
    }
}

export default OrgAuth