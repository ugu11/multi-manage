import React from 'react'
import {Navbar} from '../Navbar'
import '../../css/ViewRow.scss'
import { MdEdit } from "react-icons/md";
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'

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

                this.updateModalContent()
            })
            .catch(err => {
                if(err.status === "deauth")
                    deleteSessionCookies()
                else
                    throw err
            })

    }
    
    updateModalContent = () => {
        this.setState((state) => ({
            modalContent: 
                (
                    <div>
                        <h1>Add new item</h1>
                        <form onSubmit={async (e) =>  {
                            e.preventDefault()
                            this.setState({dataSubmited: true})
                            fetch('https://us-central1-multi-manage.cloudfunctions.net/updateTableRow', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orgId: getSessionCookie(ORG_TOKEN),
                                    tableId: getUrlParams(window.location.href).tableId,
                                    rowData: JSON.stringify(this.state.modalFieldData),
                                    tokenId: getSessionCookie(USER_TOKEN),
                                    rowIndex: parseInt(getUrlParams(window.location.href).rowIndex)
                                }),
                            })
                            .then(res => {
                                if(res.json().status === "deauth"){
                                    deleteSessionCookies()
                                    window.location.reload(false)
                                }
                                return res
                            }).then(e => {
                                window.location.reload(false)
                            })
                            .catch(err => {
                                if(err.status === "deauth")
                                    deleteSessionCookies()
                                else
                                    throw err
                            })
                        }}>
                            {state.modalFieldData.map((field, i) => {
                                let fieldData = this.state.fields.filter(f => f.name === field.fieldName)[0]

                                return (fieldData.type === 'select') ?
                                    <select key={fieldData.name} className="txt-field" onChange={this.updateFieldValue} name={i} defaultValue={field.fieldValue}>
                                        {fieldData.select_data.map((selectValue, selectIndex) => 
                                            <option key={selectValue+"-"+selectIndex} value={selectValue} >{selectValue}</option>)}
                                    </select>
                                :
                                    <input key={fieldData.name} type={fieldData.type} className="txt-field"
                                        name={i} placeholder={field.fieldName}
                                        value={field.fieldValue} onChange={this.updateFieldValue} />
                            }
                                
                            )}
                            <input type="submit" className="btn" disabled={this.state.dataSubmited} value="Submit changes"/>
                        </form>
                    </div>
                )
        }))
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
                <ModalBox dataFields={this.state.modalContent} isShown={this.state.showModal} toggleModal={this.toggleModal}/>
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
