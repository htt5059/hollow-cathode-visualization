import React from "react";
import Painter from "./Painter";
import ReactDOM from "react-dom";
import {base, hallThrusterOff} from "./Galactic";
import PresMode from "./PresMode";
import LearningMode from "./LearningMode";
import {Link, Route, Routes} from "react-router-dom";
import HeaderComponent from "./Header.component.";
import SummaryPage from "./SummaryPage";
import RefComponent from "./Ref.component";
import FooterComponent from "./Footer.component";

/**
 * Site landing page element
 * Should be rendered inside a <div id={"canvasHolder"}>
 */
export class LandingPage extends React.Component {
    constructor(props) {
        super();

        // create a reference to the canvas element
        this.canvas = React.createRef();
    }

    /**
     * componentDidMount()
     * Called when canvas element is mounted on page (canvas element is unusable up until this point)
     */
    componentDidMount() {
        // initialize instance variables for each canvas element/layer
        const ctx0 = this.canvas.current.getContext('2d'); // base = 0;

        this.layers = [ctx0];
        this.painter = new Painter(this.layers);

        this.showElement("landingPageTitleDiv")
        this.showElement("landingPageSubTitleDiv")
        this.showElement("landingPageLModePromptDiv")

        //this.LearningMode_HandleClick = this.LearningMode_HandleClick.bind(this);
        //this.PresMode_HandleClick = this.PresMode_HandleClick.bind(this);
    }

    /**
     * getLayer(layer)
     * @param layer layer number which you want to get
     * @returns ctx 2d canvas context for that layer
     */
    getLayer(layer){
        return this.layers[layer];
    }

    /**
     * LearningMode_HandleClick()
     * Onclick handler for the learning mode button on the landing page
     */
    // LearningMode_HandleClick() {
    //
    //     // render learning mode
    //     ReactDOM.render(
    //         <div id={"canvasHolder"}>
    //             <LearningMode id={"LearningMode"} deltastage={hallThrusterOff} scene={[false,false,false,false,false,false,true,false]}/>
    //         </div>,
    //         document.getElementById('root')
    //     );
    // }

    /**
     * PresMode_HandleClick()
     * Onclick handler for the learning mode button on the landing page
     */
    // PresMode_HandleClick() {
    //
    //     // render learning mode
    //     ReactDOM.render(
    //         <div id={"canvasHolder"}>
    //             <PresMode id={"presMode"} deltastage={base} scene={[true,false,false,false,false,false,false,false]}/>
    //         </div>,
    //         document.getElementById('root')
    //     );
    // }

    /**
     * Hides the element with the given id
     * @param elementId id of element to hide
     */
    hideElement(elementId){
        //document.getElementById(elementId).style.visibility = 'hidden';
        document.getElementById(elementId).style.display = 'none';
    }
    /**
     * Un-hides the element with the given id
     * @param elementId id of element to show
     */
    showElement(elementId){
        // document.getElementById(elementId).style.visibility = 'visible';
        document.getElementById(elementId).style.display = 'flex';
    }

    render() {
        return (
            <div id={'canvasHolder'}>
                <div>
                    <canvas id={"canvas"}
                            onClick={this.LearningMode_HandleClick}
                            ref={this.canvas}
                            className={"unselectable"}
                            hidden={true}> You need a better browser :(
                    </canvas>

                    <Link to={'/learning'}>
                        <img id={'spaceshipImage'} src={"/images/spacecraft2.png"} className={"grow"} alt={"Psyche 16 spacecraft"}/>
                    </Link>

                    <div className={"stackedButtonGroup bottomrightAlign"}>
                        <Link to={'/learning'}>
                            <button id={"LearnModeButton"} className={"button"}>
                                Learning Mode
                            </button>
                        </Link>
                        <Link to={'/presentation'}>
                            <button id={"PresModeButton"} className={"button"}>
                                Presentation Mode
                            </button>
                        </Link>
                    </div>

                    <div id={"landingPageTitleDiv"} className={"stackedButtonGroup landingPageTitleAlign"} >
                        <label id={"landingPageTitle"} className={"landingPageTitleLabel"}> Hollow Cathode </label>
                    </div>

                    <div id={"landingPageSubTitleDiv"} className={"stackedButtonGroup landingPageSubTitleAlign"} >
                        <label id={"landingPageSubTitle"} className={"landingPageSubTitleLabel"}> Visualization </label>
                    </div>

                    <div id={"landingPageLModePromptDiv"} className={"stackedButtonGroup landingPageLModePromptAlign"} >
                        <label id={"landingPageLModePrompt"} className={"landingPageLModePromptLabel"}> click the spacecraft to begin </label>
                    </div>
                </div>
            </div>
        )
    }
}

export default LandingPage;