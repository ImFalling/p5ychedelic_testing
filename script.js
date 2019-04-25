/* GLOBAL VARS */
var ColorSets = {
    Rainbow : {
        Red: "#FF0000",
        Orange: "#FF7F00",
        Yellow: "#FFFF00",
        Green: "#00FF00",
        Blue: "#0000FF",
        Indigo: "#4B0082",
        Violet: "#9400D3"
    },
    Alternate : {
        Red: "#d8a47f",
        Orange: "#272932",
        Yellow: "#e7ecef",
        Green: "#0f7173",
        Blue: "#f05d5e",
        Indigo: "#ffba08",
        Violet: "#3f88c5"
    },
    PalePastel : {
        Goldenrod: "#f2f6d0",
        LightGray: "#d0e1d4",
        PastelGray: "#d9d2b6",
        PaleGold: "#e4be9e",
        OldLavender: "#71697a"
    },
    Forest : {
        DeepBlue: "#05396b",
        DarkGreen: "#389583",
        LightGreen: "#5cdb94",
        Teal: "#8de4af",
        Egg: "#edf5e0"

    }
}
//Variable to contain the spectrum of colors
var ColorSet = ColorSets.Forest;
var ColorIndex = 3;

//Vars to store client window size
var clientWidth = 0;
var clientHeight = 0;


//A jagged array of Layers filled with sections
var LayerList = [];

//Variable for determining amount of base Segments
var SegmentCount = Object.keys(ColorSet).length;

//Variable for determining amount of Section objects to generate
var SectionCount = SegmentCount;

//Variable for determining amount of layers to generate
var LayerCount = 5;

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

//Layer object
function Layer(sectionList, direction, radius, colorSet){

    this.sections = sectionList;
    this.direction = direction;
    this.radius = radius;
    this.colorSet = colorSet
}

//Section object
function Section(color, lerpRatio, angle, radius){
    //Color values
    //Set up colors to lerp between, but only from 0-6 (because of ColorSet size)
    this.startColor = color % SegmentCount;
    this.endColor = (color+1) % SegmentCount;
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
    this.update = function(parent){
        this.points = calcSectionPoints(this, this.radius);

        // Increase rotational and lerp ratio values (Change this for different speeds)
        this.startRadian += 0.01 * parent.direction;
        this.endRadian += 0.01 * parent.direction;
        this.lerpRatio += 0.01;

        //If the lerp ratio reaches 1, the color has changed entirely to the next color, so shift the color values by 1 and set lerp ratio to 0
        if(this.lerpRatio >= 1){
            this.lerpRatio = 0;
            this.startColor++;
            this.endColor++;
            if(this.startColor > SegmentCount-1)
                this.startColor = 0;
            if(this.endColor > SegmentCount-1)
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

//Set new color and recreate all the sections
function SetColor(colorSet){
    LayerList = [];
    var factor = SectionCount / SegmentCount;
    SegmentCount = Object.keys(colorSet).length;
    SectionCount = SegmentCount * factor;
    ColorSet = colorSet;
    setup();
}

//Set new layercount and recreate all the sections
function SetLayers(Layers){
    LayerCount = Layers;
    setup();
}

//Eventlistener for incrementing/decrementing SectionCount by multiples of 7
window.addEventListener("keydown", function(event){
    if(!Cooldown){
        Cooldown = true;

        //If right arrow
        if(event.keyCode == 39){
            LayerList = [];
            SectionCount += SegmentCount;
            setup();
        }
        //If left arrow and SectionCount will not decrease to 0 
        else if(event.keyCode == 37 && SectionCount > SegmentCount){
            LayerList = [];
            SectionCount -= SegmentCount;
            setup();
        }

        //If up arrow
        else if(event.keyCode == 38){
            if(ColorIndex >= Object.keys(ColorSets).length - 1)
                ColorIndex = 0;
            else
                ColorIndex += 1;
            SetColor(ColorSets[Object.keys(ColorSets)[ColorIndex]]);
        }

        //If down arrow
        else if(event.keyCode == 40){
            if(ColorIndex <= 0)
                ColorIndex = Object.keys(ColorSets).length - 1;
            else
                ColorIndex -= 1;
            SetColor(ColorSets[Object.keys(ColorSets)[ColorIndex]]);
        }
        
        //Cooldown
        setTimeout(()=>{Cooldown = false}, 150);
    }
}, false);

//P5.js init method
function setup(){

    //Create a canvas that fills the screen
    var body = document.querySelector("body");
    clientWidth = body.clientWidth;
    clientHeight = body.clientHeight;
    var canvas = createCanvas(clientWidth, clientHeight);
    canvas.parent('sketchContainer');
    background("white");

    //A minimum of 7 Sections is required due to the ColorSet
    //The SectionList can only be increased in multiples of 7 due to lerp calculations for color between them
    //The Sections is divided into the 7 seperate segments.

    //Calculate how many radians each base section will strech
    var baseRadian = 2 * Math.PI / SegmentCount;

    //Calculate how many radians each section will stretch
    var radianIncrement = 2 * Math.PI / SectionCount;  

    //For each layer
    for(var zi = LayerCount; zi > 0; zi--){
        //Create a new layer object
        var tempLayer = new Layer(null, zi % 2 == 0 ? 1 : -1, 1200 / LayerCount * zi, direction)

        //Create a temporary section list
        var sectionList = [];
        //For each of the 7 base segments:
        for(var xi = 0; xi < SegmentCount; xi++){
    
            //For every Section in this segment 
            for(var i = 0; i < SectionCount/SegmentCount; i++){
    
                //Calculate the rotational angle for this Section in radians
                //by adding the radial increment of one section multiplied by i, 
                //to the base angle multiplied by xi
                var angle = (baseRadian * xi) + (radianIncrement * i) + zi;
    
                //Calculate the lerp ratio (meeting point between two colors in hexadecimal) by dividing 1 by the amount of subsection in each base
                var ratio = 1 / (SectionCount / SegmentCount) * i;
    
                //The color is just the base index, the rest of the color magic is set up in the object constructor
                var color = xi;
    
                var direction = tempLayer.direction;
                //Create and push the new Section to the list
                var tempSection = new Section(color, ratio, angle, 1200 / LayerCount * zi, direction);
                sectionList.push(tempSection);
            }
        }

        //After all sections have been generated and pushed into an array, update the new layer object with the sectionslist.
        tempLayer.sections = sectionList;
        LayerList.push(tempLayer);
    }
    console.log(LayerList);
}

function draw(){
    //Remove previously drawn frame
    background("white");
    //For each individual section in the sectionlist
    LayerList.forEach( (pelement) => {
        pelement.sections.forEach( (element) => {
            element.update(pelement);
            //Set to current element color
            fill(element.color);
            noStroke();
            //Draw polygon
            quad(element.origin.x, element.origin.y,
                element.origin.x, element.origin.y,
                element.points.x1, element.points.y1,
                element.points.x2, element.points.y2);
        });
    });
}

function mouseClicked(){
    var x = mouseX;
    var y = mouseY;

    //Calculate the hypotenuse between the cursor and the circle center
    var center = {
        x: clientWidth / 2,
        y: clientHeight / 2
    }
    var adjacent = (mouseX < center.x ? center.x - mouseX : mouseX - center.x);
    var opposite = (mouseY < center.y ? center.y - mouseY : mouseY - center.y);
    var calculatedRadius = Math.sqrt(adjacent*adjacent + opposite * opposite);
  
    
    for(var i = 0; i < LayerList.length; i++){
        var element = LayerList[i];
        if(i == LayerList.length-1){
            if(calculatedRadius < element.radius && calculatedRadius > 0){
                console.log(calculatedRadius);
                console.log(element.radius);
                console.log(element.radius - (1200 / LayerCount * i + 1));
                LayerList[i].direction *= -1;
                break;
            }
        }

        if(calculatedRadius < element.radius && calculatedRadius > LayerList[i+1].radius){
            console.log(calculatedRadius);
            console.log(element.radius);
            console.log(element.radius - (1200 / LayerCount * i + 1));
            LayerList[i].direction *= -1;
            break;
        }
    }
}