import React from 'react'
import { deleteSessionCookies, getSessionCookie, ORG_TOKEN, USER_TOKEN } from '../../helpers/session/auth.js'
import ProcessingComponent from '../ProcessingComponent.jsx'
import { deleteState } from '../../localStorage.js'

class CreateUserModal extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            name: "",
            username: "",
            phone: "",
            email: "",
            password: "",
            confPassword: "",
            admin: false,
            jobRole: "",
            processingRequest: false,
            dataSubmited: false
        }
    }

    submitUserCreationReq = async (e) => {
        e.preventDefault()
        if(this.state.password === this.state.confPassword && this.state.dataSubmited === false){
            this.setState({dataSubmited: true, processingRequest: true})
            fetch('https://us-central1-multi-manage.cloudfunctions.net/registerUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orgId: getSessionCookie(ORG_TOKEN),
                    tokenId: getSessionCookie(USER_TOKEN),
                    fullName: this.state.name,
                    username: this.state.username,
                    phone: this.state.phone,
                    email: this.state.email,
                    password: this.state.password,
                    isAdmin: this.state.admin,
                    jobRole: this.state.jobRole,
                }),
            })
            .then(res => {
                console.log(res)
                if(res.json().status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                }
                window.location.reload(false)
            }).catch(err => {
                if(err.status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                    window.location.reload(false)
                }else
                    throw err
            })
        }
    }

    handleInputChange = (e) => {
        let currState = this.state
        currState[e.target.name] = e.target.value
        currState.admin = (currState.admin === 'true') ? true : false

        this.setState(currState)
    }

    render(){
        return (
            <div>
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Create new user</h1>
                <form onSubmit={this.submitUserCreationReq}>
                    <input type="text" onChange={this.handleInputChange} className="txt-field" name="name" placeholder="Name" />
                    <input type="text" onChange={this.handleInputChange} className="txt-field" name="username" placeholder="Username" />
                    <input type="email" onChange={this.handleInputChange} className="txt-field" name="email" placeholder="Email" />
                    <input type="text" onChange={this.handleInputChange} className="txt-field" name="phone" placeholder="Phone" />
                    <input type="text" onChange={this.handleInputChange} className="txt-field" name="jobRole" placeholder="Job Role" />
                    <input type="password" onChange={this.handleInputChange} className="txt-field" name="password" placeholder="Password" />
                    <input type="password" onChange={this.handleInputChange} className="txt-field" name="confPassword" placeholder="Confirm Password" />
                    <label style={{float: "left"}}>Admin: </label>
                    <select onChange={this.handleInputChange} className="txt-field" name="admin" >
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                    
                    <input type="submit" className="btn" disabled={this.state.dataSubmited} value="Add new item"/>
                </form>
            </div>
        )
    }
}

export default CreateUserModal