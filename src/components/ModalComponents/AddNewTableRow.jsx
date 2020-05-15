import React from 'react'
import AddFieldModalData from './AddFieldModalData'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import ProcessingComponent from '../ProcessingComponent'
import { deleteState } from '../../localStorage'
import {validatePhoneField} from '../../helpers/inputValidation.js'

class AddNewTableRow extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            dataSubmited: false,
            tableData: null,
            tableName: "",
            fieldController: null,
            processingData: false
        }
    }

    componentDidUpdate(pP, prevState){
        if(prevState.tableData === null && this.props.tableData !== prevState.tableData)
            this.setState({tableData: this.props.tableData})
        if(prevState.fieldController === null && this.props.fieldController !== prevState.fieldController)
            this.setState({fieldController: this.props.fieldController})
    }

    handleInputChange = (e, type) => {
        let {fieldController} = this.state

        switch(type){
            case 'tel':
                const isValid = validatePhoneField(e.target.value)
                if(isValid === true)
                    fieldController[e.target.name] = e.target.value
                break

            case 'email':
                if(e.target.value.includes(" ") === false)
                    fieldController[e.target.name] = e.target.value
                break
            default:
                fieldController[e.target.name] = e.target.value

                
        }

        this.setState({
            fieldController: fieldController
        })
    }

    render(){
        return (
            <div>
                <ProcessingComponent  radius="0" display={this.state.processingData} />
                <h1>Add new item</h1>
                <form onSubmit={async (e) =>  {
                    e.preventDefault()
                    this.setState({dataSubmited: true, processingData: true})
                    if(this.state.dataSubmited === false)
                        fetch('https://ugomes.com:8080/orgs/add_table_row', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'x-access-token': getSessionCookie(USER_TOKEN)
                             },
                            body: JSON.stringify({
                                orgId: getSessionCookie(ORG_TOKEN),
                                tableId: this.state.tableData._id,
                                tableData: JSON.stringify(this.state.fieldController)
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
                                deleteState()
                            }
                            window.location.reload(false)
                            return res
                        }).catch(err => {
                            if(err.status === "deauth")
                                deleteSessionCookies()
                            else
                                throw err
                        })
                }}>
                    {
                        (this.state.tableData !== null) ?
                            this.state.tableData.fields.map(field => 
                                (field.type === 'select') ?
                                    <select key={field.name} className="txt-field" onChange={this.handleInputChange} name={field.name}>
                                        {field.select_data.map((selectValue, i) => 
                                            <option key={selectValue+"-"+i} value={selectValue}>{selectValue}</option>)}
                                    </select>
                                :
                                    <input key={field.name} type={field.type} value={this.state.fieldController[field.name]} onChange={e => this.handleInputChange(e, field.type)} name={field.name} className="txt-field" placeholder={field.name}/>
        
                            )
                        : ""
                    }
                    <input type="submit" className="btn" disabled={this.state.dataSubmited} value="Add new item"/>
                </form>
            </div>
        )
    }
}

export default AddNewTableRow