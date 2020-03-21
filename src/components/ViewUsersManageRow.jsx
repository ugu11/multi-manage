import React from 'react'
import {Navbar} from './Navbar'
import {IoIosRemoveCircleOutline, IoIosAdd} from 'react-icons/io'
import { MdEdit, MdDelete } from "react-icons/md";
import '../css/ViewRow.scss'
import ModalBox from './ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../helpers/session/auth'

import {connect} from 'react-redux'
import {updateUserData} from '../actions/updateUserData.js'
import UpdateUserDataModal from './UpdateUserDataModal'

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
        console.log("MOUNTEDDDD")

        fetch('https://us-central1-multi-manage.cloudfunctions.net/getOrgUserData?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN)+"&userId="+params.userId)
            .then(res => {
                switch(res.status){
                    case 200:
                        return res.json()
                    case 401:
                        window.location = "/"
                        break
                }
            })
            .then(res => {
                console.log(res)
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
        const { showModal, unsaved } = this.state
        let newState = {
            showModal: !showModal
        }
        this.setState(newState)
    }
    
    // handleEditField = (sectionIndex, i) => {
    //     this.setState({
    //         sectionIndex: sectionIndex,
    //         index: i
    //     })
    // }

    // handleFieldDeleteRequest = (index) => {
    //     this.setState({dataSubmited: true})
    //     fetch('https://us-central1-multi-manage.cloudfunctions.net/deleteTableField', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 orgId: getSessionCookie(ORG_TOKEN),
    //                 tableId: getUrlParams(window.location.href).tableId,
    //                 tokenId: getSessionCookie(USER_TOKEN),
    //                 fieldIndex: this.state.fieldToDeleteIndex
    //             }),
    //         })
    //         .then(res => {
    //             console.log(res)
    //             if(res.json().status === "deauth"){
    //                 deleteSessionCookies()
    //                 window.location.reload(false)
    //             }
    //             return res
    //         })
    //         .then(res => {
    //             this.toggleModal()
    //         })
    //         .catch(err => {
    //             throw err
    //         })
    // }

    render(){
        return (
            <div>
                <ModalBox dataFields={
                    <UpdateUserDataModal userData={this.state.userData} toggleModal={this.toggleModal}/>
                } isShown={this.state.showModal} toggleModal={this.toggleModal}/>
                <Navbar />

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
                            <div className="user-display-container">
                                {(this.state.userData !== null && this.state.userData !== undefined) ?
                                    <div style={{display: "flex", flexFlow: "column"}}>
                                        <label className="big-label"><b>Name: </b>{this.state.userData.name}</label>
                                        <label><b>Username:</b> {this.state.userData.username}</label>
                                        <label><b>Phone: </b> {this.state.userData.phone}</label>
                                        <label><b>Email: </b> {this.state.userData.email}</label>
                                        <label><b>Job Role: </b> {this.state.userData.jobRole}</label>
                                        <label><b>Admin: </b> {(this.state.userData.admin) ? "Yes" : "No"}</label>
                                    </div>
                                : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

// export default ViewRow

const mapStateToProps = state => {
  console.log(state)
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
