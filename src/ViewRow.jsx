import React from 'react'
import {Navbar} from './components/Navbar'
import './css/ViewRow.scss'
import { MdEdit } from "react-icons/md";
import ModalBox from './components/ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from './helpers/session/auth'

import {connect} from 'react-redux'
import {updateUserData} from './actions/updateUserData.js'

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

class ViewRowComponent extends React.Component{
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
                console.log(res)
                let fieldData = []

                for(let field in res.data){
                    if(field !== 'tableName')
                        fieldData.push({
                            fieldName: field,
                            fieldValue: res.data[field]
                        })
                }

                console.log(fieldData)

                this.setState({
                    tableName: res.data.tableName,
                    fieldData: fieldData,
                    modalFieldData: fieldData,
                    fields: res.fieldsData
                })

                console.log("=> ", this.state.fieldValue)


                if(this.state.fieldData.length > 10){
                    let {fieldData} = this.state
                    let splitFieldData = []
                    splitFieldData[1] = fieldData.splice(10)
                    splitFieldData[0] = fieldData
                    console.log("split", splitFieldData)
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
                            console.log(this.state.modalFieldData)
                            this.setState({dataSubmited: true})
                            const response = await fetch('https://us-central1-multi-manage.cloudfunctions.net/updateTableRow', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orgId: getSessionCookie(ORG_TOKEN),
                                    tableId: getUrlParams(window.location.href).tableId,
                                    rowData: JSON.stringify(this.state.modalFieldData),
                                    tokenId: getSessionCookie(USER_TOKEN),
                                    rowIndex: parseInt(getUrlParams(window.location.href).rowIndex)
                                }),
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
                                console.log(fieldData)
                                console.log(this.state.modalFieldData)

                                return (fieldData.type === 'select') ?
                                    <select className="txt-field" onChange={this.updateFieldValue} name={i}>
                                        {fieldData.select_data.map(selectValue => 
                                            <option value={selectValue} selected={selectValue === field.fieldValue}>{selectValue}</option>)}
                                    </select>
                                :
                                    <input type={fieldData.type} className="txt-field"
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
        console.log(this.state)
    }

    updateFieldValue = (e) => {
        let {fieldData} = this.state
        const i = parseInt(e.target.name)

        if(i >= 10)
            fieldData[1][i-10].fieldValue = e.target.value
        else
            fieldData[0][i].fieldValue = e.target.value
        console.log(fieldData)

        this.setState({
            fieldData:  fieldData
        })

        this.updateModalContent()
    }

    render(){
        console.log(this.state.fieldData)
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
                            {this.state.fieldData.map(section => 
                                <div className="field-display-container">
                                    <ul>
                                        {Array.from(section).map(field => 
                                            <li><b>{field.fieldName}</b>: {field.fieldValue}</li>
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

export const ViewRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewRowComponent)
