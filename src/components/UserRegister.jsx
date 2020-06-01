import React from 'react'
import '../css/AuthPage.scss'

class UserRegister extends React.Component{
    constructor(){
        super()
    }
    
    validateFields = (formData) => {
        const {nameIdUnique} = this.state
        this.checkForNameIdUniqueness(formData.org_id)
        if(password === confPassword && password !== '' && nameIdUnique === true)
            this.setState({ isSubmitDisabled: false })
        else
            this.setState({ isSubmitDisabled: true })
    }

    render(){
        return(
            <div className='auth-bg'>
                <div class="auth-container">
                    <h1>Create admin user</h1>
                    <form onSubmit={e => {e.preventDefault();}}>
                        <input type="text" className="txt-field" name="userFullName" placeholder="Full Name" onChange={this.props.formHandler}/>
                        <input type="text" className="txt-field" name="username" placeholder="Username" onChange={this.props.formHandler}/>
                        <input type="email" className="txt-field" name="userEmail" placeholder="Email" onChange={this.props.formHandler}/>
                        <input type="tel" className="txt-field" name="userPhone" placeholder="Username" onChange={this.props.formHandler}/>
                        <input type="password" className="txt-field" name="userPassword" placeholder="Password" onChange={this.props.formHandler}/>
                        <input type="password" className="txt-field" name="userConfPassword" placeholder="Confirm Password" onChange={this.props.formHandler}/>

                        <input type="submit" className="btn auth-submit"  disabled={this.state.isSubmitDisabled} value="Create user"/>
                    </form>
                </div>
            </div>
        )
    }
}

export default UserRegister