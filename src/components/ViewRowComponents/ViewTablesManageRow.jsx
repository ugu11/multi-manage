import React from 'react'
import {Navbar} from '../Navbar'
import {IoIosAdd} from 'react-icons/io'
import { MdEdit, MdDelete } from "react-icons/md";
import '../../css/ViewRow.scss'
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'

import {connect} from 'react-redux'
import {updateUserData} from '../../actions/updateUserData.js'

import UpdateFieldModalData from '../ModalComponents/UpdateFieldModalData'
import AddFieldModalData from '../ModalComponents/AddFieldModalData'
import DeleteTableModalData from '../ModalComponents/DeleteTableModalData'
import ProcessingComponent from '../ProcessingComponent';

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


class ViewTablesManageRowComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            showModal: false,
            dataSubmited: false,
            sectionIndex: 0,
            index: 0,
            selectFieldValue: "",
            modalFieldData: {},
            tableFields: null,
            tableName: "",
            modalTypeToShow: 'update',
            fieldToDeleteIndex: null,
            processingRequest: false
        }
    }

    requestRowData = () => {
        const params = getUrlParams(window.location.href)
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getOrgTableData?orgId='+getSessionCookie(ORG_TOKEN)+'&tableId='+params.tableId+'&tokenId='+getSessionCookie(USER_TOKEN))
            .then(res => res.json())
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                }
                return res
            })
            .then(res => {
                let tableFields = res.fields

                if(tableFields.length > 10){
                    let splitFieldData = []
                    splitFieldData[1] = tableFields.splice(10)
                    splitFieldData[0] = tableFields
                    this.setState({
                        tableFields: splitFieldData,
                    })
                }else{
                    this.setState({
                        tableFields: [[...tableFields]],
                        tableName: res.name
                    })

                }

            })
    }

    componentDidMount(){
        this.requestRowData()
    }
    
    toggleModal = (type) => {
        const { showModal } = this.state
        let newState = {
            showModal: !showModal
        }
        if(newState.showModal === false)
            this.requestRowData()
        else
            newState.modalTypeToShow = type
        this.setState(newState)
    }
    
    handleEditField = (sectionIndex, i) => {
        this.setState({
            sectionIndex: sectionIndex,
            index: i
        })
    }

    handleFieldDeleteRequest = (index) => {
        if(this.state.dataSubmited === false){
            this.setState({dataSubmited: true, processingRequest: true})
            fetch('https://us-central1-multi-manage.cloudfunctions.net/deleteTableField', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tableId: getUrlParams(window.location.href).tableId,
                        tokenId: getSessionCookie(USER_TOKEN),
                        fieldIndex: this.state.fieldToDeleteIndex
                    }),
                })
                .then(res => {
                    if(res.json().status === "deauth"){
                        deleteSessionCookies()
                        window.location.reload(false)
                    }
                    return res
                })
                .then(res => {
                    this.toggleModal()
                })
                .catch(err => {
                    throw err
                })
        }
    }

    render(){
        return (
            <div>
                <ModalBox dataFields={
                    (this.state.modalTypeToShow === 'update') ?
                        <UpdateFieldModalData tableFields={this.state.tableFields} toggleModal={this.toggleModal}
                            sectionIndex={this.state.sectionIndex} index={this.state.index} />
                    : (this.state.modalTypeToShow === 'add') ? 
                        <AddFieldModalData />
                    : (this.state.modalTypeToShow === 'conf_delete_field') ? 
                        <div id="deleteModalAlert">
                            <ProcessingComponent radius="0" display={this.state.processingRequest} />
                            <h1>Warning</h1>
                            <h3>Are you sure you wanna delete this field?</h3>
                            <label><b>ALL THE DATA</b> associated with this field will be <b>DELETED</b>!</label>
                            <div>
                                <button className="secondary-btn" onClick={this.toggleModal}>Cancel</button>
                                <button className="btn" onClick={this.handleFieldDeleteRequest}>Delete</button>
                            </div>
                        </div>
                    : (this.state.modalTypeToShow === 'conf_delete_table') ? 
                        <DeleteTableModalData tableName={this.state.tableName} toggleModal={this.toggleModal}/>
                    : ""
                } isShown={this.state.showModal} toggleModal={this.toggleModal}/>
                <Navbar />

                <div id="content-viewrow" style={{display: "flex"}}>

                    <div id="field-data-containers">
                        <div id="header">
                            <h1>{this.state.tableName}</h1>
                            <button className="btn" onClick={() => {this.toggleModal('add')}} style={{fontSize: "20px"}}><IoIosAdd /></button>
                            <button className="remove-btn" onClick={() => {
                                this.toggleModal('conf_delete_table')}}><MdDelete /></button>
                        </div>
                        <div style={{display: "flex"}}>
                            
                            {(this.state.tableFields !== null) ?
                                this.state.tableFields.map((section, sectionIndex) => 
                                    <ul key={sectionIndex} className="table-data-ul">
                                        {Array.from(section).map((field, i) => 
                                                <li key={field.name}>
                                                    <div className="table-data-field-display-container">
                                                        <div className="content-header">
                                                            <h2>{field.name}</h2>
                                                            <button className="btn" onClick={() => {
                                                                this.setState({sectionIndex: sectionIndex, index: i})
                                                                this.toggleModal('update')}}><MdEdit /></button>
                                                            <button className="remove-btn" onClick={() => {
                                                                this.setState({fieldToDeleteIndex: i})
                                                                this.toggleModal('conf_delete_field')}}><MdDelete /></button>
                                                        </div>
                                                        <div className="content">
                                                            <label><b>Type:</b> {(field.type === 'tel') ? "phone" : field.type}</label>
                                                            <label><b>Display in table:</b> {(field.display_table) ? "Yes" : "No"}</label>
                                                            {(field.type === 'select') ?
                                                                <div>
                                                                    <label><b>Select field values</b></label>
                                                                    <ul>
                                                                        {field.select_data.map(value => <li>{value}</li>)}
                                                                    </ul>
                                                                </div>
                                                            : ""}
                                                        </div>
                                                    </div>
                                                </li>
                                        )}
                                        {/* {JSON.stringify(section)} */}
                                    </ul>
                                )
                            : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

// export default ViewRow

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

export const ViewTablesManageRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewTablesManageRowComponent)
