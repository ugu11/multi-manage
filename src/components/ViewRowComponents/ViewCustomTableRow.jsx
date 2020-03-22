import React from 'react'
import {Navbar} from '../Navbar'
import '../../css/ViewRow.scss'
import { MdEdit } from "react-icons/md";
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'

import UpdateCustomTableRowModal from '../ModalComponents/UpdateCustomTableRowModal'

import {connect} from 'react-redux'
import {updateUserData} from '../../actions/updateUserData.js'

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

class ViewCustomTableRowComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            showModal: false,
            modalContent: null,
            fieldData: [],
            fields: [],
            tableName: "",
            modalFieldData: null,
            tableData: null,
            dataSubmited: false
        }
    }

    componentDidMount(){
        const params = getUrlParams(window.location.href)
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getOrgTableRowData?orgId='+getSessionCookie(ORG_TOKEN)+'&tableId='+params.tableId+'&rowIndex='+params.rowIndex+'&tokenId='+getSessionCookie(USER_TOKEN))
            .then(res => res.json())
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                }
                return res
            })
            .then(res => {
                let fieldData = []

                for(let field in res.data){
                    if(field !== 'tableName')
                        fieldData.push({
                            fieldName: field,
                            fieldValue: res.data[field]
                        })
                }

                this.setState({
                    tableName: res.data.tableName,
                    fieldData: fieldData,
                    modalFieldData: fieldData,
                    fields: res.fieldsData
                })

                if(this.state.fieldData.length > 10){
                    let {fieldData} = this.state
                    let splitFieldData = []
                    splitFieldData[1] = fieldData.splice(10)
                    splitFieldData[0] = fieldData
                    this.setState({
                        fieldData: splitFieldData
                    })
                    // console.log(this.state.fieldData)
                }else{
                    const {fieldData} = this.state
                    
                    this.setState({
                        fieldData: [fieldData]
                    })
                }
            })
            .catch(err => {
                if(err.status === "deauth")
                    deleteSessionCookies()
                else
                    throw err
            })

    }

    toggleModal = () => {
        const { showModal } = this.state
        this.setState({
            showModal: !showModal
        })
    }

    updateFieldValue = (e) => {
        let {fieldData} = this.state
        const i = parseInt(e.target.name)

        if(i >= 10)
            fieldData[1][i-10].fieldValue = e.target.value
        else
            fieldData[0][i].fieldValue = e.target.value

        this.setState({
            fieldData:  fieldData
        })

        this.updateModalContent()
    }

    render(){
        return (
            <div>
                {
                    (this.state.modalFieldData !== null && this.state.modalFieldData !== undefined) ?
                        <ModalBox dataFields={<UpdateCustomTableRowModal modalFieldData={this.state.modalFieldData} fields={this.state.fields} />} isShown={this.state.showModal} toggleModal={this.toggleModal}/>
                    : ""
                }
                <Navbar />

                <div id="content-viewrow" style={{display: "flex"}}>

                    <div id="field-data-containers">
                        <div id="header">
                            <h1>{this.state.tableName}</h1>
                            <button className="btn" onClick={this.toggleModal}><MdEdit /></button>
                        </div>
                        <div style={{display: "flex"}}>
                            {this.state.fieldData.map((section, sectionIndex) => 
                                <div className="field-display-container" key={sectionIndex}>
                                    <ul>
                                        {Array.from(section).map(field => 
                                            <li key={field.fieldName}><b>{field.fieldName}</b>: {field.fieldValue}</li>
                                        )}
                                        {/* {JSON.stringify(section)} */}
                                    </ul>
                                </div>
                            )}
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

export const ViewCustomTableRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewCustomTableRowComponent)
