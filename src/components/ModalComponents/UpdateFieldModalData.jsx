import React from 'react';
import {IoIosRemoveCircleOutline} from 'react-icons/io'
import Checkbox from 'react-checkbox-component'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import { deleteState } from '../../localStorage';
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
class UpdateFieldModalData extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            // tableFields: null,
            selectFieldValue: "",
            dataSubmited: false,
            tableFields: null,
            processingRequest: false
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.tableFields === null & prevState.tableFields !== this.props.tableFields)
            this.setState({tableFields: this.props.tableFields})
    }
    
    addSelectValue = () => {
        console.log("add")
        let {tableFields, selectFieldValue} = this.state
        if(selectFieldValue !== ''){
            if(tableFields[this.props.sectionIndex][this.props.index].type === 'select'){
                tableFields[this.props.sectionIndex][this.props.index].select_data.push(selectFieldValue)
                this.setState({
                    tableFields: tableFields,
                    selectFieldValue: ""
                })
            }
        }
    }

    removeSelectDataValue = (removeIndex) => {
        let {tableFields} = this.state
        tableFields[this.props.sectionIndex][this.props.index].select_data.splice(removeIndex, 1)

        this.setState({
            tableFields: tableFields
        })
    }

    handleCheckbox = () => {
        let {tableFields} = this.state
        tableFields[this.props.sectionIndex][this.props.index].display_table = !tableFields[this.props.sectionIndex][this.props.index].display_table

        this.setState({
            tableFields: tableFields
        })
    }
 
    submitUpdate = () => {
        let tableFields = (this.state.tableFields.length === 2) ? [...this.state.tableFields[0], ...this.state.tableFields[1]] : this.state.tableFields[0]

        if(this.state.dataSubmited === false){
            this.setState({dataSubmited: true, processingRequest: true})
            fetch('https://ugomes.com/mm-api/update_table_fields', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                        'x-access-token':  getSessionCookie(USER_TOKEN)},
                    body: JSON.stringify({
                        orgId: getSessionCookie(ORG_TOKEN),
                        tableId: getUrlParams(window.location.href).tableId,
                        fieldsData: JSON.stringify(tableFields)
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
                        deleteState()
                    }
                    this.props.toggleModal()
                })
                .catch(err => {
                    throw err
                })
        }
    }

    handleRadioButtonsChange = (e, sectionIndex, index) => {
        let {tableFields} = this.state
        tableFields[sectionIndex][index].type = e.target.value
        if(tableFields[sectionIndex][index].type === 'select')
            tableFields[sectionIndex][index].select_data = []

        this.setState({
            tableFields: tableFields
        })
    }

    handleSelectFieldValueInputChange = (e) => this.setState({selectFieldValue: e.target.value})
    
    handleSelectValueKeyDown = (e) => {
        if(e.key === 'Enter' && this.state.selectFieldValue !== '')
            this.addSelectValue(e)
    }
    
    render(){
        return (
            <div>
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Update field</h1>
                <form onSubmit={async (e) =>  {
                    e.preventDefault()
                }}>
                    {(this.state.tableFields !== null) ? 
                        <div>
                            <h3>Field type</h3>
                            <div id="field-type-radio-group">
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'text')} value="text" id="text" name="field-type"/>
                                <label htmlFor="text">Text</label>
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'date')} value="date" id="date" name="field-type"/>
                                <label htmlFor="date">Date</label>
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'time')} value="time" id="time" name="field-type"/>
                                <label htmlFor="time">Time</label>
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'number')} value="number" id="number" name="field-type"/>
                                <label htmlFor="number">Number</label>
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'select')} value="select" id="select" name="field-type"/>
                                <label htmlFor="select">Select</label>
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'checkbox')} value="checkbox" id="checkbox" name="field-type"/>
                                <label htmlFor="checkbox">Checkbox</label>
                                <input type="radio" onChange={(e) => (this.handleRadioButtonsChange(e, this.props.sectionIndex, this.props.index))}
                                    checked={(this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'tel')} value="tel" id="tel" name="field-type"/>
                                <label htmlFor="tel">Phone</label>
                            </div>
    
                            {
                                (this.state.tableFields[this.props.sectionIndex][this.props.index].type === 'select') ? 
                                    <div>
                                        <h3>Select Field Values</h3>
                                            <div id="select-values">
                                                <div id="select-values-container">
                                                    {this.state.tableFields[this.props.sectionIndex][this.props.index].select_data.map((value, i) => 
                                                        <div className="chip">{value}
                                                            <button className="remove-btn" onClick={() => {
                                                                this.removeSelectDataValue(i)
                                                            }}><IoIosRemoveCircleOutline /></button></div>
                                                    )}
                                                </div>
                                                <div id="select-values-inputs">
                                                    <input type="text" className="txt-field" placeholder="Select value" value={this.state.selectFieldValue}
                                                        /* onKeyDown={this.handleSelectValueKeyDown} */ onChange={this.handleSelectFieldValueInputChange}/>
                                                    <button className="btn" onClick={this.addSelectValue}>Add value</button>
                                                </div>
                                            </div>
                                    </div>
                                : ""
                            }
    
                            <div className="table-display">
                                <Checkbox size="small" onChange={this.handleCheckbox} color="#11152f" isChecked={this.state.tableFields[this.props.sectionIndex][this.props.index].display_table}/>
                                <label>Display in dashboard table</label>
                            </div>
                        </div>
                    : ""}
    
                        
                    <input type="submit" className="btn" disabled={this.state.dataSubmited} onClick={this.submitUpdate} value="Submit changes"/>
                </form>
            </div>
        )
    }

}

export default UpdateFieldModalData

// 0100 0111

