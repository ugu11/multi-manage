import React from 'react'
import { MdAdd } from "react-icons/md";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import Checkbox from 'react-checkbox-component'
import TableModel from '../../models/tableModel'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies} from '../../helpers/session/auth.js'

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
            cbChecked: true
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

        fetch('https://us-central1-multi-manage.cloudfunctions.net/createTable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orgId: getSessionCookie(ORG_TOKEN),
                tokenId: getSessionCookie(USER_TOKEN),
                tableData: tableModel,
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
        }).catch(err => {
            if(err.status === "deauth")
                deleteSessionCookies()
            else
                throw err
        })
    }

    render(){
        return (
          <div>
          <h1>Add new item</h1>
          <div>
            <input type="text" className="txt-field" onChange={this.handleTableNameInputChange} value={this.state.tableName} placeholder="Table name"/>
            <div id="add-fields-container">
              <ul id="fields-list">
                  {this.state.newFieldsData.map((field, i) => 
                    <li key={field.fieldName}>
                        <label>{field.fieldName}</label> <label>{field.fieldType} {(field.fieldType === 'select') ? '['+field.selectValues.join(', ')+']' : ""} &nbsp; {(field.displayInTable) ? "Display in table" : ""}</label>
                        <button className="remove-btn" onClick={() => {
                            this.removeItem(i)
                        }}><IoIosRemoveCircleOutline /></button>
                    </li>
                  )}
              </ul>
              <div id="inputs-container" >
                <button className="btn" onClick={this.appendNewField}
                    disabled={(this.state.fieldName === '' || (this.state.fieldType === 'select' && this.state.selectValues.length === 0))}><MdAdd /></button>
                <input type="text" className="txt-field"
                    onChange={this.handleFieldNameInputChange} onKeyDown={this.handleOnEnterPressed}
                    value={this.state.fieldName} placeholder="Field name"/>
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
            <input type="button" onClick={this.submitNewTable} className="btn" disabled={(this.state.tableName === '' || this.state.newFieldsData.length === 0)} value="Add new item"/>
          </div>
        </div>
        )
    }
}

export default AddFields