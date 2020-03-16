import React from 'react';
import './css/AuthPage.scss'
import { setSessionCookie, USER_TOKEN, ORG_TOKEN, isSessionCookieSet } from './helpers/session/auth.js'

class Register extends React.Component{
    constructor(){
        super()

        this.state = {
            passwordEqual: false,
            isSubmitDisabled: true,
            nameIdUnique: true,
            formData: {
                orgId: '',
                orgName: '',
                orgPassword: '',
                orgConfPassword: '',
                orgEmail: '',

                userFullName: '',
                username: '',
                userPhone: '',
                userEmail: '',
                userPassword: '',
                userConfPassword: '',

            },
            registerStep: 'org' // org - user_register
        }
    }

    validateFields = (formData) => {
        const {orgId, orgName, orgEmail, orgPassword, orgConfPassword} = formData
        const {nameIdUnique} = this.state
        
        this.checkForNameIdUniqueness(orgId)

        if(orgPassword === orgConfPassword && orgPassword !== '' && nameIdUnique === true)
            this.setState({
                isSubmitDisabled: false
            })
        else
            this.setState({
                isSubmitDisabled: true
            })
    }

    formHandler = (e) => {
        let {formData} = this.state
        formData[e.target.name] = e.target.value
        this.setState({
            formData: formData
        })
        this.validateFields(formData)
    }

    checkForNameIdUniqueness = (nameId) => {
        return fetch('https://us-central1-multi-manage.cloudfunctions.net/checkOrgNameIdUnique?name_id='+nameId)
            .then(res => res.json())
            .then(resp => {
                console.log(resp)
                this.setState({
                    nameIdUnique: resp.unique
                })
            })
    }

    render(){
        if(isSessionCookieSet(USER_TOKEN) && isSessionCookieSet(ORG_TOKEN))
                    window.location = "/"
        else
            switch(this.state.registerStep){
                case 'org':
                    return(
                        <div className='auth-bg'>
                            <div class="auth-container">
                                <h1>Register Organization</h1>
                                <form onSubmit={e => {
                                    e.preventDefault();
                                    this.setState({registerStep: 'user_register'}
                                )}}>
                                    <input type="text" className="txt-field" name="orgId" value={this.state.orgEd} placeholder="Organization id" onChange={this.formHandler}/>
                                    {(this.state.nameIdUnique === false) ? <label className="alert-label">Organization name id already in use</label> : ""}
                                    <input type="text" className="txt-field" name="orgName" value={this.state.orgName} placeholder="Organization name" onChange={this.formHandler}/>
                                    <input type="email" className="txt-field" name="orgEmail" value={this.state.orgEmail} placeholder="Organization email" onChange={this.formHandler}/>
                                    <input type="password" className="txt-field" name="orgPassword" value={this.state.orgPassword} placeholder="Password" onChange={this.formHandler}/>
                                    <input type="password" className="txt-field" name="orgConfPassword" value={this.state.orgConfPassword} placeholder="Confirm Password" onChange={this.formHandler}/>
                
                                    <input type="submit" className="btn auth-submit" disabled={this.state.isSubmitDisabled} value="Register organization"/>
                                    <button className="button-label" onClick={() => {window.location = "/login"}}>New to the app? Register your organization now!</button>
                                </form>
                            </div>
                        </div>
                    )
                case 'user_register':
                    return (
                        <div className='auth-bg'>
                            <div class="auth-container">
                                <h1>Create admin user</h1>
                                <form onSubmit={e => {
                                    e.preventDefault();

                                    const {formData} = this.state

                                    const reqData = {
                                        name_id: formData.orgId,
                                        orgEmail: formData.orgEmail,
                                        name: formData.orgName,
                                        orgPassword: formData.orgPassword,

                                        username: formData.username,
                                        fullName: formData.userFullName,
                                        email: formData.userEmail,
                                        password: formData.userPassword,
                                        phone: formData.userPhone
                                    }

                                    console.log(reqData)

                                    fetch('https://us-central1-multi-manage.cloudfunctions.net/registerOrg', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(reqData)})
                                        .then(res => res.json())
                                        .then(resp => {
                                            if(resp === 'success'){
                                                window.location = "/login"
                                            }
                                        })
                                }}>
                                    <input type="text" className="txt-field" name="userFullName" value={this.state.formData.userFullName} placeholder="Full Name" onChange={this.formHandler}/>
                                    <input type="text" className="txt-field" name="username" value={this.state.formData.username} placeholder="Username" onChange={this.formHandler}/>
                                    <input type="email" className="txt-field" name="userEmail" value={this.state.formData.userEmail} placeholder="Email" onChange={this.formHandler}/>
                                    <input type="tel" className="txt-field" name="userPhone" value={this.state.formData.userPhone} placeholder="Phone" onChange={this.formHandler}/>
                                    <input type="password" className="txt-field" name="userPassword" value={this.state.formData.userPassword} placeholder="Password" onChange={this.formHandler}/>
                                    <input type="password" className="txt-field" name="userConfPassword" value={this.state.formData.userConfPassword} placeholder="Confirm Password" onChange={this.formHandler}/>
            
                                    <input type="submit" className="btn auth-submit"  disabled={this.state.isSubmitDisabled} value="Create user"/>
                                    {/* <button className="button-label" onClick={this.props.authTypeHandler}>New to the app? Register your organization now!</button> */}
                                </form>
                            </div>
                        </div>
                    )

            }
    }
}

export default Register