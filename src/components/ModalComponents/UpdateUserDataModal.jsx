import React from 'react'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import { deleteState } from '../../localStorage'
import ProcessingComponent from '../ProcessingComponent'

class UpdateUserDataModal extends React.Component{
    constructor(props){
        super(props)
        
        this.state = {
            userData: null,
            dataSubmited: false,
            processingRequest: false
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.userData == null && prevState.userData !== this.props.userData)
            this.setState({
                userData: this.props.userData,
            })
    }
    submitUpdate = (e) => {
        e.preventDefault()

        if(this.state.dataSubmited === false){
            this.setState({dataSubmited: true, processingRequest: true})
            fetch('https://us-central1-multi-manage.cloudfunctions.net/updateOrgUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tokenId: getSessionCookie(USER_TOKEN),
                        userData: JSON.stringify(this.state.userData)
                    }),
                })
                .then(res => {
                    switch(res.status){
                        case 200:
                            return res.json()
                        case 401:
                            window.location = "/"
                            break
                        default:
                            window.reload(false)
                    }
                })
                .then(res => {
                    if(res.status === "deauth"){
                        deleteSessionCookies()
                        deleteState()
                        window.location.reload(false)
                    }else if(res === 'success'){
                        this.props.toggleModal()
                    }
                })
                .catch(err => {
                    window.location.reload(false)
                })
        }
    }

    handleFieldUpdate = (e) => {
        let {userData} = this.state
        userData[e.target.name] = e.target.value
        userData.admin = (userData.admin === 'true') ? true
            : (userData.admin === 'false') ? false : false
        
        this.setState({userData: userData})
    }

    render(){
        return (
            <div>
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Update user data</h1>
                <form onSubmit={this.submitUpdate}>
                    {
                        (this.state.userData !== null && this.state.userData !== undefined) ?
                            <div>
                                <input type="text" className="txt-field" onChange={this.handleFieldUpdate} name="name" placeholder="Name" value={this.state.userData.name}/>
                                <input type="text" className="txt-field" onChange={this.handleFieldUpdate} name="username" placeholder="Username" value={this.state.userData.username}/>
                                <input type="text" className="txt-field" onChange={this.handleFieldUpdate} name="jobRole" placeholder="Job Role" value={this.state.userData.jobRole}/>
                                <input type="tel" className="txt-field" onChange={this.handleFieldUpdate} name="phone" placeholder="Phone" value={this.state.userData.phone}/>
                                <select className="txt-field" onChange={this.handleFieldUpdate} name="admin" defaultValue={this.state.userData.admin}>
                                    <option value={true}>Yes</option>
                                    <option value={false}>No</option>
                                </select>
                            </div>
                        : ""
                    }

                    <input type="submit" className="btn" value="Apply changes"/>
                </form>
            </div>
        )
    }
}

export default UpdateUserDataModal