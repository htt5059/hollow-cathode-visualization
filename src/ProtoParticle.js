
/// CONSTANTS ///

import {
    right_of_cathode_constant,
    left_of_cathode_constant,
    bottom_of_cathode_constant,
    top_of_cathode_constant,
    particle_right_bounding_box
} from "./Galactic";

// Pre-load images //
const electronImage = new Image();
electronImage.src = "/images/electron.png";
const xenonImage = new Image();
xenonImage.src = "/images/xenon.png";
const ionizedXenonImage = new Image();
ionizedXenonImage.src = "/images/ionized_xenon.png";

// Misc //
const ELECTRON_RADIUS = 6;
const XENON_RADIUS = 10;
const TIMING_INTERVAL = 3/60;
const IONIZATION_AGE_THRESHOLD = 1500; // particle.halfLife must be < IONIZATION_AGE_THRESHOLD to ionize
const DEFAULT_HALFLIFE = 2000; // how many animation frames a particle lives for


const collision_elasticity = 0.4; // 1 == fully elastic, 0 == no bounce
// warning: collision_elasticity doesn't apply to diagonal (y=mx+b) collisions since we don't have a need for that atm
// charges //
const keeper_electric_field_kq = -40; // the constant for k*q in the kqq/r equation (force due to an electric field) due to the keeper electrode
const thruster_electric_field_kq = -100; // the constant for k*q in the kqq/r equation (force due to an electric field) due to the hall thruster
const ELECTRON_CHARGE = -0.5;
const XENON_CHARGE = 0;
const IONIZED_CHARGE = 0.8;

// possible particle types //
const TYPE_ELECTRON = 'electron';
const TYPE_XENON = 'xenon';
const TYPE_IONIZEDXENON = 'ionized xenon';
const TYPE_NONE = 'ionized xenon';

// speed modifiers/ range definitions //
const particle_maxv_x = 20; // original: 30, 2nd iteration: 30
const particle_minv_x = -20; // original: -30, 2nd iteration: -0
const particle_maxv_y = 20; // original: 30, 2nd iteration: 30
const particle_minv_y = -20; // original: -30, 2nd iteration: -30
const particle_speed_modifier = 0.025; //original: 0.025
//////

// NON-CONSTANTS //
// var xenon_particles_array = []; // array of all existing xenon particles
// var electron_particles_array = []; // array of all existing electron particles
var particles_array = []; // array of all existing electron particles
var ejectFlag = false;
var ionizeFlag = false;
////


class ProtoParticle {
    ctx; // ctx element/layer the particle is drawn on, draw on this one
    canvas; // canvas element/layer the particle is drawn on, use this to look at the properties of the canvas, don't draw on it
    x; // int px, x position of center of particle
    y; // int px, y position of center of particle
    vx; // int px, x velocity
    vy; // int px, y velocity
    ax; // int px/tick^2, x acceleration
    ay; // int px/tick^2, y acceleration
    radius; // int px, radius of particle
    color; // color string or hex string, color of particle
    anime_key; // animation frame reference used to cancel this particle's animation, see this.startAnimation(), defaults to -1
    animate; // animation function and logic (pathing, boundaries, physics, etc.)
    interval; // essentially the rate defining how many times a second accelerations and forces are applied (delta time)
    accelerating = true; // toggle application of accelerations (for testing purposes)
    particle_type; // type of particle, should be either: TYPE_ELECTRON, TYPE_XENON, TYPE_IONIZEDXENON, or TYPE_NONE (constants) (see constants)
    max_y; // bounding box (low barrier)
    min_y; // bounding box (high barrier)
    max_x; // bounding box (right barrier)
    min_x; // bounding box (left barrier)




    /**
     * Constructor for particle object with 7 optional parameters and 1 mandatory parameter (layer)
     *
     * @param layer ctx element/layer to draw the particle on
     * @param x int px, initial x position of center of particle, if set to -999: defaults to a random value between 26 and 800
     * @param y int px, initial y position of center of particle, if set to -999: defaults to a random value between 26 and 400
     * @param vx int px/tick, initial x velocity, if set to -999: defaults to a random integer between 0 and 5
     * @param vy int px/tick, initial y velocity, if set to -999: defaults to a random integer between 0 and 5
     * @param ax int px/tick^2, initial x acceleration, *used to* default to a random integer between 1 and 5  (Math.floor(Math.random() * (5 - 1) + 1))
     * @param ay int px/tick^2, initial y acceleration, *used to* default to a random integer between 1 and 5  (Math.floor(Math.random() * (5 - 1) + 1))
     * @param particle_type type of particle, should be either: TYPE_ELECTRON, TYPE_XENON, TYPE_IONIZEDXENON, or TYPE_NONE (constants) (see constants)
     * @param max_y bounding box (low barrier)
     * @param min_y bounding box (high barrier)
     * @param max_x bounding box (right barrier)
     * @param min_x bounding box (left barrier)
     */
    constructor(
        layer,
        x,
        y,
        vx,
        vy,
        ax,
        ay,
        particle_type,
        max_y,
        min_y,
        max_x,
        min_x
    ) {
        this.id = Math.ceil(Math.random() * 100); // used to find particle in particles array
        this.ctx = layer;
        this.canvas = layer.canvas;
        this.particle_type = particle_type;

        // Classification //
        // add self to particles array
        if(particle_type === TYPE_ELECTRON){
            this.image = electronImage;
            this.charge = ELECTRON_CHARGE;
            this.radius = ELECTRON_RADIUS;
            // electron_particles_array.push(this);

        } else if(particle_type === TYPE_XENON){
            this.image = xenonImage;
            this.charge = XENON_CHARGE; // neutral
            this.radius = XENON_RADIUS;
            // xenon_particles_array.push(this);

        } else if(particle_type === TYPE_IONIZEDXENON){
            this.image = xenonImage;
            this.charge = IONIZED_CHARGE;
            this.radius = XENON_RADIUS;
            // xenon_particles_array.push(this);

        } else {
            this.image = TYPE_NONE;
            this.charge = IONIZED_CHARGE; // positive
            this.radius = 15;
            console.error("invalid particle_type: ", this.particle_type);
        }

        // Location //
        // x: randomize if default value
        if(x === -999){
            // default to a random x position between min and max
            let max = layer.canvas.width;
            let min = this.radius + 1;
            this.x = Math.floor(Math.random() * (max - min) + min); //Math.floor is 10% slower than Math.ceil (consider later)
        } else {
            this.x = x;
        }

        // y: randomize if default value
        if(y === -999){
            // default to a random x position between min and max
            let max = layer.canvas.height;
            let min = this.radius + 1;
            this.y = Math.floor(Math.random() * (max - min) + min); //Math.floor is 10% slower than Math.ceil (consider later)
        } else {
            this.y = y;
        }

        // x error checking
        if(this.x > layer.canvas.width || this.x < 0){
            console.error("invalid initial x coordinate of particle: ", this.x);
        }
        // y error checking
        if(this.y > layer.canvas.height || this.y < 0){
            console.error("invalid initial y coordinate of particle: ", this.y);
        }


        // Velocity //
        // vx: randomize if default value
        if(vx === -999){
            this.vx = (Math.floor(Math.random() * (particle_maxv_x - particle_minv_x) + particle_minv_x) * particle_speed_modifier); //Math.floor is 10% slower than Math.ceil (consider later)
        } else {
            this.vx = vx;
        }

        // vy: randomize if default value
        if(vy === -999){
            this.vy = (Math.floor(Math.random() * (particle_maxv_y - particle_minv_y) + particle_minv_y) * particle_speed_modifier); //Math.floor is 10% slower than Math.ceil (consider later)
        } else {
            this.vy = vy;
        }

        // Acceleration //
        this.ax = ax;
        this.ay = ay;

        // this.color = color; // depreciated now that we have images from the artist
        this.anime_key = -1; // key/reference to current animation frame, given by browser, defaults to -1
        this.interval = TIMING_INTERVAL; // timing

        // Bounding Box //
        this.max_y = max_y; // operates off of distance from axis
        this.min_y = min_y;
        this.max_x = max_x;
        this.min_x = min_x;

        this.halfLife = DEFAULT_HALFLIFE;

        particles_array.push(this);
    }

    /**
     * Definition of how a ProtoParticle should look
     */
    draw(){
        // colored circle
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        // this.ctx.closePath();
        // this.ctx.fillStyle = this.color;
        // this.ctx.fill();

        // proper image
        this.ctx.drawImage(this.image, this.x, this.y, this.radius * 2, this.radius * 2)
    }

    /**
     * Initialize/start this particle's rendering and animation.
     */
    startAnimation(){
        // this.anime_key = window.requestAnimationFrame(animate);
        let temp_this = this; // assign "this" (this particle) to a temporary variable so that it is defined when requestAnimationFrame calls it
        this.anime_key = window.requestAnimationFrame(function() { temp_this.animate(temp_this) });
    }

    /**
     * !logic error warning! you may be thinking of clearAnimation()
     * Stop this particle's rendering and animation *WITHOUT erasing the last frame of it.*
     */
    stopAnimation(){
        window.cancelAnimationFrame(this.anime_key);
    }

    /**
     * !logic error warning! you may be thinking of stopAnimation()
     * Stop this particle's rendering and animation *AND erase the last frame of it.*
     */
    clearAnimation(){
        window.cancelAnimationFrame(this.anime_key);
        this.clearPath();
    }

    /**
     * Function for clearing the previous frame/particle before drawing the new/updated frame.
     */
    clearPath(){
        // method 0 - clear path using grey particle, no visible edges on overlap but leaves a trail
        // clear circle
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius+1, 0, Math.PI * 2, true);
        // this.ctx.closePath();
        // this.ctx.fillStyle = 'grey';
        // this.ctx.fill();

        // method 1 - properly clear area as rectangle, visible edges on overlap
        // clear circle
        // this.ctx.clearRect(this.x - this.radius - 1, this.y - this.radius - 1, this.radius * 2 + 2, this.radius * 2 + 2);

        // clear image
        this.ctx.clearRect(this.x, this.y, this.radius * 2, this.radius * 2);
    }

    /**
     * Sets the animation function
     * @param animate (function)
     */
    setAnimation(animate){
        this.animate = animate;
    }

    /**
     * Input should be 'electron', 'xenon', 'ionized xenon', or 'none' (TYPE_ELECTRON, TYPE_XENON, TYPE_IONIZEDXENON, or TYPE_NONE
     * @param type (string) string representing the particle type, is mapped to appropriate particle image
     */
    setImage(type){
        if(type === TYPE_ELECTRON){
            this.particle_type = TYPE_ELECTRON;
            this.image = electronImage;
        } else if(type === TYPE_XENON){
            this.particle_type = TYPE_XENON;
            this.image = xenonImage;
        } else if(type === TYPE_IONIZEDXENON){
            this.particle_type = TYPE_IONIZEDXENON;
            this.image = ionizedXenonImage;
        } else if(type === 'none'){
            this.particle_type = 'none';
            console.error('ProtoParticle:: setImage: Invalid type provided: ', type);
        } else {
            this.particle_type = 'none';
            console.error('ProtoParticle:: setImage: Invalid type provided: ', type);
        }
    }

    /**
     * getCathTube___() - unfortunately duped form painter.js
     * Returns the location of the ___ of the cathode tube on the _ axis, don't forget to account for particle width
     * Used for the electron and xenon boundary box positions* (talk to Jack he isn't done here - 3/31/22)
     *
     * @returns {number} (int) single coordinate
     */
    getCathTubeBot(){
        return this.canvas.height * bottom_of_cathode_constant;
    }
    getCathTubeTop(){
        return this.canvas.height * top_of_cathode_constant;
    }
    getCathTubeRightX(){
        return this.canvas.width * right_of_cathode_constant;
    }
    getCathTubeLeftX(){
        return this.canvas.width * left_of_cathode_constant;
    }

    /**
     * getParticleTube___() - unfortunately duped form painter.js
     * Returns the location of the particle boundary for the cathode tube on the _ axis, don't forget to account for particle width
     * Used for the electron and xenon boundary box positions* (talk to Jack he isn't done here - 3/31/22)
     *
     * @returns {number} (int) single coordinate
     */
    getParticleTubeRightX(){
        return this.canvas.width * particle_right_bounding_box;
    }

    /**
     * Ionize yourself
     */
    ionize(){
        if(this.particle_type === TYPE_XENON){
            this.particle_type = TYPE_IONIZEDXENON; // todo - particle: make sure everything updates types properly like this
            this.charge = IONIZED_CHARGE;
            this.setImage(TYPE_IONIZEDXENON);

            ProtoParticle.generateElectron(this.ctx, this.x, this.y, this.getCathTubeBot(), this.getCathTubeTop(), this.getParticleTubeRightX(), this.getCathTubeLeftX());
            ProtoParticle.generateElectron(this.ctx, this.x, this.y, this.getCathTubeBot(), this.getCathTubeTop(), this.getParticleTubeRightX(), this.getCathTubeLeftX());
        }
        else if(this.particle_type === TYPE_ELECTRON){
            // clone self?
            // electron_particles_array.push(this); // not quite how you'd do it
        }
    }

    /**
     * Eject yourself
     * Switches animation and changes bounding box
     */
    eject(){
        // // if is xenon
        // if(this.particle_type === TYPE_XENON || this.particle_type === TYPE_IONIZEDXENON){
        //     this.setAnimation(ProtoParticle.xenonAnimation)
        //     // this.max_x = this.canvas.width * 4; //todo: revist eject
        // }
        // // if is electron
        // else if(this.particle_type === TYPE_ELECTRON){
        //     this.max_x = this.canvas.width * 2; //todo: revist eject
        // }
    }

    /**
     * Have a particle delete itself from existence
     */
    delete_self(){
        this.clearAnimation()
        // console.log("deleting self.");//:debug
        // console.log("array:")
        // console.log(particles_array);
        // console.log("find:")
        // console.log(particles_array.findIndex((element) => element.id === this.id));
        // console.log("find and delete:")
        // console.log(particles_array.indexOf(this) > -1 ? particles_array.splice(particles_array.indexOf(this), 1) : false)
        // console.log("result:")
        // console.log(particles_array);
        // console.log("---------")
    }

    /**
     * Ionizes the particle at xenon_particles_array[key]
     * Essentially a wrapper for the call, this is needed since using setTimeout makes scoping issues
     *
     * @param index index in xenon_particles_array[]
     */
    static draw_ionize(index){
        try {
            // xenon_particles_array[index].ionize();
            particles_array[index].ionize();
        } catch (error) {
            // Expected error: TypeError
            // This happens when a particle is deleted before it can ionize, this is normal (in presMode)
        }

    }

    static draw_eject(index){
        // depreciated by implementation of eject flag


        // try {
        //     // xenon_particles_array[index].eject();
        //     // electron_particles_array[index].eject();
        //     particles_array[index].eject();
        // } catch (error) {
        //     // Expected error: TypeError
        //     // This happens when a particle is deleted before it can ionize, this is normal (in presMode)
        // }

    }

    static ionizeParticles(){
        // console.log("xenon_particles_array.length: ", xenon_particles_array.length)
        this.setIonizeFlag(true)
    }

    static ejectParticles(){
        this.setEjectFlag(true)
    }


    static xenonAnimation(particle){
        particle.clearPath();

        // // set angled boundary box using a slope and a y-intercept
        // let m = 1; // slope
        // let b = 300; // y intercept

        if(ionizeFlag && particle.particle_type === TYPE_XENON && particle.halfLife < IONIZATION_AGE_THRESHOLD){
            particle.ionize();
        }

        // check y boundary using normal bounding box
        if (particle.y + particle.vy > particle.max_y - particle.radius * 2 || particle.y + particle.vy < particle.min_y ) {
            particle.vy = -particle.vy * collision_elasticity;
        }
        // check x boundary using normal bounding box
        else if (particle.x + particle.vx > particle.max_x - particle.radius * 2 || particle.x + particle.vx < particle.min_x) {
            particle.vx = -particle.vx * collision_elasticity;
        }
        // // check boundary using slope intercept form (doesn't account for square objects yet) (for squares, pov = top left instead of center)
        // else if((particle.y + particle.vy) >= m * (particle.x + particle.vx) + b){
        //
        //     // // do a proper angled bounce
        //     // let swap = particle.vx;
        //     // particle.vx = particle.vy;
        //     // particle.vy = swap;
        // }
        else {
            // acceleration is only applied here to prevent logic errors accelerating particles through collisions
            // v_f = v_o + a*t (kinematic) (where t is the interval or intensity) (good values are like 1/60 or 5/60)

            // todo particle 8: potential divide by zero error
            particle.ax = keeper_electric_field_kq/particle.x * particle.charge; //keeper force (kqq/r in essence)

            if(particle.x > particle.getCathTubeRightX()){
                // stop it from returning
                particle.min_x = particle.getCathTubeRightX(); // todo particle 1
                particle.max_x = particle.canvas.width;
                particle.min_y = 0;
                particle.max_y = particle.canvas.height;
            } else {
                if(ejectFlag){
                    // y acceleration
                    particle.vy = particle.vy + (particle.ay * particle.interval);

                    // x acceleration
                    particle.vx = particle.vx + (particle.ax * particle.interval);
                }
            }
        }

        // check if particle hit back of the tube
        if (particle.particle_type === TYPE_IONIZEDXENON && (particle.x < particle.getCathTubeLeftX() + particle.radius)){
            particle.halfLife = 0; // despawn the particle
        }

        //move the particle at the given velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        //draw the particle
        particle.draw();

        // check if on screen
        if(
            particle.x > particle.canvas.width ||
            particle.x < 0 ||
            particle.y > particle.canvas.height ||
            particle.y > particle.canvas.height
        ){
            particle.halfLife = 0; //will despawn at end of this animation
        }

        // drain halfLife
        particle.halfLife = particle.halfLife - 1

        if(particle.halfLife > 0){
            particle.anime_key = window.requestAnimationFrame(function() {particle.animate(particle)});
        } else {
            particle.delete_self()
        }
    }

    static electronAnimation(particle){
        particle.clearPath();

        // set angled boundary box using a slope and a y-intercept
        let m = 1; // slope
        let b = 300; // y intercept

        // check y boundary using normal bounding box
        if (particle.y + particle.vy > particle.max_y - particle.radius * 2 || particle.y + particle.vy < particle.min_y ) {
            particle.vy = -particle.vy * collision_elasticity;
        }
        // check x boundary using normal bounding box
        else if (particle.x + particle.vx > particle.max_x - particle.radius * 2 || particle.x + particle.vx < particle.min_x) {
            particle.vx = -particle.vx * collision_elasticity;
        }
        // // check boundary using slope intercept form (doesn't account for square objects yet) (for squares, pov = top left instead of center)
        // else if((particle.y + particle.vy) >= m * (particle.x + particle.vx) + b){
        //
        //     // // do a proper angled bounce
        //     // let swap = particle.vx;
        //     // particle.vx = particle.vy;
        //     // particle.vy = swap;
        // }
        else {
            // acceleration is only applied here to prevent logic errors accelerating particles through collisions
            // v_f = v_o + a*t (kinematic) (where t is the interval or intensity) (good values are like 1/60 or 5/60)

            // todo - potential divide by zero error
            particle.ax = keeper_electric_field_kq/particle.x * particle.charge; //keeper force (kqq/r in essence)

            if(particle.x > particle.getCathTubeRightX() + particle.radius * 2){
                // stop it from returning
                particle.min_x = particle.getCathTubeRightX();
                particle.max_x = particle.canvas.width + particle.radius * 4;
                particle.min_y = 0;
                particle.max_y = particle.canvas.height + particle.radius * 4;

                particle.ay = thruster_electric_field_kq/particle.y * particle.charge; //keeper force (kqq/r in essence) // hall thruster E field
            }

            if(ejectFlag){
                // y acceleration
                particle.vy = particle.vy + (particle.ay * particle.interval);

                // x acceleration
                particle.vx = particle.vx + (particle.ax * particle.interval);
            }

        }

        //move the particle at the given velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        //draw the particle
        particle.draw();

        // check if on screen
        if(
            particle.x > particle.canvas.width ||
            particle.x < 0 ||
            particle.y > particle.canvas.height ||
            particle.y > particle.canvas.height
        ){
            particle.halfLife = 0; //will despawn at end of this animation
        }

        // drain halfLife
        particle.halfLife = particle.halfLife - 1;

        if(particle.halfLife > 0){
            particle.anime_key = window.requestAnimationFrame(function() {particle.animate(particle)});
        } else {
            particle.delete_self()
        }
    }

    /**
     * Generates a new xenon on a given layer at a given position
     * @param ctx layer
     * @param x initial x position
     * @param y initial y position
     * @param mmax_y bounding box
     * @param mmin_y bounding box
     * @param mmax_x bounding box
     * @param mmin_x bounding box
     */
    static generateXenon(ctx, x, y, mmax_y, mmin_y, mmax_x, mmin_x){
        // console.log("generating electron");//:debug
        // Drawing some particles //
        let xenon0 = new ProtoParticle(ctx, x, y, -999, -999, 0, 0, TYPE_XENON, mmax_y, mmin_y, mmax_x, mmin_x); // randomized
        xenon0.setAnimation(ProtoParticle.xenonAnimation);
        xenon0.startAnimation();
    }// todo particle 6

    static killAllParticles(){
        // let limiti = xenon_particles_array.length;
        // for (let i = 0; i < limiti; i++) {
        //     (xenon_particles_array.pop()).clearAnimation();
        // }

        // console.log("killing all particles");//:debug

        let limiti = particles_array.length;
        for (let i = 0; i < limiti; i++) {
            (particles_array.pop()).clearAnimation();
        }
    }



    /**
     * Generates a new xenon on a given layer at a given position
     * @param ctx layer
     * @param x initial x position
     * @param y initial y position
     * @param mmax_y bounding box
     * @param mmin_y bounding box
     * @param mmax_x bounding box
     * @param mmin_x bounding box
     */
    static generateElectron(ctx, x, y, mmax_y, mmin_y, mmax_x, mmin_x){
        // console.log("generating electron");//:debug
        // Drawing some particles //
        let electron0 = new ProtoParticle(ctx, x, y, -999, -999, 0, 0, TYPE_ELECTRON, mmax_y, mmin_y, mmax_x, mmin_x); // randomized
        electron0.setAnimation(ProtoParticle.electronAnimation);
        electron0.startAnimation();
    }

    static killAllElectron(){
        // let limiti = electron_particles_array.length;
        // for (let i = 0; i < limiti; i++) {
        //     (electron_particles_array.pop()).clearAnimation();
        // }

        // let limiti = particles_array.length;
        // for (let i = 0; i < limiti; i++) {
        //     (particles_array.pop()).clearAnimation();
        // }
    }

    // todo particle 3
    static setElectronBoundingBox(mmax_y, mmin_y, mmax_x, mmin_x){
        // needs implemented with particles_array now that I am thinking about removing electron_particles_array
        // // for each particle in electron array, update these parameters
        // for (const index in electron_particles_array) {
        //     let particle = electron_particles_array[index]
        //     particle.max_y = mmax_y;
        //     particle.min_y = mmin_y;
        //     particle.max_x = mmax_x;
        //     particle.min_x = mmin_x;
        // }
    }

    static setXenonBoundingBox(mmax_y, mmin_y, mmax_x, mmin_x){
        // needs implemented
        // for each xenon particle in particle array, update these parameters
    }

    /**
     * Setter for eject flag boolean
     * @param value (bool) new value
     */
    static setEjectFlag(value){
        ejectFlag = value;
    }

    /**
     * Setter for ionize flag boolean
     * @param value (bool) new value
     */
    static setIonizeFlag(value){
        ionizeFlag = value;
    }
}


export default ProtoParticle;
