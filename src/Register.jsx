import React from 'react';
import './css/AuthPage.scss'
import { USER_TOKEN, ORG_TOKEN, isSessionCookieSet } from './helpers/session/auth.js'
import ProcessingComponent from './components/ProcessingComponent'

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
                jobRole: ''
            },
            registerStep: 'org', // org - user_register,
            isProcessing: false
        }
    }

    validateFields = (formData,) => {
        const {orgId, orgPassword, orgConfPassword, userPassword, userConfPassword, username} = formData
        const {nameIdUnique} = this.state
        let isPasswordValid
        
        switch(this.state.registerStep){
            case 'org':
                isPasswordValid = (orgPassword === orgConfPassword && orgPassword.length >= 6)
                const isOrgIdValid = (nameIdUnique === true && !orgId.trim().includes(' '))

                if(isPasswordValid && isOrgIdValid)
                    this.setState({
                        isSubmitDisabled: false
                    })
                else
                    this.setState({
                        isSubmitDisabled: true
                    })
                break
            case 'user_register':
                isPasswordValid = (userPassword === userConfPassword && userPassword.length >= 6)
                const isUsernameValid = (!username.trim().includes(' '))
                if(isPasswordValid && isUsernameValid)
                    this.setState({
                        isSubmitDisabled: false
                    })
                else
                    this.setState({
                        isSubmitDisabled: true
                    })
                break
            default:
                this.setState({registerStep: "org"})
        }
    }

    formHandler = (e) => {
        let {formData} = this.state
        formData[e.target.name] = e.target.value
        formData.orgId = formData.orgId.trim()
        formData.username = formData.username.trim()
        
        this.setState({
            formData: formData
        })
        if(e.target.name === 'orgId')
            this.checkForNameIdUniqueness(formData.orgId)

        this.validateFields(formData, e.target.name)
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
                            <div className="auth-container">
                                <h1>Register Organization</h1>
                                <form onSubmit={e => {
                                    e.preventDefault();
                                    this.setState({registerStep: 'user_register'}
                                )}}>
                                    <input type="text" className="txt-field" name="orgId" value={this.state.orgEd} placeholder="Organization id" onChange={this.formHandler} required />
                                    {(this.state.nameIdUnique === false) ? <label className="alert-label">Organization name id already in use</label> : ""}
                                    <input type="text" className="txt-field" name="orgName" value={this.state.orgName} placeholder="Organization name" onChange={this.formHandler} required />
                                    <input type="email" className="txt-field" name="orgEmail" value={this.state.orgEmail} placeholder="Organization email" onChange={this.formHandler} required />
                                    <input type="password" className="txt-field" name="orgPassword" value={this.state.orgPassword} placeholder="Password" onChange={this.formHandler} required />
                                    <input type="password" className="txt-field" name="orgConfPassword" value={this.state.orgConfPassword} placeholder="Confirm Password" onChange={this.formHandler} required />
                
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
                                <ProcessingComponent radius="20" display={this.state.isProcessing}/>
                                <h1>Create admin user</h1>
                                <form onSubmit={e => {
                                    e.preventDefault();
                                    this.setState({isProcessing: true})
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
                                        phone: formData.userPhone,
                                        jobRole: formData.jobRole
                                    }
                                    const isPasswordValid = (formData.orgPassword === formData.orgConfPassword && formData.orgPassword.length >= 6)
                                    const isOrgIdValid = (!formData.orgId.trim().includes(' '))
                                    const isUserIdValid = (!formData.username.trim().includes(' '))
                                    const isUserPasswordValid = (formData.userPassword === formData.userConfPassword && formData.userPassword.length >= 6)

                                    console.log(reqData)
                                    if(isPasswordValid && isOrgIdValid && isUserIdValid && isUserPasswordValid){
                                        console.log("REQUESTING")
                                        fetch('https://us-central1-multi-manage.cloudfunctions.net/registerOrg', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(reqData)})
                                            .then(res => {
                                                if(res.status === 200){
                                                    window.location = "/login"
                                                }
                                                this.setState({isProcessing: false})
                                            })
                                            .catch(e => this.setState({isProcessing: false}))}
                                }}>
                                    <input type="text" className="txt-field" name="userFullName" value={this.state.formData.userFullName} placeholder="Full Name" onChange={this.formHandler} required/>
                                    <input type="text" className="txt-field" name="username" value={this.state.formData.username} placeholder="Username" onChange={this.formHandler} required/>
                                    <input type="email" className="txt-field" name="userEmail" value={this.state.formData.userEmail} placeholder="Email" onChange={this.formHandler} required/>
                                    <input type="tel" className="txt-field" name="userPhone" value={this.state.formData.userPhone} placeholder="Phone" onChange={this.formHandler} required/>
                                    <input type="text" className="txt-field" name="jobRole" value={this.state.formData.jobRole} placeholder="Job Role" onChange={this.formHandler} required/>
                                    <input type="password" className="txt-field" name="userPassword" value={this.state.formData.userPassword} placeholder="Password" onChange={this.formHandler} required/>
                                    <input type="password" className="txt-field" name="userConfPassword" value={this.state.formData.userConfPassword} placeholder="Confirm Password" onChange={this.formHandler} required/>
            
                                    <input type="submit" className="btn auth-submit"  disabled={this.state.isSubmitDisabled} value="Create user"/>
                                    {/* <button className="button-label" onClick={this.props.authTypeHandler}>New to the app? Register your organization now!</button> */}
                                </form>
                            </div>
                        </div>
                    )
                default:
                    this.setState({registerStep: "org"})

            }
    }
}

export default Register