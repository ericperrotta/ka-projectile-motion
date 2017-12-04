/****
Our Monster Cannonball, played by our reluctant daredevil,
Old Spice Man, will be shot from the cannon when you click on
the "FIRE" button.  You can set the initial speed of Mr.
Spice and the angle of the cannon's barrel with the provided
controls.  You will only have 1 chance to shoot Mr. Spice
into the pool or leave him with a terrible headache.  The
pool will move every time you restart the game.  So to save
Mr. Spice some pain, harness some of your knowledge of
projectile motion to calculate what combination of the cannon
angle and Mr. Spice's initial velocity will allow him to
travel the given distance in meters to the pool.

There are 2 switches when turned "ON" that will give you some
interesting information about Mr. Spice's flight:

-Launch Data: This will give you data about Mr. Spice's velocity and
              displacement at different pointsin the journey.

-Vectors: When this switch is turned on, you will get a cool visualization
          of the direction and magnitude of the velocity at the same points in time in vector form.

IMPORTANT NOTE: When making your calculations, you can assume that air friction
                will have no effect on Mr. Spice's motion.

If you need a refresher on projectile motion and some very powerful kinematics formulas, check out these courses on Khan Academy:
https://www.khanacademy.org/science/physics/one-dimensional-motion/kinematic_formulas/v/average-velocity-for-constant-acceleration
https://www.khanacademy.org/science/physics/two-dimensional-motion/two-dimensional-projectile-mot/v/visualizing-vectors-in-2-dimensions
****/

/********** CONSTANTS & VARIOUS CONFIGURATIONS **********/
var STARTING_X = 50;  // x of the cannon and the starting point of our monster cannonball
var STARTING_Y = 339; // y of the cannon and the starting point of our monster cannonball

var PIXELS_PER_METER = 16.0;  // In this simulation world every 16 pixels will map to 1 meter.

/*
Unlike most physics classrooms, gravity has a positive
direction in our program. This is because in processing.js
an object moving down the canvas (in our case towards
the ground) will be moving in the positive direction.
Whereas in the typical physics classroom any object
moving in the towards the center of the Earth is said
to be moving in the negative direction.*/
var GRAVITY = 9.8;

/* Starting angle for all relevant objects when the
program starts. The angle is a negative value
because a negative angle rotation in processing.js
is a counterclockwise rotation.  In math and
physics classes, the opposite is generally true.
A negative angle rotation is generally a
clockwise rotation.  We want our program to appear
to follow the standards of the typical physics
classroom so any displaying of angle information within the
program will display as positive when, in reality, it is negative
within the processing.js environment.
*/
var STARTING_ANGLE = -38;

var SERIF_FONT = createFont("serif");

// 3 Color values used often in the program
var GREEN = color(0,255,0);
var YELLOW = color(251, 255, 0);
var RED = color(242, 48, 48);

var TIME_INCREMENT = 0.0171; // Amount of time we will simulate between draw() frames

var state = "preLaunch";  // Set the state of the world when the program begins
/********** CONSTANTS & VARIOUS CONFIGURATIONS **********/


/********** UTILITY FUNCTIONS **********/
/**
 * Round a number to a given decimal place
 */
var roundToDecimal = function(num, decPlace) {
    return round(num * pow(10,decPlace)) / pow(10,decPlace);
};

/**
 * Returns a random whole number ranging from 10 to 20. This will be used to set
 * a horizontal displacemnt of 10 to 25 meter between the cannon and the pool.
 */
var getRandomDisplacement = function() {
    return round(random(10,25));
};

/**
 * Calculates the displacement given an initial velocity,
 * change in time, and constant acceleration. Based off
 * of this kinematic equation:
 *
 * displacement = initialVelocity * time + 1/2 * acceleration  * time^2
 *
 * More info here:
 * https://www.khanacademy.org/science/physics/one-dimensional-motion/kinematic_formulas/v/deriving-displacement-as-a-function-of-time-acceleration-and-initial-velocity
 */
var calcDisplacement = function(initVel, time, accel) {
    return initVel * time + 0.5 * accel * sq(time);
};

/**
 * Caclculates final velocity given an initial velocity,
 * change in time, and constant acceleration. Based off
 * of this kinematic equation:
 *
 * velocityFinal = velocityInitial + gravity * time
 *
 * More info here:
 * https://www.khanacademy.org/science/physics/one-dimensional-motion/kinematic_formulas/v/average-velocity-for-constant-acceleration
 */
var calcFinalVel = function(initVel, time, accel) {
    return initVel + accel * time;
};

/**
 * Calculate the change in time given an initial velocity,
 * final velocity, and acceleration. Based on the
 * kinematic equation:
 *
 * ∆velocity = acceleration * ∆time
 *
 * More info here:
 * https://www.khanacademy.org/science/physics/two-dimensional-motion/two-dimensional-projectile-mot/v/projectile-at-an-angle
 */
var calcChangeInTime = function(initVel, finalVel, accel) {
    return (finalVel - initVel) / accel;
};

/**
 * Given the magnitude of a vector, calculate the
 * x component.
 *
 * // More info here:
 * https://www.khanacademy.org/science/physics/two-dimensional-motion/two-dimensional-projectile-mot/v/projectile-at-an-angle
 */
var calcVectorX = function(velocityMag, ang) {
    return velocityMag * cos(ang);
};

/**
 * Given the magnitude of a vector, calculate the
 * y component.
 *
 * More info here:
 * https://www.khanacademy.org/science/physics/two-dimensional-motion/two-dimensional-projectile-mot/v/projectile-at-an-angle
 */
var calcVectorY = function(velocityMag, ang) {
    return velocityMag * sin(ang);
};

/**
* These 2 functions convert polar coordinates to cartesian
* x any y coordinates. More about polar coordinates here:
* https://www.khanacademy.org/math/precalculus/parametric_equations/polar_coor/v/polar-coordinates-1
*/
var polarToCartesianX = function(x, radius, ang) {
    return x + radius * cos(ang);
};
var polarToCartesianY = function(y, radius, ang) {
    return y + radius * sin(ang);
};

/**
 * Returns an object with the x and y coordinates for all the vertices of an
 * octagon. More info here:
 * http://en.wikipedia.org/wiki/Octagon#Regular_octagon
 */
var getOctagonVertices = function(x,y,w,h){

    var octVertices = {};

    var horizSide = w / 2.414;
    var vertSide = h / 2.414;

    // Octagon vertices will have 4 x values defined here from left to right
    octVertices.xLeftOuter = x - w / 2;
    octVertices.xLeftInner = x - horizSide/2;
    octVertices.xRightInner = x + horizSide/2;
    octVertices.xRightOuter = x + w / 2;

    // Octagon vertices will have 4 y values defined here from top to bottom
    octVertices.yTopOuter = y - h / 2;
    octVertices.yTopInner = y - vertSide / 2;
    octVertices.yBottomInner = y + vertSide / 2;
    octVertices.yBottomOuter = y + h /2;

    return octVertices;
};

/**
 * Draw an octagon given the x and y vertices for the center and a width & height
 */
var drawOctagon = function(x,y,w,h) {

    var vertices = getOctagonVertices(x,y,w,h);

    beginShape();
    // top
    vertex(vertices.xLeftInner, vertices.yTopOuter);
    vertex(vertices.xRightInner, vertices.yTopOuter);

    // right
    vertex(vertices.xRightOuter, vertices.yTopInner);
    vertex(vertices.xRightOuter, vertices.yBottomInner);

    // bottom
    vertex(vertices.xRightInner, vertices.yBottomOuter);
    vertex(vertices.xLeftInner, vertices.yBottomOuter);

    // left
    vertex(vertices.xLeftOuter, vertices.yBottomInner);
    vertex(vertices.xLeftOuter, vertices.yTopInner);

    // connect to start
    vertex(vertices.xLeftInner, vertices.yTopOuter);
    endShape();
};
/********** UTILITY FUNCTIONS **********/



/********** MONSTERCANNONBALL - THE PROJECTILE! **********/
/**
 * The MonsterCannonBall is the object we will use to track the position and
 * velocity over time of the Old Spice Man Cannonball projectile.
 **/
var MonsterCannonBall = function(config) {
// Constructor

    this.img = getImage("avatars/old-spice-man");

    var x = config.x || 200;
    var y = config.y || 200;

    // control the scale of the image which would normally be too large for our purposes
    this.scale = config.sc || 1;

    // flag to stop cannonball from being displayed, do not want to display until cannon fired
    this.hide = config.hide || true;

    this.initialPostion = new PVector(x,y);
    this.currentPosition = new PVector(x,y);

    this.initialVelocity = new PVector(0,0);
    this.currentVelocity = new PVector(0,0);

    this.startTime = 0;
    this.flightTime = 0;
    // the time it will take for projectile to reach it's peak and drop to the original y position
    this.totalTime = 1;

    // used to mark the position over time so that we can continually display the parabola path
    this.pathPlot = [];

    // upon firing cannon, collects data for 5 points in time to display the data throughout the flight
    this.timePlots = [];
};


MonsterCannonBall.prototype.getPosition = function() {
    return this.currentPosition.get();
};

MonsterCannonBall.prototype.calcPosXByTime = function(time) {
    /*
       since we are in an air friction free world,
       there is no acceleration acting on the projectile
       in the x direction
    */
    var accel = 0;
    var disp = calcDisplacement(this.initialVelocity.x, time, accel);
    return this.initialPostion.x + disp;
};

MonsterCannonBall.prototype.calcPosYByTime = function(time) {
    // gravity is the acting acceleration in y direction
    var accel = GRAVITY * PIXELS_PER_METER;
    var disp = calcDisplacement(this.initialVelocity.y, time, accel);
    return this.initialPostion.y + disp;
};

MonsterCannonBall.prototype.calcInitialVelX = function(velocityMag, ang) {
    var velocityX = calcVectorX(velocityMag, ang);
    return velocityX * PIXELS_PER_METER;
};

MonsterCannonBall.prototype.calcInitialVelY = function(velocityMag, ang) {

    var velocityY = calcVectorY(velocityMag, ang);
    return velocityY * PIXELS_PER_METER;
};

MonsterCannonBall.prototype.calcCurrentVelByTimeY = function(time) {
    var accel = GRAVITY * PIXELS_PER_METER;
    return calcFinalVel(this.initialVelocity.y, accel, time);
};

var calcChangeInTime = function(initVel, finalVel, accel) {
    return (finalVel - initVel) / accel;
};

MonsterCannonBall.prototype.calcTotalTime = function() {
    var initVel = this.initialVelocity.y;

    /* Since there is the constant acceleration of
    gravity acting on the projectile in the y direction
    and no acceleration in the x direction because of
    no air friction, we can assume the final velocity
    of the projectile once it hits the ground will
    have the same magnitude as the initial velocity
    only in the opposite direction. Hence, the negative.*/
    var finalVel = -this.initialVelocity.y;
    var accel = GRAVITY * PIXELS_PER_METER;

    return calcChangeInTime(initVel,finalVel,accel);

};

/**
 * This stores the position and velocity of the
 * projectile at 5 distinct times from when the
 * projectile is launched to when it drops back down to the
 * initial y position that it started at:
 *      0) take off (time=0)
 *      1) 1/4 of the trip
 *      2) half of the trip, at the peak
 *      3) 3/4 of the trip
 *      4) when the projectile lands
 * These plots will be used to display our "Flight Data"
 * and Vectors
 */
MonsterCannonBall.prototype.calcTimePlots = function() {

    for (var i=0; i<=4; i++) {
        var plot = {};
        plot.time = this.totalTime/4 * i;

        var posX = this.calcPosXByTime(plot.time);
        var posY = this.calcPosYByTime(plot.time);
        plot.pos = new PVector(posX,posY);

        var velY = this.calcCurrentVelByTimeY(plot.time);
        plot.vel = new PVector(this.initialVelocity.x,velY);

        this.timePlots.push(plot);
    }
};

/********** CANNONBALL EVENT HANDLERS **********/

/**
 * Update the necessary state of our cannonball object
 */
MonsterCannonBall.prototype.fire = function(v, ang) {
    // now that we are firing the cannonball, we want it to be visible
    this.hide = false;

    this.currentPosition = this.initialPostion.get();

    this.initialVelocity.set(this.calcInitialVelX(v, ang), this.calcInitialVelY(v, ang));
    this.currentVelocity.set(this.initialVelocity.x, this.initialVelocity.y);

    // set time in motion, must be incremented after setting initial velocity
    // updates to the cannonball position will only be made if flightTime is greater than 0
    this.flightTime = TIME_INCREMENT;

    /*Need to use time to control when the projectile
    stops. If y position is used, the stopping point
    is not consistent. We calculate the total time
    the trip should take based on the velocity and
    angle.*/
    this.totalTime = this.calcTotalTime();
    debug("Expected Flight Time:", this.totalTime);

    this.startTime = millis()/1000; // convert to seconds

    this.calcTimePlots();
};

/**
 * Actions that should occur on the cannonball object when
 * the "RESET" button is pressed.
 */
MonsterCannonBall.prototype.reset = function() {
    this.hide = true;
    this.flightTime = 0;
    this.pathPlot = [];
    this.timePlots = [];
};

/**
 * Update the position and the velocity of the cannonball
 * based on the current time.
 */
MonsterCannonBall.prototype.update = function () {

    if (this.flightTime > 0 && this.currentPosition.y < this.initialPostion.y + 15) {
        this.currentPosition.x = this.calcPosXByTime(this.flightTime);
        this.currentPosition.y = this.calcPosYByTime(this.flightTime);
        this.currentVelocity.y = this.calcCurrentVelByTimeY(this.flightTime);

        /* The update() function will be executed with every
        frame of draw(). The amount of time that passes with
        each frame of draw() is not consistent so we cannot
        rely on the processing.js function millis() to give
        us a constant change in time. If we rely on
        millis(),the motion of the projectile is very
        choppy. Instead, we simulate a consistent change in
        time with a pre-designated TIME_INCREMENT which I
        tested quite rigorously. This creates a much
        smoother motion in the animation of the projectile
        and, in my view, leads to a total flight time with a
        small enough difference for our purposes of
        projectile motion simulation. If you are interested
        in seeing the variance, open the javascript console
        and 2 debug statements will show you the
        difference. This is definitely a hack!*/
        this.flightTime += TIME_INCREMENT;

        // Recording the position of the projectile every 5 frames for display later
        if (frameCount % 5 === 0 && this.currentPosition.y <= this.initialPostion.y) {
            this.pathPlot.push(this.currentPosition.x, this.currentPosition.y);
        }
    }
};

/**
 * Check if the projectile has reached the end of the flight
 * path based on the amount of time it has been in flight
 */
MonsterCannonBall.prototype.flightEnded = function() {
    return this.flightTime >= this.totalTime;
};

/**
 * Turn on hide flag so the cannonball will not be displayed.
 * Useful when the projectile hits the pool.
 */
MonsterCannonBall.prototype.hideCannonBall = function() {
    this.hide = true;
};
/********** CANNONBALL EVENT HANDLERS **********/



/********** CANNONBALL DISPLAY FUNCTIONS **********/

/**
 * Display the cannonball and the changing velocity vectors
 * throughout the flight
 */
MonsterCannonBall.prototype.display = function() {

    if (!this.flightEnded() && this.flightTime > 0) {
        var componentColor = RED;
        var velocityColor = GREEN;
        var velComponentX = new PVector(this.currentVelocity.x,0);
        var velComponentY = new PVector(0,this.currentVelocity.y);
        this.drawVelVect(this.currentPosition.get(),
                         velComponentX.get(),
                         componentColor,"x");
        this.drawVelVect(this.currentPosition.get(),
                 velComponentY.get(),
                 componentColor,"y");
        this.drawVelVect(this.currentPosition.get(),
                         this.currentVelocity.get(),
                         velocityColor);
    }

    /*Only display the cannonball after it has been
    launched. Will hide cannonball when we hit the pool
    to give the illusion that it has gone under water*/
    if (!this.hide) {
        pushMatrix();
        imageMode(CENTER);
        translate(this.currentPosition.x, this.currentPosition.y);
        // Rotate additional 90° so the top of Mr. Spice's head is leading the charge
        rotate(this.currentVelocity.heading() + 90);
        scale(this.scale);
        image(this.img, 0,0);
        popMatrix();
    }
};

/**
 * Draw a velocity vector given the magnitude of the vector,
 * the projectile's current position, and the designated
 * color. Subscript parameter is optional: allows you to
 * label the vector as the x or y component of the velocity
 * vector.
 */
MonsterCannonBall.prototype.drawVelVect = function(position, velocity, color, subscript) {
        subscript = subscript || "";
        stroke(color);
        strokeWeight(2);
        var direction = velocity.heading();
        pushMatrix();
        // translate to the arrow head of the velocity vector
        translate(position.x+velocity.x,
                  position.y+velocity.y);

        // draw the line from the arrow head back to our MonsterCannonBall's position
        line(0,0,-velocity.x,-velocity.y);
        fill(color);
        textFont(SERIF_FONT,17);
        text("v", 8,-1);
        if (subscript !== "") {
            textFont(SERIF_FONT,13);
            text(subscript,14,3);
        }
        rotate(direction);
        line(0, 0, -5, -5);
        line(0, 0, -5, 5);
        popMatrix();
};

/**
 * Draw the parabola path of the projectile
 */
MonsterCannonBall.prototype.drawPath = function() {
    stroke(0);
    strokeWeight(1);
    stroke(0, 0, 0, 50);
    fill(255, 255, 255, 100);
    // incrementing by 2 because, we are using the x and y coordinate at the same time
    for (var i=0; i<this.pathPlot.length; i+=2) {
        ellipse(this.pathPlot[i],this.pathPlot[i+1],8,8);
    }
};

/**
 * If the "More Vectors" toggle is switched on, this will
 * display additional velocity vectors along the flight
 * path and their x and y components
 */
MonsterCannonBall.prototype.drawVectorPlot = function() {
    var PEAK_IDX = 2;

    for (var i=0; i<this.timePlots.length; i++) {
        // only display if the projectile has flown past that designated point in time
        if (this.flightTime >= this.timePlots[i].time) {
            var position = this.timePlots[i].pos;
            var velocity = this.timePlots[i].vel;

            // the color of each set of vectors should match the color of its row of data in drawFlightDataTable()
            var vectColor = this.mapColor(i);

            /*Do not draw x and y component for the vector
            at the peak of the path. In this case, the y
            component is 0 and the x component's direction
            and magnitude will be the same as the vector.*/
            if (i !== PEAK_IDX) {
                var velComponentX = new PVector(velocity.x,0);
                this.drawVelVect(position, velComponentX, vectColor,"x");

                var velComponentY = new PVector(0,velocity.y);
                this.drawVelVect(position, velComponentY, vectColor,"y");

                /*map() is being used here to make the angle
                arc more visible. The smaller the angle the
                farther away from the vertex it needs to be*/
                var angleArcRadius = map(abs(velocity.heading()), 15, 90, 50, 12.5);

                /*if the angle is too small, don't bother
                displaying because there is no room to fit
                theta also don't bother if either of the
                vector's lengths are too small to have room
                for an angle arc*/
                if (abs(velocity.heading()) >= 15  && angleArcRadius <= velocity.x - 5  &&
                    angleArcRadius <= velocity.mag() - 5)
                {
                    noFill();
                    stroke(vectColor);
                    // Checking to see if angle is negative which affects values of start and stop params of arc
                    if (velocity.heading() > 0) {
                        arc(position.x, position.y,
                        angleArcRadius*2, angleArcRadius*2,
                        0, velocity.heading());
                    }
                    else {
                        arc(position.x, position.y,
                        angleArcRadius*2, angleArcRadius*2,
                        velocity.heading(), 0);
                    }

                    // angleArcRadius+10 to display past arc
                    var thetaX = polarToCartesianX(
                                    position.x,
                                    angleArcRadius+10,
                                    velocity.heading()/2);
                    var thetaY = polarToCartesianY(
                                    position.y,
                                    angleArcRadius+10,
                                    velocity.heading()/2);
                    fill(vectColor);
                    textFont(SERIF_FONT, 15);
                    text("θ", thetaX, thetaY);
                }
            }

            this.drawVelVect(position, this.timePlots[i].vel.get(), vectColor,"");
            stroke(vectColor);
            strokeWeight(8);
            point(position.x,position.y); // put a large point to display position at the given time
        }
    }
};

/**
 * Draws the "Flight Data" table with the following metrics:
 * Δt: change in time from time of launch
 * vx: horizontal component of velocity vector
 * vy: vertical component of velocity vector
 * v: magnitude of the velocity vector
 * θ: the direction of the velocity vector
 * dx: horizontal displacement from the starting point
 * dy: vertical displacement from the starting point
 *
 * There will be 5 rows of data for the following points in
 * the journey: lift off, 1/4 of the trip,half of the trip,
 * 3/4 of the trip, and impact.
 */
MonsterCannonBall.prototype.drawFlightDataTable = function() {
    var ROW_WIDTH = 15;
    var COLUMN_WIDTH = 28;

    /*x and y coordinate of the intersection of the
    horizontal line at top sectioning of the column headers
    and the vertical line sectioning off the left most
    column*/
    var topLeftX = 200;
    var topLeftY = 48;

    if (state !== 'preLaunch') {  // only draw once the cannonball has been launched
        stroke(255);
        strokeWeight(1);
        rectMode(CORNER);
        fill(0,0,0,175);
        rect(topLeftX-6,topLeftY-37,209,122,10);

        var fields = ['Δt','vx','vy','v','θ','dx','dy'];
        var units = ['(s)','(m/s)','(m/s)','(m/s)','(deg)','(m)','(m)'];
        var subsFields = ['vx','vy','dy','dx'];  // designate which fields will be displayed with a subscript

        line(topLeftX,topLeftY,topLeftX+COLUMN_WIDTH*7,topLeftY);  // horizontal line border at top of table
        fill(255);
        for (var i=0; i<fields.length; i++) {
            if (i < fields.length -1) { // to avoid drawing a line after the last field
                line(topLeftX+COLUMN_WIDTH*(i+1),
                topLeftY-28, topLeftX+COLUMN_WIDTH*(i+1),
                topLeftY+75);
            }

            textFont(SERIF_FONT,13);
            textAlign(CENTER,BOTTOM);

            // x and y of the column heading labels
            var labelX = topLeftX + 13 + COLUMN_WIDTH*i;
            var labelY = topLeftY + -15;

            // see if the field label has a subscript
            if (subsFields.indexOf(fields[i]) > -1) {
                // convert to a String object which has useful functions like substring() associated with it
                var field = String(fields[i]);

                // display everything except last char which will be subscript
                text(field.substring(0,field.length-1), labelX, labelY);

                textFont(SERIF_FONT,10);
                // display subscript
                text(field.charAt(field.length-1), labelX + textWidth(field) + -4, labelY+2);
            }
            else {
                text(fields[i], labelX, labelY);
            }

            // display the units for each column
            var unitX = labelX;
            var unitY = labelY + 13;
            textFont(SERIF_FONT, 11);
            text(units[i], unitX + 2, unitY);
        }

        var dataX = topLeftX + 15;
        var dataY = topLeftY + 17;

        /*display rows of data as the projectile reaches the
        pre-designated points in time stored in the
        timePlots*/
        for (var i=0; i<this.timePlots.length; i++) {
            if (this.flightTime >= this.timePlots[i].time) {
                var t = roundToDecimal(this.timePlots[i].time, 2);
                // need to convert velocities back to m/s
                var vX = roundToDecimal(this.timePlots[i].vel.x / PIXELS_PER_METER, 1);
                var vY = roundToDecimal(-this.timePlots[i].vel.y / PIXELS_PER_METER, 1);
                var v = roundToDecimal(this.timePlots[i].vel.mag() / PIXELS_PER_METER, 1);

                var ang = roundToDecimal(-this.timePlots[i].vel.heading(),1);
                var dx = roundToDecimal((this.timePlots[i].pos.x - this.initialPostion.x) / PIXELS_PER_METER, 1);
                var dY = roundToDecimal((this.initialPostion.y - this.timePlots[i].pos.y) / PIXELS_PER_METER, 1);

                if (i === 2) {
                    // displaying this row in red which doesn't display as clearly so increasing font size slightly
                    textFont(SERIF_FONT, 13);
                }
                else {
                    textFont(SERIF_FONT, 12);
                }

                // the color of each row should match the color of the corresponding vector
                fill(this.mapColor(i));
                text(String(t), dataX, dataY+i*ROW_WIDTH);
                text(String(vX), dataX + COLUMN_WIDTH, dataY+i*ROW_WIDTH);
                text(String(vY), dataX + COLUMN_WIDTH*2, dataY+i*ROW_WIDTH);
                text(String(v), dataX + COLUMN_WIDTH*3, dataY+i*ROW_WIDTH);
                text(String(ang), dataX + COLUMN_WIDTH*4, dataY+i*ROW_WIDTH);
                text(String(dx), dataX + COLUMN_WIDTH*5, dataY+i*ROW_WIDTH);
                text(String(dY), dataX + COLUMN_WIDTH*6, dataY+i*ROW_WIDTH);
            }
        }
    }
};

/**
 * Makes sure that the colors for "Flight Data" rows and
 * additional velocity vectors made visibile by "More
 * Vectors" correspond with each other
 */
MonsterCannonBall.prototype.mapColor = function(idx) {
    var colorIndexMap = {
        0: YELLOW,
        1: GREEN,
        2: RED,
        3: GREEN,
        4: YELLOW
    };

    return colorIndexMap[idx];
};
/********** CANNONBALL DISPLAY FUNCTIONS **********/
/********** END MONSTERCANNONBALL - THE PROJECTILE! **********/



/********** CANNON **********/
/**
 * An object to display a cannon and to change the angle of
 * the barrel as needed.
 **/
var Cannon = function(config) {
    this.x = config.x || 200;
    this.y = config.y || 200;
    this.scale = config.sc || 1;
    this.angle = config.ang || 0;
};

Cannon.prototype.getPosition = function() {
    var position = new PVector(this.x, this.y);
    return position.get();
};

Cannon.prototype.setAngle = function(a) {
    this.angle = a;
};

var drawCannonBarrel = function(cannon) {
    pushMatrix();
    translate(cannon.x,cannon.y);
    scale(cannon.scale);
    rotate(cannon.angle);

    // set color and turn off stroke
    var cValue = 175;
    fill(cValue);
    noStroke();

    var length = 60;
    var cannonLeft = -length/4;
    var cannonRight = length/4 * 3;
    var width = 20;

    // draw a series of closely bunched ellipses from left to
    // right of decreasing width to achieve tapering
    // as we approach the opening of the barrel
    for (var i=0; i<=length; i++){
        width -= 0.1;
        ellipse(cannonLeft+i, 0, 5, width);
    }
    // rectangle on the opening side of the barrel to give a straight edge
    rectMode(CENTER);
    rect(cannonRight, 0, 5, width);

    // the cascable (knob) on the left side of the cannon
    ellipse(cannonLeft - 4, 0 ,6, 10);
    popMatrix();
};

var drawCannonWheelAndTrail = function(cannon) {
    pushMatrix();
    translate(cannon.x,cannon.y);
    scale(cannon.scale);

    /** Draw the wheel first **/
    var outerDiam = 22;
    var innerDiam = 6;
    var wheelCX = 5;
    var wheelCY = 11;
    var r = outerDiam / 2;

    // Hub of wheel
    stroke(0, 0, 0);
    strokeWeight(1);
    ellipse(wheelCX,wheelCY,innerDiam,innerDiam);

    // Wheel spokes
    for (var angle=0; angle<=360; angle+=30) {
        var spokeX = polarToCartesianX(wheelCX,r,angle);
        var spokeY = polarToCartesianY(wheelCY,r,angle);
        line(wheelCX,wheelCY,spokeX,spokeY);
    }

    // Tire
    noFill();
    strokeWeight(2);
    ellipse(wheelCX,wheelCY,outerDiam,outerDiam);

    // Trail
    fill(0, 0, 0);
    noStroke();
    beginShape();
    vertex(wheelCX,wheelCY-11);
    vertex(wheelCX,wheelCY);
    vertex(-20,wheelCY+r);
    vertex(-45, wheelCY+r);
    vertex(-45, wheelCY+r-1);
    vertex(-20, wheelCY+r-1);
    endShape(CLOSE);

    popMatrix();
};

/**
 * Draws cannon. Found that having a display function that is
 * not part of the object allows you to change configurations
 * in the object instantiation without causing a "String is
 * not a Function"exception
 */
var drawCannon = function(cannon) {
    drawCannonBarrel(cannon);
    drawCannonWheelAndTrail(cannon);
};
/********** CANNON **********/


/********** POOL **********/
var Pool = function(config) {
    this.x = config.x || 200;
    this.y = config.y || 200;
    this.w = config.w || 100;
    this.h = config.h || 50;

    // the top of the pool has 2 octagons, these 2 fields store the vertices for each octagon
    this.outerOctVerts = getOctagonVertices(this.x,this.y,this.w,this.h);
    this.innerOctVerts = getOctagonVertices(this.x,this.y,this.w-8,this.h-6);
};

Pool.prototype.getPosition = function() {
    var position = new PVector(this.x, this.y);
    return position.get();
};

Pool.prototype.getWidth = function() {
    return this.w;
};

/**
 * Shift the pool a new random displacement away from the
 * cannon.
 */
Pool.prototype.shiftPool = function() {
    this.x = STARTING_X + getRandomDisplacement() * PIXELS_PER_METER;
    this.outerOctVerts = getOctagonVertices(this.x,this.y,this.w,this.h);
    this.innerOctVerts = getOctagonVertices(this.x,this.y,this.w-8,this.h-6);
};

var drawPool = function(pool) {
    fill(184,134,11);
    noStroke();

    // left and right wood panels of base
    quad(pool.outerOctVerts.xLeftOuter,
         pool.outerOctVerts.yBottomInner,
         pool.outerOctVerts.xLeftInner,
         pool.outerOctVerts.yBottomOuter,
         pool.outerOctVerts.xLeftInner,
         pool.outerOctVerts.yBottomOuter + 14,
         pool.outerOctVerts.xLeftOuter,
         pool.outerOctVerts.yBottomInner + 15);
    quad(pool.outerOctVerts.xRightOuter,
         pool.outerOctVerts.yBottomInner,
         pool.outerOctVerts.xRightInner,
         pool.outerOctVerts.yBottomOuter,
         pool.outerOctVerts.xRightInner,
         pool.outerOctVerts.yBottomOuter + 14,
         pool.outerOctVerts.xRightOuter,
         pool.outerOctVerts.yBottomInner + 15);

    // center panel of base
    rectMode(CORNERS);
    rect(pool.outerOctVerts.xLeftInner,
         pool.outerOctVerts.yBottomOuter,
         pool.outerOctVerts.xRightInner,
         pool.outerOctVerts.yBottomOuter + 14);

    // lines to illustrate rows of wood paneling
    stroke(0, 0, 0);
    strokeWeight(0.5);
    for (var i=1; i<4; i++) {
        line(pool.outerOctVerts.xLeftOuter,
             pool.outerOctVerts.yBottomInner+4*i,
             pool.outerOctVerts.xLeftInner,
             pool.outerOctVerts.yBottomOuter+4*i);
        line(pool.outerOctVerts.xLeftInner,
             pool.outerOctVerts.yBottomOuter+4*i,
             pool.outerOctVerts.xRightInner,
             pool.outerOctVerts.yBottomOuter+4*i);
        line(pool.outerOctVerts.xRightInner,
             pool.outerOctVerts.yBottomOuter+4*i,
             pool.outerOctVerts.xRightOuter,
             pool.outerOctVerts.yBottomInner+4*i);
    }

    // outer wooden octagonal frame on top of pool
    drawOctagon(pool.x,pool.y,pool.w,pool.h);

    // vertical posts on base
    rectMode(CORNER);
    rect(pool.outerOctVerts.xLeftInner - 2,
         pool.outerOctVerts.yBottomOuter, 3, 13);
    rect(pool.outerOctVerts.xRightInner - 2,
         pool.outerOctVerts.yBottomOuter, 3, 13);
    rect(pool.outerOctVerts.xLeftOuter - 1,
         pool.outerOctVerts.yBottomInner + 1, 3, 13);
    rect(pool.outerOctVerts.xRightOuter - 3,
         pool.outerOctVerts.yBottomInner + 1, 3, 13);

    // water
    fill(56,176,222);
    drawOctagon(pool.x,pool.y,pool.w-8,pool.h-6);

    // water ripples
    stroke(0, 0, 0);
    strokeWeight(0.07);
    arc(pool.outerOctVerts.xLeftInner+4,
        pool.outerOctVerts.yTopInner+2,8,3,-180,0);
    arc(pool.outerOctVerts.xLeftInner+11,
        pool.outerOctVerts.yTopInner,8,3,60,125);

    arc(pool.outerOctVerts.xRightInner-1,
        pool.outerOctVerts.yTopInner+6,8,3,-120,0);
    arc(pool.outerOctVerts.xRightInner-6,
        pool.outerOctVerts.yTopInner+6,8,3,-120,0);

    arc(pool.outerOctVerts.xLeftOuter+14,
        pool.outerOctVerts.yBottomInner-3,8,3,22,160);
    arc(pool.outerOctVerts.xLeftOuter+20,
        pool.outerOctVerts.yBottomInner,8,3,-160,-53);
};
/********** POOL **********/


/********** DROPS AND SPLASHES **********/
/**
 * The Drop, JetDrop and Splash objects come from the
 * Particle Systems section of the Advanced JS: Natural
 * Simulation courses:
 * https://www.khanacademy.org/computing/cs/programming-natural-simulations/programming-particle-systems/a/intro-to-particle-systems
 *
 * They will be used to simulate a splash if our projectile
 * hits the target: the pool. Unlike the code for the
 * MonsterCannonBall object, the code used to simulate
 * gravity and it's affect on the acceleration and velocity
 * over time on the Drops does not use kinematics equations.
 * Rather it is based off of Newton's Laws of Motion and
 * the important equation: F = ma.  To understand further,
 * check out the above link and this:
 * https://www.khanacademy.org/computing/cs/programming-natural-simulations/programming-forces/a/newtons-laws-of-motion
**/

/**
 * There are two different parts to a splash.  The first is a
 * ring of water called the radial jet that forms around the
 * object and moves up and out from the splash center.  The
 * second part is the jet which is a stream of water that
 * shoots straight up at a much higher velocity than the
 * original ring splash. You can learn more here:
 * http://www.popularmechanics.com/outdoors/sports/physics/anatomy-of-a-splash-photo-gallery#slide-1
 *
 * The Drop object will be used to simulate the radial splash (ring of water
 * around the splash center).
 * */
var Drop = function(position) {
    this.acceleration = new PVector(0, 0);

    /*give the drop a random velocity in the x direction
    to simulate water fanning out from impact of the
    projectile with the water*/
    var velocityX = random(-0.2,0.2);
    var velocityY = -0.6;
    this.velocity = new PVector(velocityX,velocityY);

    this.position = position.get(); // will pass in a postion from Splash Particle System
    this.timeToLive = 255.0; // used to give drops fading away look as the water disperses more
    this.mass = 8; // used to change Drop size and change affect of gravity
};

Drop.prototype.run = function() {
    this.update();
    this.display();
};

/**
 * This applies a force to the acceleration of the Drop
 **/
Drop.prototype.applyForce = function(force) {

    /*since the force parameter is a PVector, we need to make a copy of force
    using get() so any operations we do to the force only apply in the moment
    and not permanently*/
    var f = force.get();

    /*Based off Newton's 2nd Law: F=ma. Mass is inverserly
    proportional to Force so we divide the force by the
    mass of the Drop*/
    f.div(this.mass);
    this.acceleration.add(f); // apply the force to the Drop's acceleration
};

/**
 * Update the velocity based on the Drop's current
 * acceleration due to forces acting on the Drop
 **/
Drop.prototype.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // clear acceleration so any forces acting on it are treated cumulatively
    this.timeToLive -= 3;  // simulates the drops dispersing even further
};

/**
 * Remove any Drops from the Particle System that have
 * surpassed their time to live.
 **/
Drop.prototype.isDead = function(){
    if (this.timeToLive < 0) {
        return true;
    } else {
        return false;
    }
};

Drop.prototype.display = function() {
    stroke(0,127,255,this.timeToLive);
    strokeWeight(0.3);
    fill(56,176,222, this.timeToLive);
    ellipse(this.position.x, this.position.y, this.mass/1.5, this.mass);
};

/**
 * JetDrop inherits from the Drop object and is used to
 * simulate the jet which shoots straight up in the air in
 * real life.
 * */
var JetDrop = function(position) {
    Drop.call(this,position); // making call to Drop constructor

    var velocityX = 0; // no x direction because we want the drop to go straight up and down
    var velocityY = -0.9;
    this.velocity = new PVector(velocityX, velocityY);
};

// Necessary to inherit Drop functionality
JetDrop.prototype = Object.create(Drop.prototype);
JetDrop.prototype.constructor = JetDrop;


/**
 * Splash object instantiates a system of Drops and JetDrops
 * and sets them in motion to simulate what happens when our
 * MonsterCannonBall hits the pool.
 **/
var Splash = function(position) {
    this.origin = position || new PVector(0,0);
    this.drops = [];
    this.radialDropCount = 0;
    this.jetDropCount = 0;
};

/**
 * This is called when the cannonball hits the pool. The x
 * and y parameters are the coordinates of where this event
 * occurred and makes that position the center of the splash.
 * It also gives the Drop counts non-zero numbers so Drops
 * are added to the system.
**/
Splash.prototype.setSplash = function(x,y) {
    this.origin.set(x,y);
    this.radialDropCount = 50;
    this.jetDropCount = 50;
};

Splash.prototype.addDrop = function() {
    // First we add Drop objects for the radial part of the splash
    if (this.radialDropCount > 0) {
        this.drops.push(new Drop(this.origin));
        this.radialDropCount--;
    }

    /*the addition of JetDrops is delayed because in reality
    the jet shoots out of the surface of the water moments
    after the radial splash occurs*/
    if (this.radialDropCount < 5 && this.jetDropCount > 0)
    {
        this.drops.push(new JetDrop(this.origin));
        this.jetDropCount--;
    }
};

Splash.prototype.applyForce = function(f) {
    for(var i = 0; i < this.drops.length; i++){
        this.drops[i].applyForce(f);
    }
};

Splash.prototype.applyGravity = function() {
    /*/This value was picked kind of arbitrarily
    through trial and error to make the splash look as
    lifelike as possible*/
    var gravityAccel = new PVector(0, 0.02);

    for(var i = 0; i < this.drops.length; i++) {
        var particleGForce = gravityAccel.get();
        particleGForce.mult(this.drops[i].mass);

        this.drops[i].applyForce(particleGForce);
    }
};

Splash.prototype.run = function(){
	for (var i = this.drops.length-1; i >= 0; i--) {
        var d = this.drops[i];
        d.run();
        if (d.isDead()) {
            this.drops.splice(i, 1); // removes objects from the array
        }
    }
};
/********** DROPS AND SPLASHES **********/



/*******************CONTROLS****************************/

/**
 * The AngleSetter is a UI element used to set the angle of
 * the cannon's barrel with the ground.This will also set the
 * direction of the velocity when the MonsterCannonBall is
 * FIREd.
 **/
var Anglesetter = function(config) {
    // x and y are the origin of the x and y axis and the base of the lever
    this.x = config.x || 200;
    this.y = config.y || 200;

    this.scale = config.sc || 1;
    this.angle = config.ang || 45;

    // the line and circle represent a draggable lever used to set angle
    this.leverSize = config.leverSize || 50;
    this.lever = new PVector(this.leverSize,0);
    this.lever.rotate(this.angle);
    this.knobSize = config.knobSize || 10;  // circle diameter at end of lever

    this.draggable = false;  // will only be able to move the lever when this is true
};

Anglesetter.prototype.getAngle = function() {
    return this.angle;
};

Anglesetter.prototype.getDraggable = function() {
    return this.draggable;
};

Anglesetter.prototype.setDraggable = function() {
    this.draggable = true;
};

Anglesetter.prototype.setUndraggable = function() {
    this.draggable = false;
};

Anglesetter.prototype.mouseOverKnob = function() {
    var d = dist(mouseX, mouseY,this.lever.x + this.x,
                 this.lever.y + this.y);
    return d <= this.knobSize / 2;
};

/**
 * Move the lever based on where the use drags the leverknob
 * with the mouse, and stores angle value based on the
 * lever's current position
 **/
Anglesetter.prototype.moveLever = function() {
    if (this.draggable) {
        /* mouseX and mouseY are returning values based on
        where the mouse is relative to the canvas
        origin. In order to figure out the angle of
        where the lever's knob is relative to the
        AngleSetter's origin, we need to translate the
        AngleSetter's origin to the canvas's origin.*/
        var xFromASOrigin = mouseX - this.x;
        var yFromASOrigin = mouseY - this.y;

        translate(0,0);
        // use TOA in SohCahToa to calculate the angle
        // t = tan
        // o = opposite: yFromOrigin
        // a = adjacent: xFromOrigin
        this.angle = round(atan2(yFromASOrigin,
                                 xFromASOrigin));

        /*in the cases where the mouse is moved outside the
        range of angles (0 to 90 degrees), set the angle to
        the appropriate boundary*/
        if (this.angle < -90) {
            this.angle = -90;
        }
        else if (this.angle > 0) {
            this.angle = 0;
        }

        /*Found most straightforward (less buggy)way to set
        the position of the lever is to move it back to the
        lowest point of 0° and then set the new angle*/
        this.lever.set(this.leverSize,0);
        this.lever.rotate(this.angle);
    }
};

var drawAngleSetter = function(as) {
    pushMatrix();
    translate(as.x,as.y);
    scale(as.scale);

    stroke(0, 0, 0);
    strokeWeight(1);
    line(0,0,as.leverSize,0); // x axis
    line(0,0,0,-as.leverSize); // y axis

    line(-2,-as.leverSize,2,-as.leverSize); // axis ends
    line(as.leverSize,-2,as.leverSize,2);

    // arc to visualize magnitude of angle
    noFill();
    stroke(255, 0, 0);
    arc(0, 0, as.leverSize, as.leverSize, as.angle, 0);

    // draw the lever
    strokeWeight(1.5);
    stroke(0, 0, 255);
    line(0,0,as.lever.x, as.lever.y);

    // change color of knob if the mouse is over it or if lever is draggable
    if (as.mouseOverKnob() || as.draggable) {
        fill(255, 255, 0);
    }
    else {
        fill(0, 255, 0);
    }

    // draw knob
    strokeWeight(0.6);
    ellipse(as.lever.x, as.lever.y, as.knobSize, as.knobSize);
    popMatrix();

    // label and angle value
    textFont(SERIF_FONT,12);
    textAlign(RIGHT,CENTER);
    fill(0, 0, 0);
    text("Cannon\nAngle", as.x+36, as.y + 16);
    textAlign(LEFT,CENTER);
    textFont(SERIF_FONT,12);
    var angleValue = round(-as.getAngle());
    text("=  " + angleValue + "°",as.x+43,as.y+ 16);
};


/**
 * A UI element that allows the user to change a value based
 * on how far she moves the handle from the left of the
 * slider. Slider code originally seen here: https://www.khanacademy.org/computing/computer-science/cryptography/comp-number-theory/p/prime-density-spiral
 **/
var Slider = function(config) {
    // x is the left most point of the Slider
    this.x = config.x || 200;
    this.y = config.y || 200;
    this.width = config.w || 50;
    this.handleWidth = config.handleWidth || 10;

    // set the min values and max values the slider can return
    this.minValue = config.minValue || 0;
    this.maxValue = config.maxValue || 50;

    this.handle = config.x; // have the handle start on the left
};

/**
 * Returns a value based on the distance the handle is from
 * the left side of the Slider. Maps the distance to a value
 * ranging from the configured min and max values
 **/
Slider.prototype.getValue = function() {
    var val = map(this.handle - this.x, 0, this.width, this.minValue, this.maxValue);
    return roundToDecimal(val,1);
};

/**
 * Returns true if the mouse is over the handle.
 **/
Slider.prototype.mouseOver = function() {
    if (mouseX >= this.x - this.handleWidth/2 &&  // case where handle is all way to the left
        mouseX <= this.x + this.width + this.handleWidth/2 && // case where handle is all the way to the right
        mouseY > this.y - 7 && mouseY < this.y + 10) { // case where user click above slider bar but same y as handle
        return true;
    }
};

/**
 * Based on where the user clicks on the slider or drags
 * the handle, sets the x value of the slider. Deals with
 * the case where the user leaves the boundaries of the
 * slider and is still holding the mouse
 **/
Slider.prototype.setHandle = function() {
    if (this.draggable) {
        if (mouseX < this.x) {
            this.handle = this.x;
        }
        else if (mouseX > this.x + this.width) {
            this.handle = this.x + this.width;
        }
        else {
            this.handle = mouseX;
        }
    }
};

Slider.prototype.setDraggable = function() {
    this.draggable = true;
};

Slider.prototype.setUndraggable = function() {
    this.draggable = false;
};

var drawSlider = function(slider) {
    stroke(0, 0, 0);
    strokeWeight(1);
    fill(240, 240, 250);

    // the horizontal guide of the slider
    rectMode(CORNER);
    rect(slider.x, slider.y, slider.width, 3, 4);
    stroke(160, 160, 160);
    line(slider.x + 1, slider.y, slider.x + slider.width - 2,
         slider.y);


    // draws handle. It's position on the slider is dependent
    // on what happens in setHandle().
    fill(180, 180, 180);
    stroke(50, 50, 50);
    rectMode(CENTER);
    rect(slider.handle, slider.y + 0.5, 10, 16, 3);
    line(slider.handle - 3,
         slider.y - 2,
         slider.handle + 3,
         slider.y - 2);
    line(slider.handle - 3,
         slider.y + 1,
         slider.handle + 3,
         slider.y+1);
    line(slider.handle - 3,
         slider.y + 4,
         slider.handle + 3,
         slider.y + 4);

    // label and value display
    fill(0, 0, 0);
    textAlign(RIGHT, BOTTOM);
    textFont(SERIF_FONT,12);
    text("Initial\nVelocity", slider.x + 32, slider.y + 38);
    textFont(SERIF_FONT,12);
    textAlign(LEFT,CENTER);
    text("= "+ slider.getValue() + " m/s", slider.x + 35, slider.y + 24);
};


/**
 * The Toggle UI element acts as an On/Off switch
 **/
var Toggle = function(config) {
    this.x = config.x || 200;
    this.y = config.y || 200;
    this.width = config.width || 50;
    this.height = config.height || 25;
    this.label = config.label || "Toggler";
    this.labelRightOffset = config.labelRightOffset || 0;
    this.handleDiam = this.height * 1.10;

    this.on = config.switchedOn;
    if (this.on) {
        this.handleX = this.x-this.width/2 + 5;
    }
    else {
        this.handleX = this.x+this.width/2 - 5;
    }
};

Toggle.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;

    if (this.on) {
        this.handleX = this.x-this.width/2 + 5;
    }
    else {
        this.handleX = this.x+this.width/2 - 5;
    }
};

Toggle.prototype.handleMouseClick = function() {
    if (this.checkClickedOn()) {
        this.switchState();
    }
};

/**
 * This checks if the user clicks on any part of the toggle
 **/
Toggle.prototype.checkClickedOn = function() {
    // check if the user clicked on any part of the slide
    if (mouseX >= this.x-this.width/2 && mouseX <= this.x+this.width/2 &&
        mouseY >= this.y-this.height/2 && mouseY <= this.y+this.height/2) {
        return true;
    }

    // check to see if they clicked on the circular knob
    var distance = dist(mouseX, mouseY, this.handleX,
                        this.y);
    if (distance <= this.handleDiam/2){
        return true;
    }

    return false;
};

Toggle.prototype.switchState = function() {
    if (this.on) {
        this.switchOff();
    }
    else {
        this.switchOn();
    }
};

Toggle.prototype.switchOff = function() {
    this.on = false;
    this.handleX = this.x+this.width/2 - 5;
};

Toggle.prototype.switchOn = function() {
    this.on = true;
    this.handleX = this.x-this.width/2 + 5;
};

Toggle.prototype.isOn = function() {
    if (this.on) {
        return true;
    }
    else {
        return false;
    }
};

var drawToggle = function(toggle) {
    /*based the on state, set the text and color to display
    ON: text: "ON", backgroundColor: Green
    OFF: text: "OFF", backgroundColor: Red*/
    var stateDisplayFn;
    if (toggle.on) {
        stateDisplayFn = function() {text("ON", toggle.x + 7, toggle.y);};
        fill(102,205,0);
    }
    else {
        stateDisplayFn = function() {text("OFF", toggle.x + -7, toggle.y);};
        fill(255,51,51);
    }

    // draw main rectangle with rounded corners with fill color designated above
    stroke(1.0);
    strokeWeight(0);
    stroke(50, 50, 50);
    rectMode(CENTER);
    rect(toggle.x, toggle.y, toggle.width, toggle.height, 20);

    // display state text based on configuration above
    textAlign(CENTER, CENTER);
    var f = createFont("arial-black");
    textFont(f, 9);
    fill(0, 0, 0, 150);
    stateDisplayFn();

    // draw switch
    fill(250, 250, 250);
    ellipse(toggle.handleX, toggle.y, toggle.handleDiam, toggle.handleDiam);
    stroke(255, 0, 0);

    // display label text
    textAlign(RIGHT, CENTER);
    textFont(SERIF_FONT, 12);
    fill(0, 0, 0);
    var l = toggle.label;
    for (var i=0; i<toggle.labelRightOffset; i++) {
        l = l + " ";
    }
    text(l,toggle.x + 19,toggle.y + -23);
};


/**
 * Simple Button UI element with a few hover, click, and
 * press features. Based off of:
 * https://www.khanacademy.org/computing/cs/programming-games-visualizations/programming-buttons/a/what-are-buttons
 **/
var Button = function(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.txtSize = config.txtSize || 19;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.label = config.label || "Click";
    this.inactiveColor = config.inactiveColor || color(255, 255, 255, 0);
    this.pressedColor = config.pressedColor || color(255, 255, 255, 0);
    this.textColor = config.textColor || color(0, 0, 0);
    this.strokeColor = config.strokeColor || color(0, 0, 0);
    this.onClick = config.onClick || function() {};
};

Button.prototype.isMouseOver = function() {
    return mouseX > (this.x - this.width/2) &&
           mouseX < (this.x + this.width/2) &&
           mouseY > (this.y - this.height/2) &&
           mouseY < (this.y + this.height/2);
};

Button.prototype.handleMouseClick = function(onClick) {
    if (this.isMouseOver()) {
        onClick();
    }
};

var displayButton = function(button) {
    var buttonColor = color(button.inactiveColor);

    if (button.isMouseOver()) {
        /*when the user holds press on button, it will darken
        the color and shrink the text size to standard size
        to contrast text increase on hover*/
        if (mouseIsPressed) {
            textSize(button.txtSize);
            buttonColor = color(button.pressedColor);
        } else {
            textSize(button.txtSize + 1); // increase text size on hover
        }
    } else {
        textSize(button.txtSize);
    }

    fill(buttonColor);
    rectMode(CENTER);
    stroke(button.strokeColor);
    strokeWeight(1);
    rect(button.x, button.y, button.width, button.height, 5);

    fill(button.textColor);
    textAlign(CENTER,CENTER);
    text(button.label, button.x, button.y);
};

/************ INSTANTIATE EVERYTHING ***********/
var cannonball = new MonsterCannonBall({
    x: STARTING_X,
    y: STARTING_Y,
    sc: 0.18,
});

var cannon = new Cannon({
    x: STARTING_X,
    y: STARTING_Y,
    sc: 0.91
});

var pool = new Pool({
    // places the pool a random displacement to the right of the cannon
    x: STARTING_X + getRandomDisplacement() * PIXELS_PER_METER,

    // moving the pool a little down from the starting y position makes it easier to simulate the projectile diving into the pool
    y: STARTING_Y+6,

    w: 42,
    h: 25
});

var splash = new Splash();

var angleLever = new Anglesetter({
    x: width - 200,  // width is a process.js global variable for the width of the canvas
    y: 83,
    leverSize: 62,
    knobSize: 10,
    ang: STARTING_ANGLE,
});

var velocitySlider = new Slider({
    x: width - 200,
    y: 147,
    w: 79,
    minValue: 15,
    maxValue: 20,
});

/**
 * Toggle to control display of the Flight Data
 * MonsterCannonBall.prototype.drawFlightDataTable will be
 * tied to this.
**/
var dataToggle = new Toggle({
    x: 350,
    y: 49,
    width: 40,
    height: 20,
    switchedOn: false,
    label: "Flight Data:",
    labelRightOffset: 5
});

/**
 * Toggle to control display of projectile velocity vectors
 * MonsterCannonBall.prototype.drawVectorPlot will be tied to
 * this
**/
var vectorToggle = new Toggle({
    x: 350,
    y: 114,
    width: 40,
    height: 20,
    switchedOn: false,
    label: "More Vectors:",
    labelRightOffset: 0
});

var fireButton = new Button({
    x: width - 62,
    y: 168,
    txtSize: 16,
    width: 80,
    height: 29,
    label: "FIRE",
    inactiveColor: color(227, 20, 31),
    pressedColor: color(207, 20, 31),
    textColor: color(255, 255, 255),
    strokeColor: color(255,255,255,0),
});

var resetButton = new Button({
    x: width - 45,
    y: 143,
    txtSize: 12,
    width: 45,
    height: 22,
    label: "RESET",
    inactiveColor: color(227, 20, 31),
    pressedColor: color(207, 20, 31),
    textColor: color(255, 255, 255),
    strokeColor: color(255,255,255,0),
});
/************ INSTANTIATE EVERYTHING ***********/



var drawControlsBox = function() {
/**
 * This displays three different windows depending on the
 * state of the game (preLaunch, success, failure)
 * that provide instructions and controls to the user.
 **/

    // General configurations for all 3 windows
    var displayX, displayY, displayW, displayH;
    stroke(0, 0, 0);
    strokeWeight(1);
    rectMode(CORNER);
    fill(255, 255, 255, 100);

    if (state === "preLaunch") {
        displayY = 10; displayW = 380; displayH = 188;
        displayX = width - displayW - 12;
        rect(displayX,displayY,displayW,displayH,10);

        // Line borders to divide up the controls
        var halfBorderX = width - 212;
        line(halfBorderX, displayY + 5, halfBorderX, displayY + displayH - 5);

        var quarterBorderX = width - 111;
        line(quarterBorderX, 15, quarterBorderX, 192);

        var angVelBorderY = 125;
        line(halfBorderX + 5, angVelBorderY, quarterBorderX - 5, angVelBorderY);

        var toggleBorderY = 75;
        line(quarterBorderX + 5, toggleBorderY, displayX + displayW - 5, toggleBorderY);

        var buttonBorderY = 138;
        line(quarterBorderX + 5, buttonBorderY, displayX + displayW - 5, buttonBorderY);


        /*each state of the game has a different character
        speak to the user this sets the appropriate image for
        that the preLaunch character*/
        imageMode(CENTER);
        var icon = getImage("creatures/Hopper-Happy");
        image(icon,width - 371, displayY + 20, 23, 26);

        // in the preLaunch state, we want to give the user general instructions about the game
        textAlign(LEFT,CENTER);
        textFont(SERIF_FONT,13);
        fill(0, 0, 0);
        var textYStart = 23;
        var textYOffset = 16;

        var textXNearIcon = width - 350;
        text("Test your knowledge of " , textXNearIcon, textYStart);
        text("projectile motion. See if" , textXNearIcon, textYStart + textYOffset);

        var textXBelowIcon = width - 385;
        text("you can shoot The Magnificent" , textXBelowIcon, textYStart + textYOffset * 2);
        text("Monster Cannonball Old Spice" , textXBelowIcon, textYStart + textYOffset * 3);
        text("Man into the pool in one shot by" , textXBelowIcon, textYStart + textYOffset * 4);
        text("correctly setting the angle of the" , textXBelowIcon, textYStart + textYOffset * 5);
        text("cannon and Old Spice Man's" , textXBelowIcon, textYStart + textYOffset * 6);
        text("initial velocity from the cannon." , textXBelowIcon, textYStart + textYOffset * 7);
        fill(0, 0, 255);
        text("Note: The force due to air\n          resistance can be ignored." , textXBelowIcon,
                textYStart + textYOffset * 8 + 24);

        // our various controls
        velocitySlider.setHandle();
        drawSlider(velocitySlider);

        angleLever.moveLever();
        drawAngleSetter(angleLever);

        dataToggle.setPosition(width-45,49);
        drawToggle(dataToggle);

        vectorToggle.setPosition(width-45,114);
        drawToggle(vectorToggle);

        displayButton(fireButton);
    }

    else if (state === 'success'  || state === 'fail') {
        // success and fail state have the same dimensions and postion for their respective windows
        displayY = 10; displayW = 173; displayH = 152;
        displayX = width - displayW - 12;
        rect(displayX,displayY,displayW,displayH,10);

        textAlign(LEFT, CENTER);
        /*window is semi-transparent. any drawings behind the
        window can make text hard to read. Veered from
        serif Font and used arial-black because it was easier
        to read*/
        textFont("arial-black",15);
        fill(0);
        if (state === 'success') {
            text("Victory!", displayX + 34, displayY + 17);
            textFont("arial-black",12);
            text("Mr. Spice is swimming\nin your success!",
                 displayX + 34, displayY + 45);

            // happy character for success
            var icon = getImage("creatures/Hopper-Jumping");
            image(icon, displayX + 18, displayY + 21, 20, 26);
        }
        else if (state === 'fail') {
            fill(0, 0, 0);
            text("Ouch!", displayX + 34, displayY + 17);
            textFont("arial-black",12);
            text("You missed the pool.\nWhy don't you try again?", displayX + 34, displayY + 43);

            // Bring back Old Spice Man's abrasive face to tell the user they failed
            var icon = getImage("avatars/old-spice-man");
            image(icon, displayX + 19, displayY + 21, 26, 24);
        }

        // more borders to section off text and controls
        var messageBorderY = 70;
        line(displayX + 5, messageBorderY, displayX + displayW -5, messageBorderY);

        var toggleBottomBorder = 125;
        line(displayX + 5, toggleBottomBorder, displayX + displayW - 5, toggleBottomBorder);

        var toggleBorderX = displayX + displayW/2;
        line(toggleBorderX, messageBorderY + 5, toggleBorderX, toggleBottomBorder - 5);

        // controls available in success and failure state
        drawToggle(dataToggle);
        drawToggle(vectorToggle);
        displayButton(resetButton);
    }
};
/******************* CONTROLS ****************************/



/******************* GAME STATE FUNCTIONS *******************/
var launch = function() {
// Will be called when FIRE button is pressed
    state = "launched";
    cannonball.fire(velocitySlider.getValue(), angleLever.getAngle());
};

var reset = function() {
// Will be called when RESET button is pressed
    state = "preLaunch";
    cannonball.reset();

    pool.shiftPool();
};

/**
 * Once the MonsterCannonBall is fired, this will check where
 * it is in its flight. Once the flight has ended, check
 * whether the cannonball hit the pool and update the game
 * state appropriately
 **/
var updateGameState = function() {
    var cbPos = cannonball.getPosition();
    var poolPos = pool.getPosition();
    var poolWidth = pool.getWidth();

    // only want to make the necessary checks once the flight has ended
    if (state === "launched" && cannonball.flightEnded()) {
        // shifting toggles for new control box size and position
        dataToggle.setPosition(width - 126, 106);
        vectorToggle.setPosition(width - 42, 106);
        debug("Actual Flight Time:", millis()/1000 - cannonball.startTime);

        // PoolWidth/2 + 10 and poolWidth/2 - 10 are used to shrink the target a bit to not make the game too easy.
        if (cbPos.x >= poolPos.x - poolWidth/2 + 10 &&
            cbPos.x <= poolPos.x + poolWidth/2 - 10)
        {
            // We hide the cannonball to make it look like it went underwater
            cannonball.hideCannonBall();
            splash.setSplash(cbPos.x, poolPos.y); // set splash where the cannonball hit the water
            state = "success";
        }
        else {
            state = "fail";
        }
    }
};
/******************* GAME STATE FUNCTIONS *******************/


/******************* DRAW FUNCTIONS *******************/
var drawBackground = function() {
    background(0,51,102);

    // the moon
    noStroke();
    fill(255);
    arc(width/2,325,200,200,-180,0);

    // grass
    noStroke();
    rectMode(CORNER);
    fill(0,139,0);
    rect(0,325,width,108);

    // grassless circular patch around the cannon
    fill(139,69,19);
    ellipse(STARTING_X+-5,STARTING_Y+16,79,27);
};

/**
 * Labels and display the displacement between the pool
 * and the cannon
 **/
var displayDisplacement = function() {
    var cannonPosition = cannon.getPosition();
    var poolPosition = pool.getPosition();

    // draws the 2 small vertical lines below the cannon and the pool
    stroke(0);
    strokeWeight(2);
    line(cannonPosition.x, cannonPosition.y+42,
         cannonPosition.x, cannonPosition.y+52);
    line(poolPosition.x, cannonPosition.y+42,
         poolPosition.x, cannonPosition.y+52);

    // draw 2 longer horizontal lines
    var dispPixels = poolPosition.x - cannonPosition.x;
    var dispMeters = dispPixels / PIXELS_PER_METER;
    line(cannonPosition.x, cannonPosition.y+47.5,
         cannonPosition.x + dispPixels/2 - 20,
         cannonPosition.y+47.5);
    line(poolPosition.x-1, cannonPosition.y+47.5,
         poolPosition.x-dispPixels/2+20,
         cannonPosition.y+47.5);
    textAlign(CENTER,CENTER);
    textFont(SERIF_FONT,14);
    fill(0);

    // display the displacement value
    text(dispMeters + " m", cannonPosition.x+dispPixels/2,
         cannonPosition.y+47.5);
};

draw = function() {
    drawBackground();

    // Pool drawn first so MonsterCannonBall appears above it
    drawPool(pool);

    // MonsterCannonBall drawn next to appear behind Cannon.
    cannonball.update();
    cannonball.drawPath();
    cannonball.display();

    // draw Cannon and display the displacement between it and the pool.
    cannon.setAngle(angleLever.getAngle());
    drawCannon(cannon);
    displayDisplacement();

    // Will display Launch Data Tables and Velocity Vectors
    // if their respective Toggles are turned on.
    if (vectorToggle.isOn()) {
        cannonball.drawVectorPlot();
    }
    if (dataToggle.isOn()) {
        cannonball.drawFlightDataTable();
    }

    // The drops need to be instantiated in draw() or Splash will not work properly
    splash.addDrop();
    splash.applyGravity();
    splash.run();

    // Track the game state and display the correct Controls Box accordingly
    updateGameState();
    drawControlsBox();
};
/******************* DRAW FUNCTIONS *******************/


/******************* EVENT HANDLERS *******************/
mouseClicked = function() {
    if (state === 'preLaunch') {
        fireButton.handleMouseClick(function() {
            launch();
        });
    }
    if (state === 'success' || state === 'fail') {
        resetButton.handleMouseClick(function() {
            reset();
        });
    }
    // user can accidentally click on toggles while projectile is launched even if they are not visible
    if (state !== 'launched') {
        dataToggle.handleMouseClick();
        vectorToggle.handleMouseClick();
    }
};

mousePressed = function() {
    if (state === 'preLaunch') {
        if (angleLever.mouseOverKnob()) {
            angleLever.setDraggable();
        }
        if (velocitySlider.mouseOver()) {
            velocitySlider.setDraggable();
        }
    }
};

mouseReleased = function() {
    if (angleLever.getDraggable()) {
        angleLever.setUndraggable();
    }

    if (velocitySlider.draggable){
        velocitySlider.setUndraggable();
    }
};

mouseOut = function() {
    // If the user accidentally moves the mouse off the screen,
    // they will no longer be able to change these controls
    angleLever.setUndraggable();
    velocitySlider.setUndraggable();
};
/******************* EVENT HANDLERS *******************/
