import React from "react";
import Painter from "./Painter";
import {
    base,
    canvas_height,
    canvas_width,
    eject,
    gas,
    hallThrusterOff,
    hallThrusterOn,
    heat,
    keeper,
    plasma
} from "./Galactic";

import ReactDOM from "react-dom";
import LandingPage from "./LandingPage";

/**
 * Learning mode element
 * Should be rendered inside a <div id={"canvasHolder"}>
 * also with props: id={"LearningMode"} deltastage={base} scene={[true,false,false,false,false,false,false,false]}
 */
export class LearningMode extends React.Component {
    // Instance variables:
    // (all essentially cosmetic) (created in constructor)
    deltastage;
    scene;
    canvas;
    layers; // layers[base = 0, heat = 1, gas = 2, plasma = 3, keeper = 4, eject = 5, thruster off = 6, thruster on = 7]; //layers = [ctx0, ctx1, ctx2, ctx3, ctx4, ctx5, ctx6, ctx7];
    painter;
    thrusterButtonText; // if the thruster is on, this text says "off", and vice versa

    constructor(props){
        super();

        // initialize canvas instance variables

        //Hollow Cathode Canvases:
        this.canvas0 = React.createRef();                              //// 1 - create ref
        this.canvas1 = React.createRef();
        this.canvas2 = React.createRef();
        this.canvas3 = React.createRef();
        this.canvas4 = React.createRef();
        this.canvas5 = React.createRef();

        //Hall Thruster Canvases:
        this.canvas6 = React.createRef();   //Hall Thruster OFF
        this.canvas7 = React.createRef();   //Hall Thruster ON

        // bind handler function(s)
        this.HeatInsertToggle_HandleClick = this.HeatInsertToggle_HandleClick.bind(this);
        this.GasFeedToggle_HandleClick = this.GasFeedToggle_HandleClick.bind(this);
        this.KeeperElectrodeToggle_HandleClick = this.KeeperElectrodeToggle_HandleClick.bind(this);
        this.nextButton_plasma_HandleClick = this.nextButton_plasma_HandleClick.bind(this);
        this.nextButton_eject_HandleClick = this.nextButton_eject_HandleClick.bind(this);
        this.hallThrusterToggle_HandleClick = this.hallThrusterToggle_HandleClick.bind(this);
        this.nextButton_hallThruster_HandleClick = this.nextButton_hallThruster_HandleClick.bind(this);

        // initialize state
        this.state = { deltastage: props.deltastage, scene: props.scene };

        // Hall Thruster toggle button text
        if(this.state.scene[hallThrusterOn] === true)
        {
            this.thrusterButtonText = "Off";
        }
        else
        {
            this.thrusterButtonText = "On";
        }
    }

    /**
     * Hides the element with the given id
     * @param elementId id of element to hide
     */
    hideElement(elementId){
        document.getElementById(elementId).style.visibility = 'hidden';
    }
    /**
     * Un-hides the element with the given id
     * @param elementId id of element to show
     */
    showElement(elementId){
        document.getElementById(elementId).style.visibility = 'visible';
    }

    /**
     * componentDidMount()
     * Called when canvas element is mounted on page (canvas element is unusable up until this point)
     */
    componentDidMount() {
        // initialize instance variables for each canvas element/layer
        const ctx0 = this.canvas0.current.getContext('2d'); // base = 0;

        const ctx1 = this.canvas1.current.getContext('2d'); // heat = 1;
        const ctx2 = this.canvas2.current.getContext('2d'); // gas = 2;
        const ctx3 = this.canvas3.current.getContext('2d'); // plasma = 3;
        const ctx4 = this.canvas4.current.getContext('2d'); // keeper = 4;
        const ctx5 = this.canvas5.current.getContext('2d'); // eject = 5;
        const ctx6 = this.canvas6.current.getContext('2d'); // Hall Thruster OFF = 6;
        const ctx7 = this.canvas7.current.getContext('2d'); // Hall Thruster ON = 7;

        this.layers = [ctx0, ctx1, ctx2, ctx3, ctx4, ctx5, ctx6, ctx7];
        //      layers[base = 0, heat = 1, gas = 2, plasma = 3, keeper = 4, eject = 5, thruster off = 6, thruster on = 7];
        //
        this.painter = new Painter(this.layers);
        this.scenarioRefresh();
    }

    /**
     * scenarioRefresh()
     *
     * Populates the canvas based on the current state, is hopefully called whenever a change is made (ex: the onClick functions)
     * You can see the end of this function as the end of the current update/iteration.
     */
    scenarioRefresh() {
        // Execute logic based on deltastage and scene

        if(this.state.scene[hallThrusterOff] === true) {
            this.hideElement("toggleButtonGroup");
            this.painter.draw_Hall_Thruster_Off();

            this.showElement("hallThrusterOffLabelDiv");
            this.showElement("hallThrusterOffSublabelDiv");

            this.hideElement("hallThrusterOnLabelDiv");
            this.hideElement("hallThrusterOnSublabelDiv");
        }
        else
        {
            this.hideElement("hallThrusterButtonGroup");
            this.hideElement("hallThrusterOffLabelDiv");
            this.hideElement("hallThrusterOnLabelDiv");
            this.hideElement("hallThrusterOffSublabelDiv");
            this.hideElement("hallThrusterOnSublabelDiv");
            this.hideElement("hallThrusterNameLabelDiv");
            this.hideElement("hallThrusterNameSublabelDiv");
        }

        if (this.state.scene[hallThrusterOn] === true)
        {
            this.hideElement("toggleButtonGroup");
            this.painter.draw_Hall_Thruster_On();

            this.showElement("hallThrusterOnLabelDiv");
            this.showElement("hallThrusterOnSublabelDiv");

            this.hideElement("hallThrusterOffLabelDiv");
            this.hideElement("hallThrusterOffSublabelDiv");
        }

        // Hall Thruster toggle button text
        // programed backwards because of order of execution
        if(this.state.scene[hallThrusterOn] === true){
            this.thrusterButtonText = "On";
        } else {
            this.thrusterButtonText = "Off";
        }

        if(this.state.scene[hallThrusterOn] === true) {
            this.painter.draw_Hall_Thruster_On();
        } else if (this.state.deltastage === hallThrusterOn) {
            this.painter.clearCanvas(hallThrusterOn);
        }

        // if basedrawing is active
        if(this.state.scene[base] === true){
            this.painter.draw_csv_Base_Drawing()
            this.painter.clearCanvas(hallThrusterOn)
            this.painter.clearCanvas(hallThrusterOff)
            // if the user just toggled basedrawing
            if(this.state.deltastage === base || this.state.deltastage === hallThrusterOn || this.deltastage === hallThrusterOff){
                this.painter.draw_csv_Base_Drawing_guide();
            }
        }
        else if (this.state.deltastage === base){
            // the user deselected this option/layer
            this.painter.clearCanvas(this.state.deltastage);
        }

        // if heat insert is active
        if(this.state.scene[heat] === true){
            this.painter.draw_csv_Heat_Insert();

            // if the user just toggled heat insert
            if(this.state.deltastage === heat){
                this.painter.draw_csv_Heat_Insert_guide();
            }
        }
        else if (this.state.deltastage === heat){
            // the user deselected this option/layer
            this.painter.clearCanvas(this.state.deltastage);
        }

        // if gas feed is active
        if(this.state.scene[gas] === true){
            this.painter.draw_csv_gas_feed();

            // if the user just toggled the gas feed
            if(this.state.deltastage === gas){
                this.painter.draw_csv_gas_feed_guide();
            }
        }
        else if (this.state.deltastage === gas){
            // the user deselected this option/layer
            this.painter.clearCanvas(this.state.deltastage);
        }

        // if internal plasma is true
        if(this.state.scene[plasma] === true){
            this.painter.draw_csv_internal_plasma();

            // if the user just triggered the internal plasma
            if(this.state.deltastage === plasma){
                this.painter.draw_csv_internal_plasma_guide();
            }
        }
        else if (this.state.deltastage === plasma){
            // the user deselected this option/layer
            this.painter.clearCanvas(this.state.deltastage);
        }

        // SPECIAL CASE [trigger internal plasma] LOGIC
        if ((this.state.scene[heat] === true) && (this.state.scene[gas] === true)){
            if ((this.state.deltastage === heat) || (this.state.deltastage === gas)){
                ReactDOM.render(
                    <button id={"nextButton"}
                            className={"button"}
                            onClick={this.nextButton_plasma_HandleClick}> Next </button>,
                    document.getElementById('toggleButtonGroup')
                );
            }
        }

        // if keeper electrode is active
        if(this.state.scene[keeper] === true){
            this.painter.draw_csv_keeper_electrode();

            // if the user just toggled the keeper electrode
            if(this.state.deltastage === keeper){
                this.painter.draw_csv_keeper_electrode_guide();
            }
        }
        else if (this.state.deltastage === keeper){
            // the user deselected this option/layer
            this.painter.clearCanvas(this.state.deltastage);
        }

        // if eject plasma is true
        if(this.state.scene[eject] === true){
            this.painter.draw_csv_eject_plasma();

            // if the user just triggered eject plasma
            if(this.state.deltastage === eject){
                this.painter.draw_csv_eject_plasma_guide();
            }
        }
        else if (this.state.deltastage === eject){
            // the user deselected this option/layer
            this.painter.clearCanvas(this.state.deltastage);
        }

        // SPECIAL CASE [trigger eject plasma] LOGIC
        if ((this.state.scene[heat] === true) && (this.state.scene[gas] === true)){
            // Todo questionable logic, oddly enough, not checking for keeper here^ makes the model more accurate
            if (this.state.deltastage === keeper){
                // Todo not super solid logic^
                ReactDOM.render(
                    <button id={"nextButton"}
                            className={"button"}
                            onClick={this.nextButton_eject_HandleClick}> Next </button>,
                    document.getElementById('toggleButtonGroup')
                );
            }
        }

        //TODO this is a bad solution for checking the user has completed learning mode
        if(this.state.scene[base] === true
            && this.state.scene[heat] === true
            && this.state.scene[gas] === true
            && this.state.scene[plasma] === true
            && this.state.scene[keeper] === true
            && this.state.scene[eject] === true){
            this.hideElement("toggleButtonGroup");
        }

    }

    /**
     * HeatInsertToggle_HandleClick()
     * Onclick handler for the heat insert toggle button
     */
    HeatInsertToggle_HandleClick() {
        let newScene = this.state.scene;
        newScene[heat] = !newScene[heat];

        // change the current state, refresh scenario in callback to synchronously update the visuals after the state has changed
        this.setState((state, props) => {
            return { deltastage: heat, scene: newScene };
        }, () => {this.scenarioRefresh()});

        // WARNING: code past setState will not be synchronously executed
    }

    /**
     * GasFeedToggle_HandleClick()
     * Onclick handler for the gas feed toggle button
     */
    GasFeedToggle_HandleClick() {
        let newScene = this.state.scene;
        newScene[gas] = !newScene[gas];

        // change the current state, refresh scenario in callback to synchronously update the visuals after the state has changed
        this.setState((state, props) => {
            return { deltastage: gas, scene: newScene };
        }, () => {this.scenarioRefresh()});

        // WARNING: code past setState will not be synchronously executed
    }

    /**
     * KeeperElectrodeToggle_HandleClick()
     * Onclick handler for the keeper electrode toggle button
     */
    KeeperElectrodeToggle_HandleClick() {
        let newScene = this.state.scene;
        newScene[keeper] = !newScene[keeper];

        // change the current state, refresh scenario in callback to synchronously update the visuals after the state has changed
        this.setState((state, props) => {
            return { deltastage: keeper, scene: newScene };
        }, () => {this.scenarioRefresh()});

        // WARNING: code past setState will not be synchronously executed
    }

    /**
     * nextButton_plasma_HandleClick()
     * Onclick handler for the "next" button for the internal plasma scene, updates the state and DOM via appropriate logic
     */
    nextButton_plasma_HandleClick() {
        let newScene = this.state.scene;
        newScene[plasma] = true;


        // update DOM buttons (replace next with toggles)
        ReactDOM.render(
            <>
                <button id={"KeeperElectrodeToggle"}
                        className={"button"}
                        onClick={this.KeeperElectrodeToggle_HandleClick}> Keeper Electrode
                </button>

                <button id={"GasFeedToggle"}
                        className={"button"}
                        onClick={this.GasFeedToggle_HandleClick}> Gas Feed
                </button>

                <button id={"HeatInsertToggle"}
                        className={"button"}
                        onClick={this.HeatInsertToggle_HandleClick}> Heat Inserts
                </button>
            </>,
            document.getElementById('toggleButtonGroup')
        );

        // change the current state, refresh scenario in callback to synchronously update the visuals after the state has changed
        this.setState((state, props) => {
            return { deltastage: plasma, scene: newScene };
        }, () => {this.scenarioRefresh()});

    }

    /**
     * nextButton_hallThruster_HandleClick()
     */
    nextButton_hallThruster_HandleClick() {
        this.hideElement("hallThrusterButtonGroup");
        this.showElement("toggleButtonGroup");
        this.hideElement("hallThrusterButtonGroup");
        this.hideElement("hallThrusterOffLabelDiv");
        this.hideElement("hallThrusterOnLabelDiv");
        this.hideElement("hallThrusterOffSublabelDiv");
        this.hideElement("hallThrusterOnSublabelDiv");
        this.hideElement("hallThrusterNameLabelDiv");
        this.hideElement("hallThrusterNameSublabelDiv");

        this.setState((state, props) => {
            return { deltastage: base, scene: [true,false,false,false,false,false,false,false] };
        }, () => {this.scenarioRefresh()});
    }

    hallThrusterToggle_HandleClick() {

        let newScene = this.state.scene;
        newScene[hallThrusterOn] = !newScene[hallThrusterOn];

        this.setState((state, props) => {
            return { deltastage: hallThrusterOn, scene: newScene };
        }, () => {this.scenarioRefresh()});
    }

    /**
     * nextButton_eject_HandleClick()
     * Onclick handler for the "next" button for the eject plasma scene, updates the state and DOM via appropriate logic
     */
    nextButton_eject_HandleClick() {
        let newScene = this.state.scene;
        newScene[eject] = !newScene[eject];

        // update DOM buttons (replace next with toggles)
        ReactDOM.render(
            <>
                <button id={"KeeperElectrodeToggle"}
                        className={"button"}
                        onClick={this.KeeperElectrodeToggle_HandleClick}> Keeper Electrode
                </button>  {/*Todo undecided logic (this way of doing this stinks)*/}

                <button id={"GasFeedToggle"}
                        className={"button"}
                        onClick={this.GasFeedToggle_HandleClick}> Gas Feed
                </button>

                <button id={"HeatInsertToggle"}
                        className={"button"}
                        onClick={this.HeatInsertToggle_HandleClick}> Heat Inserts </button>
            </>,
            document.getElementById('toggleButtonGroup')
        );

        // change the current state, refresh scenario in callback to synchronously update the visuals after the state has changed
        this.setState((state, props) => {
            return { deltastage: eject, scene: newScene };
        }, () => {this.scenarioRefresh()});

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
     * backButton_HandleClick()
     * Onclick handler for the "back" button, reloads the landing page
     */
    backButton_HandleClick() {
        // render learning mode
        ReactDOM.render(
            <div id={"canvasHolder"}>
                <LandingPage id={"landingPage"}/>
            </div>,
            document.getElementById('root')
        );
    }


    render(){
        // console.log("LearningMode.render called") //:debug
        return (
            <>
                <canvas id={"canvas0"} ref={this.canvas0} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas1"} ref={this.canvas1} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas2"} ref={this.canvas2} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas3"} ref={this.canvas3} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas4"} ref={this.canvas4} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas5"} ref={this.canvas5} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas6"} ref={this.canvas6} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>
                <canvas id={"canvas7"} ref={this.canvas7} width={canvas_width} height={canvas_height} deltastage={this.state.deltastage} scene={this.state.scene} > You need a better browser :( </canvas>

                <div id={"backToLandingPageButtonDiv"} className={"stackedButtonGroup bottomleftAlign"} >
                    <button id={"backButton"} className={"button"} onClick={this.backButton_HandleClick}> Back to Landing Page </button>
                </div>

                <div id={"hallThrusterButtonGroup"} className={"stackedButtonGroup bottomrightAlign"}>
                    <button id={"HallThrusterToggle"}
                            className={"button"}
                            onClick={this.hallThrusterToggle_HandleClick}> Toggle Power {this.thrusterButtonText}
                    </button>
                    <button id={"HallThrusterNext"}
                            className={"button"}
                            onClick={this.nextButton_hallThruster_HandleClick}> Next
                    </button>
                </div>

                <div id={"hallThrusterOffLabelDiv"}>
                    <label id={"hallThrusterOffLabel"}
                           className={"titleLabel hallThrusterOffTitleLabelPos"}> The Hall Thruster is Off
                    </label>
                </div>

                <div id={"hallThrusterOffSublabelDiv"}>
                    <label id={"hallThrusterOffSublabel"}
                           className={"sublabel hallThrusterOffSublabelPos"}> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere magna eu blandit viverra. Suspendisse pulvinar sit amet magna in elementum. Nulla ac nibh in magna egestas pharetra sit amet et nibh. Sed gravida metus eleifend, elementum diam et, hendrerit risus. Nunc et nibh faucibus, facilisis elit eu, euismod est. Pellentesque pellentesque, massa sit amet sagittis semper, nibh.
                    </label>
                </div>

                <div id={"hallThrusterOnLabelDiv"}>
                    <label id={"hallThrusterOnLabel"}
                           className={"titleLabel hallThrusterOffTitleLabelPos"}> The Hall Thruster is On
                    </label>
                </div>

                <div id={"hallThrusterOnSublabelDiv"}>
                    <label id={"hallThrusterOnSublabel"}
                           className={"sublabel hallThrusterOffSublabelPos"}> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere magna eu blandit viverra. Suspendisse pulvinar sit amet magna in elementum. Nulla ac nibh in magna egestas pharetra sit amet et nibh. Sed gravida metus eleifend, elementum diam et, hendrerit risus. Nunc et nibh faucibus, facilisis elit eu, euismod est. Pellentesque pellentesque, massa sit amet sagittis semper, nibh.
                    </label>
                </div>

                <div id={"hallThrusterNameLabelDiv"}>
                    <label id={"hallThrusterNameLabel"}
                           className={"titleLabel hallThrusterNameTitleLabelPos"}> Hall Thruster
                    </label>
                </div>

                <div id={"hallThrusterNameSublabelDiv"}>
                    <label id={"hallThrusterNameSublabel"}
                           className={"sublabel hallThrusterNameSublabelPos"}> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere magna eu blandit viverra. Suspendisse pulvinar sit amet magna in elementum. Nulla ac nibh in magna egestas pharetra sit amet et nibh. Sed gravida metus eleifend, elementum diam et, hendrerit risus. Nunc et nibh faucibus, facilisis elit eu, euismod est. Pellentesque pellentesque, massa sit amet sagittis semper, nibh.
                    </label>
                </div>

                <div id={"toggleButtonGroup"} className={"stackedButtonGroup bottomrightAlign"}>
                    <button id={"KeeperElectrodeToggle"}
                            className={"button"}
                            onClick={this.KeeperElectrodeToggle_HandleClick}> Keeper Electrode
                    </button>
                    <button id={"GasFeedToggle"}
                            className={"button"}
                            onClick={this.GasFeedToggle_HandleClick}> Gas Feed
                    </button>
                    <button id={"HeatInsertToggle"}
                            className={"button"}
                            onClick={this.HeatInsertToggle_HandleClick}> Heat Inserts
                    </button>
                </div>
            </>
        ) //// 2 - attach ref to node via ref = this.canvas#
    }
}

export default LearningMode;