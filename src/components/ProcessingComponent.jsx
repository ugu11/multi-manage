import React from 'react'
import '../css/ProcessingComponent.scss'

const ProcessingComponent = (props) => { 
    if(props.display === true){
        return (
            <div id="loader-bg" style={{borderRadius: props.radius+"px"}}>
                <div id="loader-container">
                    <img src={require('../assets/imgs/loading.svg')} alt="loading-anim" width="100" height="100"/>
                </div>
            </div> )
    }else{
        return ""
    }
}

export default ProcessingComponent