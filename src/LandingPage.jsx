import React from 'react'
import './css/LandingPage.scss'

class LandingPage extends React.Component{
    constructor(props){
        super(props)


    }

    render(){
        return <div className="landing-page">
            <div className="auth-btns">
                <button className="register" onClick={() => window.location = "/register"}>Sign up</button>
                <button className="login" onClick={() => window.location = "/login"}>Sign in</button>
            </div>
            <div className="landing-header">
                <h1>Multi<br/>Manage</h1>
                <h4>Customizable Management<br/>Web Platform</h4>
            </div>
        </div>
    }
}

export default LandingPage