import React from 'react'
import {Navbar} from '../Navbar'
import { MdEdit } from "react-icons/md";
import '../../css/ViewRow.scss'
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies} from '../../helpers/session/auth'
import { deleteState } from '../../localStorage'
import {connect} from 'react-redux'
import {updateUserData} from '../../actions/updateUserData.js'
import UpdateUserDataModal from '../ModalComponents/UpdateUserDataModal'
import DataContainerField from '../DataContainerField';

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


class ViewUsersManageRowComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            userData: null,
            showModal: false
        }
    }

    requestRowData = () => {
        const params = getUrlParams(window.location.href)
        fetch('http://ugomes.com:8080/orgs/get_user_data?orgId='+getSessionCookie(ORG_TOKEN)+"&userId="+params.userId,{
            method: "GET",
            headers: {'x-access-token': getSessionCookie(USER_TOKEN)}
        })
            .then(res => {
                switch(res.status){
                    case 200:
                        return res.json()
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
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                }else{
                    this.setState({
                        userData: res.userData
                    })
                }
                return res
            })
            .catch(err => {
                throw err
            })
    }

    componentDidMount(){
        this.requestRowData()
    }
    
    toggleModal = () => {
        const { showModal } = this.state
        let newState = {
            showModal: !showModal
        }
        this.setState(newState)
    }

    render(){
        return (
            <div>
                <ModalBox dataFields={
                    <UpdateUserDataModal userData={this.state.userData} toggleModal={this.toggleModal}/>
                } isShown={this.state.showModal} toggleModal={this.toggleModal}/>

                <div id="content-viewrow" style={{display: "flex"}}>

                    <div id="field-data-containers">
                        <div id="header">
                            <h1>User</h1>
                            <button className="btn" onClick={this.toggleModal}><MdEdit /></button>
                            {/* <button className="btn" onClick={() => {this.toggleModal('add')}} style={{fontSize: "20px"}}><IoIosAdd /></button>
                            <button className="remove-btn" onClick={() => {
                                this.toggleModal('conf_delete_table')}}><MdDelete /></button> */}
                        </div>

                        <div className="content">
                            {(this.state.userData !== null && this.state.userData !== undefined) ?
                                <div className="field-display-container">
                                    <DataContainerField label="Username" value={this.state.userData.username} />
                                    <DataContainerField label="Phone" value={this.state.userData.phone} />
                                    <DataContainerField label="Email" value={this.state.userData.email} />
                                    <DataContainerField label="Job role" value={this.state.userData.jobRole} />
                                    <DataContainerField label="Admin" value={(this.state.userData.admin === true) ? "Yes" : "No"} />
                                </div>
                            : ""}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
  return {
    userData: state
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (newData) => dispatch(updateUserData(newData))
  }
}

export const ViewUsersManageRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewUsersManageRowComponent)
