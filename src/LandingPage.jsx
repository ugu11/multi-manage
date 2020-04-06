import React from 'react'
import './css/LandingPage.scss'

class LandingPage extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            width: 0
        }
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    };

    calcBGImageYOffset = () => {
        const {width} = this.state
        const xConst = 550
        const widthDif = width - xConst
        if(widthDif > 0 && width < 900)
            return (400*widthDif)/350 * (-1)
        else
            return 0

    }

    render(){
        return <div className="landing-page">
            <div id="img" style={{backgroundPositionY: this.calcBGImageYOffset()+"px"}}></div>
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