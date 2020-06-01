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
import DataContainerField from '../DataContainerField';
import DeleteFieldConfirmModal from '../ModalComponents/DeleteFieldConfirmModal'

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
            showUpdateFieldModal: false,
            showAddFieldModal: false,
            showConfDeleteFieldModal: false,
            showConfDeleteTableModal: false,

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
        fetch('https://ugomes.com/mm-api/get_table_data?orgId='+getSessionCookie(ORG_TOKEN)+'&tableId='+params.tableId,{
            method: 'GET',
            headers: {"x-access-token": getSessionCookie(USER_TOKEN)}
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
                }
                
                let tableFields = res.tableData.fields
                this.setState({
                    tableFields: [tableFields],
                    tableName: res.tableData.name
                })
            })
            .catch(err => {
                if(err.status === "deauth")
                    deleteSessionCookies()
                else
                    throw err
            })
    }

    componentDidMount(){
        this.requestRowData()
    }
    
    toggleModal = (type) => {
        switch(type){
            case 'update':
                const {showUpdateFieldModal} = this.state
                if(showUpdateFieldModal)
                    this.requestRowData()

                this.setState({showUpdateFieldModal: !showUpdateFieldModal})
                break
            case 'add':
                const {showAddFieldModal} = this.state
                if(showAddFieldModal)
                    this.requestRowData()

                this.setState({showAddFieldModal: !showAddFieldModal})
                break
            case 'conf_delete_field':
                const {showConfDeleteFieldModal} = this.state
                if(showConfDeleteFieldModal)
                    this.requestRowData()

                this.setState({showConfDeleteFieldModal: !showConfDeleteFieldModal})
                break
            case 'conf_delete_table':
                const {showConfDeleteTableModal} = this.state
                if(showConfDeleteTableModal)
                    this.requestRowData()

                this.setState({showConfDeleteTableModal: !showConfDeleteTableModal})
                break
            default:
        }
    }
    
    handleEditField = (sectionIndex, i) => {
        this.setState({
            sectionIndex: sectionIndex,
            index: i
        })
    }

    render(){
        return (
            (this.state.tableFields !== null && this.state.tableFields !== undefined && this.state.tableFields.length > 0) &&
            <div>
                <ModalBox dataFields={
                    <UpdateFieldModalData tableFields={this.state.tableFields} toggleModal={() => {this.toggleModal('update')}}
                            sectionIndex={this.state.sectionIndex} index={this.state.index} />}
                    isShown={this.state.showUpdateFieldModal}  toggleModal={() => {this.toggleModal('update')}}/>
                <ModalBox dataFields={ <AddFieldModalData toggleModal={this.toggleModal}/> } 
                    isShown={this.state.showAddFieldModal} toggleModal={() => {this.toggleModal('add')}}/>
                <ModalBox dataFields={
                        <DeleteFieldConfirmModal fieldToDeleteIndex={this.state.fieldToDeleteIndex} toggleModal={() => {this.toggleModal('conf_delete_field')}}/>
                    }
                    isShown={this.state.showConfDeleteFieldModal}  toggleModal={() => {this.toggleModal('conf_delete_field')}}/>
                <ModalBox dataFields={
                    <DeleteTableModalData tableName={this.state.tableName} toggleModal={() => {this.toggleModal('conf_delete_table')}}/>} 
                isShown={this.state.showConfDeleteTableModal} toggleModal={() => {this.toggleModal('conf_delete_table')}}/>

                <div id="content-viewrow" style={{display: "flex"}}>

                    <div id="field-data-containers">
                        <div id="header">
                            <h1>{this.state.tableName}</h1>
                            <button className="btn" onClick={() => {this.toggleModal('add')}} style={{fontSize: "20px"}}><IoIosAdd /></button>
                            <button className="remove-btn" onClick={() => {
                                this.toggleModal('conf_delete_table')}}><MdDelete /></button>
                        </div>
                        <div style={{display: "flex"}}>
                            {(this.state.tableFields !== null && this.state.tableFields.length > 0) &&
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
                                            {(field.type === 'select') &&
                                                <div className="content">
                                                    <div>
                                                        <label><b>Select field values</b></label>
                                                        <ul>
                                                            {field.select_data.map((value, i) => <li key={i}>{value}</li>)}
                                                        </ul>
                                                    </div>
                                                </div> }
                                        </li>
                                    )}
                                </ul>)}
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
