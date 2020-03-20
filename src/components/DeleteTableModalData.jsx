import React from 'react'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../helpers/session/auth'

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
            displayError: false
        }
    }

    handleAdminPasswordChange = (e) => this.setState({adminPassword: e.target.value})
    goToAdminPassStep = () => this.setState({step: 'ask_for_admin_pass'})

    handleTableDeleteRequest = () => {

        fetch('https://us-central1-multi-manage.cloudfunctions.net/deleteTable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orgId: getSessionCookie(ORG_TOKEN),
                    tableId: getUrlParams(window.location.href).tableId,
                    tokenId: getSessionCookie(USER_TOKEN),
                    adminPass: this.state.adminPassword
                }),
            })
            .then(res => {
                switch(res.status){
                    case 401:
                        this.setState({displayError: true})
                        break
                    case 200:
                        console.log(res)
                        if(res.json().status === "deauth"){
                            deleteSessionCookies()
                            window.location.reload(false)
                        }else
                            window.location = "/?table=manage_tables"
                        break
                }
            })
            .catch(err => {
                throw err
            })
    }

    render(){
        return (
            <div id="deleteModalAlert">
                <h1>Warning</h1>
                {
                    (this.state.step === 'conf_delete') ? 
                        <div>
                            <h3>Are you sure you wanna delete this table? ({this.props.tableName})</h3>
                            <label><b>ALL THE DATA</b> in this table will be <b>DELETED</b>!</label>
                            <div>
                                <button className="secondary-btn" onClick={this.toggleModal}>Cancel</button>
                                <button className="btn" onClick={this.goToAdminPassStep}>Delete</button>
                            </div>
                        </div>
                    : (this.state.step === 'ask_for_admin_pass') ?
                        <div>
                            <h3>Insert your password to confirm this action</h3>
                            <label>You're about to delete the table <b>{this.props.tableName}</b></label><br/>
                            <input type="password" placeholder="Admin password" className="txt-field" value={this.state.adminPassword}
                                onChange={this.handleAdminPasswordChange} />
                            {(this.state.displayError === true) ?
                                <label className="error-message">Wrong password!</label>
                            : ""}
                            <div>
                                <button className="btn" onClick={this.handleTableDeleteRequest} disabled={this.state.adminPassword === ''}>Confirm Deletion</button>
                            </div>
                        </div>
                    : ""
                }
            </div>
        )
    }
}

export default DeleteTableModalData