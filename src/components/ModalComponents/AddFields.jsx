import React from 'react'
import { MdAdd } from "react-icons/md";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import Checkbox from 'react-checkbox-component'
import TableModel from '../../models/tableModel'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies} from '../../helpers/session/auth.js'
import ProcessingComponent from '../ProcessingComponent';
import { deleteState } from '../../localStorage';

class AddFields extends React.Component{
    constructor(){
        super()
        this.state = {
            tableName: "",
            fieldName: "",
            fieldType: "text",
            newFieldsData : [],
            selectValues: [],
            selectFieldValue: "",
            cbChecked: true,
            processingRequest: false,
            dataSubmited: false
        }
    }

    appendNewField = () => {
        if(this.state.fieldName !== ''){
            let newField = {
                fieldName: this.state.fieldName,
                fieldType: this.state.fieldType,
                displayInTable: this.state.cbChecked,
                selectValues: this.state.selectValues
            }

            this.setState((prevState) => ({
                newFieldsData: [newField, ...prevState.newFieldsData],
                fieldName: "",
                fieldType: "text",
                cbChecked: true,
                selectValues: []
            }))
        }
    }

    removeItem = (pos) => {
        let {newFieldsData} = this.state
        newFieldsData.splice(pos, 1)
        
        this.setState({
            newFieldsData: newFieldsData
        })
    }

    appendSelectValue = () => {
        if(this.state.selectFieldValue !== ''){
            this.setState((prevState) => ({
                selectValues: [...prevState.selectValues, prevState.selectFieldValue],
                selectFieldValue: "",
            }))
        }
    }

    removeSelectValue = (i) => {
        let {selectValues} = this.state

        selectValues.splice(i, 1)
        this.setState({
            selectValues: selectValues
        })
    }

    handleOnEnterPressed = (e) => {
        if(e.key === 'Enter' && this.state.fieldName !== '' && !(this.state.fieldType === 'select' && this.state.selectValues.length === 0))
            this.appendNewField(this.state.item)
    }

    handleFieldNameInputChange = (e) => {
        this.setState({
            fieldName: e.target.value
        })
    }

    handleRadioButtonsChange = (e) => {
        this.setState({
            fieldType: e.target.value
        })
    }

    handleSelectValueKeyDown = (e) => {
        console.log("appending")

        if(e.key === 'Enter' && this.state.selectFieldValue !== '')
            this.appendSelectValue()
    }

    handleSelectFieldValueInputChange = (e) => {
        this.setState({
            selectFieldValue: e.target.value
        })
    }

    handleTableNameInputChange = (e) => {
        this.setState({
            tableName: e.target.value
        })
    }

    handleTableDispCheckbox = () => {
        this.setState((prevState) => ({
            cbChecked: !prevState.cbChecked
        }))
    }

    submitNewTable = async () => {
        const tableModel = new TableModel()
        tableModel.setName(this.state.tableName)
        tableModel.setFields(this.state.newFieldsData.reverse())

        if(this.state.dataSubmited === false){
            this.setState({processingRequest: true, dataSubmited: true})
            fetch('https://ugomes.com:8080/orgs/create_table', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': getSessionCookie(USER_TOKEN),
                    },
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tableData: JSON.stringify(tableModel),
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
                }).then(e => {
                    window.location.reload(false)
                }).catch(err => {
                    if(err.status === "deauth"){
                        deleteSessionCookies()
                        deleteState()
                        window.location.reload(false)
                    }else
                        throw err
                })
        }
    }

    render(){
        return (
            <div>
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Create new table</h1>
                <div>
                    <input type="text" className="txt-field" onChange={this.handleTableNameInputChange} value={this.state.tableName} placeholder="Table name"/>
                    <div id="add-fields-container">
                    <ul id="fields-list">
                        {this.state.newFieldsData.map((field, i) => 
                            <li key={field.fieldName}>
                                <label>{field.fieldName}</label> <label>{(field.fieldType === 'tel') ? "phone": field.fieldType} {(field.fieldType === 'select') ? '['+field.selectValues.join(', ')+']' : ""} &nbsp; {(field.displayInTable) ? "Display in table" : ""}</label>
                                <button className="remove-btn" onClick={() => {
                                    this.removeItem(i)
                                }}><IoIosRemoveCircleOutline /></button>
                            </li>
                        )}
                    </ul>
                    <div id="inputs-container" >
                        <div id="r1">
                            <button className="btn" onClick={this.appendNewField}
                                disabled={(this.state.fieldName === '' || (this.state.fieldType === 'select' && this.state.selectValues.length === 0))}><MdAdd /></button>
                            <input type="text" className="txt-field"
                                onChange={this.handleFieldNameInputChange} onKeyDown={this.handleOnEnterPressed}
                                value={this.state.fieldName} placeholder="Field name"/>
                        </div>
                        <div id="properties">
                            <div id="field-type-radio-group">
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'text')} value="text" id="text" name="field-type"/>
                                <label htmlFor="text">Text</label>
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'date')} value="date" id="date" name="field-type"/>
                                <label htmlFor="date">Date</label>
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'time')} value="time" id="time" name="field-type"/>
                                <label htmlFor="time">Time</label>
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'number')} value="number" id="number" name="field-type"/>
                                <label htmlFor="number">Number</label>
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'select')} value="select" id="select" name="field-type"/>
                                <label htmlFor="select">Select</label>
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'checkbox')} value="checkbox" id="checkbox" name="field-type"/>
                                <label htmlFor="checkbox">Checkbox</label>
                                <input type="radio" onChange={this.handleRadioButtonsChange} onKeyDown={this.handleOnEnterPressed}
                                    checked={(this.state.fieldType === 'tel')} value="tel" id="tel" name="field-type"/>
                                <label htmlFor="tel">Phone</label>
                            </div>
                            <div id="table-display">
                                <Checkbox size="small" onChange={this.handleTableDispCheckbox} color="#11152f" isChecked={this.state.cbChecked}/>
                                <label>Display in dashboard table</label>
                            </div>
                        </div>

                        {
                            (this.state.fieldType === 'select') ? 
                                <div id="select-values">
                                    <div id="select-values-container">
                                        {this.state.selectValues.map((value, i) => 
                                            <div className="chip">{value}
                                                <button className="remove-btn" onClick={() => {
                                                    this.removeSelectValue(i)
                                                }}><IoIosRemoveCircleOutline /></button></div>
                                        )}
                                    </div>
                                    <div id="select-values-inputs">
                                        <input type="text" className="txt-field" placeholder="Select value" value={this.state.selectFieldValue}
                                            onKeyDown={this.handleSelectValueKeyDown} onChange={this.handleSelectFieldValueInputChange}/>
                                        <button className="btn" onClick={this.appendSelectValue}>Add value</button>
                                    </div>
                                    
                                </div>
                            : ""
                        }
                    </div>
                    </div>
                    <input type="button" onClick={this.submitNewTable} className="btn" disabled={(this.state.tableName === '' || this.state.newFieldsData.length === 0 || this.state.dataSubmited === true)} value="Add new item"/>
                </div>
            </div>
        )
    }
}

export default AddFields