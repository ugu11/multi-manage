import React from 'react'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import ProcessingComponent from '../ProcessingComponent';
import { deleteState } from '../../localStorage'

function getUrlParams(url) {
	var params = {};
	var parser = document.createElement('a')
	parser.href = url
	var query = parser.search.substring(1)
	var vars = query.split('&')
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=')
		params[pair[0]] = decodeURIComponent(pair[1])
	}
	return params
}
class DeleteTableModalData extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            step: "conf_delete", // ask_for_admin_pass
            adminPassword: "",
            displayError: false,
            processingRequest: false,
            dataSubmited: false
        }
    }

    handleAdminPasswordChange = (e) => this.setState({adminPassword: e.target.value})
    goToAdminPassStep = () => this.setState({step: 'ask_for_admin_pass'})

    handleTableDeleteRequest = () => {
        if(this.state.dataSubmited === false){
            this.setState({dataSubmited: true, processingRequest: true})
            fetch('https://ugomes.com/mm-api/delete_table', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': getSessionCookie(USER_TOKEN)
                     },
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tableId: getUrlParams(window.location.href).tableId,
                        adminPass: this.state.adminPassword
                    }),
                })
                .then(async (res) => {
                    switch(res.status){
                        case 401:
                            res =  await res.json()
                            switch(res.message){
                                case 'Unauthorized':
                                    deleteSessionCookies()
                                    deleteState()
                                    window.location.reload(false)
                                    break
                                case 'wrong_password':
                                    this.setState({displayError: true, dataSubmited: false, processingRequest: false})
                                    break
                                default:
                            }
                            break
                        case 200:
                            if(res.json().status === "deauth"){
                                deleteSessionCookies()
                                window.location.reload(false)
                            }else
                                window.location = "/?tableId=manage_tables"
                            break
                        case 403:
                            window.location = "/"
                            break
                        default:
                            window.location = "/"
                    }
                })
                .catch(err => {
                    throw err
                })
        }
    }
    
    render(){
        return (
            <div id="deleteModalAlert">
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Warning</h1>
                {(this.state.step === 'conf_delete') ? 
                    <div>
                        <h3>Are you sure you wanna delete this table? ({this.props.tableName})</h3>
                        <label><b>ALL THE DATA</b> in this table will be <b>DELETED</b>!</label>
                        <div className="two-btn-confirm-container">
                            <button className="secondary-btn" onClick={() => this.props.toggleModal('conf_delete_table')}>Cancel</button>
                            <button className="btn" onClick={this.goToAdminPassStep}>Delete</button>
                        </div>
                    </div>
                : (this.state.step === 'ask_for_admin_pass') &&
                    <div>
                        <h3>Insert your password to confirm this action</h3>
                        <label>You're about to delete the table <b>{this.props.tableName}</b></label><br/>
                        <input type="password" placeholder="Admin password" className="txt-field" value={this.state.adminPassword}
                            onChange={this.handleAdminPasswordChange} />
                        {(this.state.displayError === true) && <label className="error-message">Wrong password!</label> }
                        <div>
                            <button className="btn" onClick={this.handleTableDeleteRequest} disabled={this.state.adminPassword === ''}>Confirm Deletion</button>
                        </div>
                    </div> }
            </div>
        )
    }
}

export default DeleteTableModalData