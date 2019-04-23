/* GLOBAL VARS */
//Constant to contain the spectrum of colors
const ColorSet = {
    Red: "#FF0000",
    Orange: "#FF7F00",
    Yellow: "#FFFF00",
    Green: "#00FF00",
    Blue: "#0000FF",
    Indigo: "#4B0082",
    Violet: "#9400D3"
}

//Vars to store client window size
var clientWidth = 0;
var clientHeight = 0;

//Array to store Section objects
var SectionList = [];

//Variable for determining amount of Section objects to generate
var SectionCount = 21;

//Boolean for cooling down the keydown event listener
var Cooldown = false;

//Function for linear interpolation between two hexadecimal color values, with a ratio.
//Returns a hexadecimal color value.
const lerpColor = function(a, b, amount) {
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};

//Section object
function Section(color, lerpRatio, angle, radius){
    //Color values
    //Set up colors to lerp between, but only from 0-6 (because of ColorSet size)
    this.startColor = color % 7;
    this.endColor = (color+1) % 7;
    this.lerpRatio = lerpRatio;

    //Positional Values
    this.startRadian = angle;
    this.endRadian = angle + (2 * Math.PI / SectionCount);
    this.origin = {
        x: clientWidth / 2,
        y: clientHeight / 2
    };
    this.radius = radius;

    //Section update function
    this.update = function(){
        this.points = calcSectionPoints(this, this.radius);

        // Increase rotational and lerp ratio values (Change this for different speeds)
        this.startRadian += 0.01;
        this.endRadian += 0.01;
        this.lerpRatio += 0.005;

        //If the lerp ratio reaches 1, the color has changed entirely to the next color, so shift the color values by 1 and set lerp ratio to 0
        if(this.lerpRatio >= 1){
            this.lerpRatio = 0;
            this.startColor++;
            this.endColor++;
            if(this.startColor > 6)
                this.startColor = 0;
            if(this.endColor > 6)
                this.endColor = 0;
        }

        //String parsing the color values to a raw hexadecimal format (#000000 => 0x000000)
        var startHex = ColorSet[Object.keys(ColorSet)[this.startColor]].replace("#", "0x");
        var endHex = ColorSet[Object.keys(ColorSet)[this.endColor]].replace("#", "0x");

        //Lerp the two colors based on the ratio
        this.color = lerpColor(startHex, endHex, this.lerpRatio).toString(16);

        //Convert back to basic hex color string
        this.color = "000000".substr(0, 6 - this.color.length) + this.color;
        this.color = "#" + this.color;
    }

}

//Trignometrical function for determining the distant X/Y coordinates of the polygon with an angle and a radius
function calcSectionPoints(section, radius){
    var returnable = {
        x1: section.origin.x + (cos(section.startRadian) * radius),
        y1: section.origin.y + (sin(section.startRadian) * radius),
        x2: section.origin.x + (cos(section.endRadian) * radius),
        y2: section.origin.y + (sin(section.endRadian) * radius)
    };
    return returnable;
}

//P5.js init method
function setup(){

    //Create a canvas that fills the screen
    var body = document.querySelector("body");
    clientWidth = body.clientWidth;
    clientHeight = body.clientHeight;
    createCanvas(clientWidth, clientHeight);
    background("white");

    //Eventlistener for incrementing/decrementing SectionCount by multiples of 7
    window.addEventListener("keydown", function(event){
        if(!Cooldown){
            Cooldown = true;

            //If right arrow
            if(event.keyCode == 39){
                SectionList = [];
                SectionCount += 7;
                setup();
            }
            //If left arrow and SectionCount will not decrease to 0 
            else if(event.keyCode == 37 && SectionCount > 7){
                SectionList = [];
                SectionCount -= 7
                setup();
            }

            //Cooldown
            setTimeout(()=>{Cooldown = false}, 150);
        }
    }, false);

    //A minimum of 7 Sections is required due to the ColorSet
    //The SectionList can only be increased in multiples of 7 due to lerp calculations for color between them
    //The Sections is divided into the 7 seperate segments.

    //Calculate how many radians each base section will strech
    var baseRadian = 2 * Math.PI / 7;

    //Calculate how many radians each section will stretch
    var radianIncrement = 2 * Math.PI / SectionCount;

    //For each of the 7 base segments:
    for(var xi = 0; xi < 7; xi++){

        //For every Section in this segment 
        for(var i = 0; i < SectionCount/7; i++){

            //Calculate the rotational angle for this Section in radians
            //by adding the radial increment of one section multiplied by i, 
            //to the base angle multiplied by xi
            var angle = (baseRadian * xi) + (radianIncrement * i);

            //Calculate the lerp ratio (meeting point between two colors in hexadecimal) by dividing 1 by the amount of subsection in each base
            var ratio = 1 / (SectionCount / 7) * i;

            //The color is just the base index, the rest of the color magic is set up in the object constructor
            var color = xi;

            //Create and push the new Section to the list
            var tempSection = new Section(color, ratio, angle, 2000);
            SectionList.push(tempSection);
        }
    }
    console.log(SectionList);
}

function draw(){
    //Remove previously drawn frame
    background("white");
    //For each individual section in the sectionlist
    SectionList.forEach( (element, i) => {
        //Run update method in element
        element.update();
        //Set to current element color
        fill(element.color);
        noStroke();
        //Draw polygon
        quad(element.origin.x, element.origin.y,
            element.origin.x, element.origin.y,
            element.points.x1, element.points.y1,
            element.points.x2, element.points.y2);
    });
}