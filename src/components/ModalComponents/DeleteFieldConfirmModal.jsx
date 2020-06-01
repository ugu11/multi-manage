import React from 'react'
import ProcessingComponent from '../ProcessingComponent';
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
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


class DeleteFieldConfirmModal extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            processingRequest: false,
            dataSubmited: false
        }
    }


    handleFieldDeleteRequest = (index) => {
        if(this.state.dataSubmited === false){
            this.setState({dataSubmited: true, processingRequest: true})
            fetch('https://ugomes.com/mm-api/delete_table_field', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-access-token': getSessionCookie(USER_TOKEN)
                 },
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tableId: getUrlParams(window.location.href).tableId,
                        fieldIndex: this.props.fieldToDeleteIndex
                    }),
                })
                .then(res => {
                    this.setState({dataSubmited: false, processingRequest: false})
                    switch(res.status){
                        case 200:
                            return res
                        case 401:
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                            break
                        case 403:
                            window.location = "/"
                            break
                        default:
                            window.location = "/"
                    }
                })
                .then(res => {
                    if(res.json().status === "deauth"){
                        deleteSessionCookies()
                        window.location.reload(false)
                    }
                    this.props.toggleModal('conf_delete_field')
                    return res
                })
                .catch(err => {
                    throw err
                })
        }
    }


    render(){
        return(
            <div id="deleteModalAlert">
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Warning</h1>
                <h3>Are you sure you wanna delete this field?</h3>
                <label><b>ALL THE DATA</b> associated with this field will be <b>DELETED</b>!</label>
                <div className="two-btn-confirm-container">
                    <button className="secondary-btn" onClick={this.props.toggleModal}>Cancel</button>
                    <button className="btn" onClick={this.handleFieldDeleteRequest}>Delete</button>
                </div>
            </div>
        )
    }
}

export default DeleteFieldConfirmModal