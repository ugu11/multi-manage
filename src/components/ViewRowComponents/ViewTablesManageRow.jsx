import React from 'react'
import {IoIosAdd} from 'react-icons/io'
import { MdEdit, MdDelete } from "react-icons/md";
import '../../css/ViewRow.scss'
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import { deleteState } from '../../localStorage'

import {connect} from 'react-redux'
import {updateUserData} from '../../actions/updateUserData.js'

import UpdateFieldModalData from '../ModalComponents/UpdateFieldModalData'
import AddFieldModalData from '../ModalComponents/AddFieldModalData'
import DeleteTableModalData from '../ModalComponents/DeleteTableModalData'
import ProcessingComponent from '../ProcessingComponent';
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
    // '&tokenId='+getSessionCookie(USER_TOKEN)
    requestRowData = () => {
        const params = getUrlParams(window.location.href)
        fetch('https://ugomes.com:8080/orgs/get_table_data?orgId='+getSessionCookie(ORG_TOKEN)+'&tableId='+params.tableId,{
            method: 'GET',
            headers: {"x-access-token": getSessionCookie(USER_TOKEN)}
        })
            .then(res => {
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
            .then(res => res.json())
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                }
                return res
            })
            .then(res => {
                let tableFields = res.tableData.fields

                console.log([tableFields] > 0 && tableFields !== null, res)
                
                this.setState({
                    tableFields: [tableFields],
                    tableName: res.tableData.name
                })

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
            fetch('https://ugomes.com:8080/orgs/delete_table_field', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-access-token': getSessionCookie(USER_TOKEN)
                 },
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tableId: getUrlParams(window.location.href).tableId,
                        fieldIndex: this.state.fieldToDeleteIndex
                    }),
                })
                .then(res => {
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
            (this.state.tableFields !== null && this.state.tableFields !== undefined && this.state.tableFields.length > 0) ? 
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

                <div id="content-viewrow" style={{display: "flex"}}>

                    <div id="field-data-containers">
                        <div id="header">
                            <h1>{this.state.tableName}</h1>
                            <button className="btn" onClick={() => {this.toggleModal('add')}} style={{fontSize: "20px"}}><IoIosAdd /></button>
                            <button className="remove-btn" onClick={() => {
                                this.toggleModal('conf_delete_table')}}><MdDelete /></button>
                        </div>
                        <div style={{display: "flex"}}>
                            
                            {(this.state.tableFields !== null && this.state.tableFields.length > 0) ?
                                this.state.tableFields.map((section, sectionIndex) => 
                                    <ul key={sectionIndex} className="table-data-ul">
                                        {Array.from(section).map((field, i) => 
                                            <li key={field.name} className="table-data-field-display-container">
                                                <div className="content-header">
                                                    <h2>{field.name}</h2>
                                                    <DataContainerField label="Type" value={(field.type === 'tel') ? "phone" : field.type} />
                                                    <DataContainerField label="Display in table" value={(field.display_table) ? "Yes" : "No"} />
                                                    <div className="field-actions">
                                                        <button className="secondary-btn" onClick={() => {
                                                            this.setState({sectionIndex: sectionIndex, index: i})
                                                            this.toggleModal('update')}}><MdEdit /></button>
                                                        <button className="remove-btn" onClick={() => {
                                                            this.setState({fieldToDeleteIndex: i})
                                                            this.toggleModal('conf_delete_field')}}><MdDelete /></button>
                                                    </div>
                                                </div>
                                                {(field.type === 'select') ?
                                                    <div className="content">
                                                        <div>
                                                            <label><b>Select field values</b></label>
                                                            <ul>
                                                                {field.select_data.map(value => <li>{value}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                : ""}
                                            </li>
                                        )}
                                    </ul>
                                )
                            : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
            : ""
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
