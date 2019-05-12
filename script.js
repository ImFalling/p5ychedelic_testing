/* GLOBAL VARS */
var ColorSets = {
    /*Rainbow : {
        Red: "#FF0000",
        Orange: "#FF7F00",
        Yellow: "#FFFF00",
        Green: "#00FF00",
        Blue: "#0000FF",
        Indigo: "#4B0082",
        Violet: "#9400D3"
    },*/
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

    },
    Vaporwave : {
        Pink: "#ff6ad5",
        Magenta: "#c774e8",
        Lavender: "#ad8cff",
        Indigo: "#8795e8",
        Cyan: "#94d0ff"
    }
}

//Vars to store client window size
var clientWidth = 0;
var clientHeight = 0;

//Array to store layer objects
var LayerList = [];

//Variable for determining amount of layers to generate
var LayerCount = 30;

//Variable for containing factorcount of newly auto-generated layer
var NextFactor = 2;

//Variable for containing colorset of newly auto-generated layer
var NextColor = 2;

//Variable for determining scalespeed
var ScaleFactor = 5;

//Variable for determining scale direction (1/-1)
var ScaleDirection = 1;

//Variable for determining if every other layer should have different directions
var EveryOtherDir = false;

var GlobalDirection = 1;

//Boolean for cooling down the keydown event listener
var Cooldown = false;

var Origin = {x, y};

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

//Layer object constructor
function Layer(sectionList, direction, radius, factor, colorIndex){
    
    //Member functions
    //Set new color and recreate all the sections
    this.SetColor = function(colorSet){
        this.colorSet = colorSet;
        if(this.segmentCount != Object.keys(colorSet).length){
            this.segmentCount = Object.keys(colorSet).length;
            this.sectionCount = this.SegmentCount * this.factor;
            this.GenerateNew(0);
        }

    }
    
    //Set new color and recreate all the sections
    this.SetColorByIndex = function(index){
        this.colorIndex = index;
        this.colorSet = ColorSets[Object.keys(ColorSets)[index]];
        if(this.segmentCount != Object.keys(this.colorSet).length){
            this.segmentCount = Object.keys(this.colorSet).length;
            this.sectionCount = this.SegmentCount * this.factor;
            this.GenerateNew(0);
        }
    }
    
    
    //Shift colorset by n positions, loop around if necessary
    this.ShiftColor = function(shift){
        if(shift + this.colorIndex < 0)
            this.SetColorByIndex(Object.keys(ColorSets).length -1);
        else if(shift + this.colorIndex > Object.keys(ColorSets).length-1)
            this.SetColorByIndex(0);
        else
            this.SetColorByIndex(this.colorIndex += shift);
    }
    
    this.GenerateNew = function(rotationalOffset){
        
        //Create a temporary section list
        this.sections = [];
        this.sectionCount = this.segmentCount * this.factor;
        this.baseRadian = 2 * Math.PI / this.segmentCount;
        this.radianIncrement = 2 * Math.PI / this.sectionCount;  
        
        //For each of the base segments:
        for(var xi = 0; xi < this.segmentCount; xi++){
            
            //For every Section in this segment 
            for(var i = 0; i < this.sectionCount/this.segmentCount; i++){
                
                //Calculate the rotational angle for this Section in radians
                //by adding the radial increment of one section multiplied by i, 
                //to the base angle multiplied by xi
                var angle = (this.baseRadian * xi) + (this.radianIncrement * i) + rotationalOffset;
                
                //Calculate the lerp ratio (meeting poin§t between two colors in hexadecimal) by dividing 1 by the amount of subsection in each base
                var ratio = 1 / (this.sectionCount / this.segmentCount) * i;
                
                //The color is just the base index, the rest of the color magic is set up in the object constructor
                var color = xi;
                
                //Create and push the new Section to the list
                var tempSection = new Section(this, color, ratio, angle);
                this.sections.push(tempSection);
            }
        }
    }

    this.Update = function(){
        this.radius -= ScaleFactor * ScaleDirection;
        this.sections.forEach( (element) => {
            element.update(this);
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

    //Member variables
    this.sections = sectionList;
    this.direction = direction;
    this.radius = radius;
    this.factor = factor;
    if(colorIndex != null)
        this.SetColorByIndex(colorIndex);
    else
        this.SetColorByIndex(1);

    //Calculate how many radians each base section will strech
    this.baseRadian = 2 * Math.PI / this.segmentCount;
    
    //Calculate how many radians each section will stretch
    this.radianIncrement = 2 * Math.PI / this.sectionCount;  
}

//Section object
function Section(parent, color, lerpRatio, angle){
    //Color values
    //Set up colors to lerp between, but only from 0-6 (because of ColorSet size)
    this.startColor = color % parent.segmentCount;
    this.endColor = (color+1) % parent.segmentCount;
    this.lerpRatio = lerpRatio;

    //Positional Values
    this.startRadian = angle;
    this.endRadian = angle + (2 * Math.PI / parent.sectionCount);
    this.origin = {
        x: clientWidth / 2,
        y: clientHeight / 2
    };
    this.radius = parent.radius;

    //Section update function
    this.update = function(parent){
        this.radius = parent.radius;
        this.points = this.calculatePoints();

        // Increase rotational and lerp ratio values (Change this for different speeds)
        this.startRadian += 0.01 * parent.direction;
        this.endRadian += 0.01 * parent.direction;
        this.lerpRatio += 0.03;

        //If the lerp ratio reaches 1, the color has changed entirely to the next color, so shift the color values by 1 and set lerp ratio to 0
        if(this.lerpRatio >= 1){
            this.lerpRatio = 0;
            this.startColor++;
            this.endColor++;
            if(this.startColor > parent.segmentCount-1)
                this.startColor = 0;
            if(this.endColor > parent.segmentCount-1)
                this.endColor = 0;
        }

        //String parsing the color values to a raw hexadecimal format (#000000 => 0x000000)
        var startHex = parent.colorSet[Object.keys(parent.colorSet)[this.startColor]].replace("#", "0x");
        var endHex = parent.colorSet[Object.keys(parent.colorSet)[this.endColor]].replace("#", "0x");

        //Lerp the two colors based on the ratio
        this.color = lerpColor(startHex, endHex, this.lerpRatio).toString(16);

        //Convert back to basic hex color string
        this.color = "000000".substr(0, 6 - this.color.length) + this.color;
        this.color = "#" + this.color;
    }

    this.calculatePoints = function(){
        var returnable = {
            x1: this.origin.x + (cos(this.startRadian) * this.radius),
            y1: this.origin.y + (sin(this.startRadian) * this.radius),
            x2: this.origin.x + (cos(this.endRadian) * this.radius),
            y2: this.origin.y + (sin(this.endRadian) * this.radius)
        };
        return returnable;
    }
}

function AddLayer(){
    var i = 0;
    for(var zi = LayerList.length+1; zi > 0 && i < LayerList.length+1; zi--){
        if(LayerList[i]){
            LayerList[i].radius = 1500 / LayerList.length+1 * zi;
            LayerList[i].direction = zi % 2 == 0 ? 1 : -1;
        }
        else{
            var tempLayer = new Layer(null, zi % 2 == 0 ? 1 : -1, 1500 / LayerList.length+1 * zi, 2)
            tempLayer.GenerateNew(0);
            LayerList.push(tempLayer);
        }
        i++;
    }
}

function PopLayer(){
    LayerList.pop();
}

//P5.js init method
function setup(){

    //Create a canvas that fills the screen
    var body = document.querySelector("body");
    clientWidth = body.clientWidth;
    clientHeight = body.clientHeight;
    Origin.x = clientWidth / 2;
    Origin.y = clientHeight / 2;
    var canvas = createCanvas(clientWidth, clientHeight);
    canvas.parent('sketchContainer');
    background("white");

    //A minimum of 7 Sections is required due to the ColorSet
    //The SectionList can only be increased in multiples of 7 due to lerp calculations for color between them
    //The Sections is divided into the 7 seperate segments.

    LayerList = [];
    //For each layer
    for(var zi = LayerCount; zi > 0; zi--){
        //Create a new layer object
        var tempLayer = new Layer(null, zi % 2 == 0 ? 1 : -1, 1500 / LayerCount * zi, 2)
        tempLayer.GenerateNew(0);
        LayerList.push(tempLayer);
    }
    console.log(LayerList);

    InitEventListeners();
}

function draw(){
    //Remove previously drawn frame
    background("white");
    //For each individual section in the sectionlist
    LayerList.forEach( (element) => {
        element.Update();
        if(ScaleDirection == 1){
            if(element.radius <= 0){
                LayerList.pop();
                var tempLayer = new Layer(null, (() => {if(EveryOtherDir) return LayerList[0].direction *= -1; else return GlobalDirection; })(), 1500, NextFactor, NextColor)
                tempLayer.GenerateNew(0);
                LayerList.unshift(tempLayer);
    
            }
        }
        else if(ScaleDirection == -1){
            if(element.radius >= 1500){
                LayerList.shift();
                var tempLayer = new Layer(null, (() => {if(EveryOtherDir) return LayerList[LayerList.length-2].direction *= -1; else return GlobalDirection; })(), 0, NextFactor, NextColor)
                tempLayer.GenerateNew(LayerList[LayerList.length-2].sections[0].startRadian / 2);
                LayerList.push(tempLayer);
            }
        }
    });
}

function InitEventListeners(){
    document.getElementById("sketchContainer").addEventListener("click", function(e){
        var mouseX = e.clientX;
        var mouseY = e.clientY;
    
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
            var found = false;
    
            if(i == LayerList.length-1){
                if(calculatedRadius < element.radius && calculatedRadius > 0)
                    found = true;
            }
            else{
                if(calculatedRadius < element.radius && calculatedRadius > LayerList[i+1].radius)
                    found = true;
            }
    
            if(found){
                LayerList[i].ShiftColor(-1);
                LayerList[i].GenerateNew(0);
            }
    
        }
    }, true);

    document.getElementById("toolbarContainer").addEventListener("click", function(e){
        if(e.target == document.getElementById("toolbarContainer"))
            toggleToolbox();
    }, true);
    
    //Eventlistener for incrementing/decrementing SectionCount by multiples of 7
    window.addEventListener("keydown", function(event){
        if(!Cooldown){
            Cooldown = true;
    
            //If right arrow
            if(event.keyCode == 39){
                //For each layer
                for(var zi = LayerList.length-1; zi >= 0; zi--){
                    //Highlight the sections key
                    var element = LayerList[zi];
                    element.factor += 1;
                    element.GenerateNew(0);
                }
            }
            //If left arrow and SectionCount will not decrease to 0 
            else if(event.keyCode == 37){
                //For each layer
                for(var zi = LayerList.Length-1; zi >= 0; zi--){
                    //Highlight the sections key
                    var element = LayerList[zi];
                    if(element.factor > 1)
                        element.factor -= 1;
                    element.GenerateNew(0);
                }
            }
    
            //If up arrow
            else if(event.keyCode == 38){
                //For each layer
                for(var zi = LayerList.length-1; zi >= 0; zi--){
                    //Highlight the sections key
                    var element = LayerList[zi];
                    element.ShiftColor(1);
                    
                }
            }
    
            //If down arrow
            else if(event.keyCode == 40){
                //For each layer
                for(var zi = LayerList.length-1; zi >= 0; zi--){
                    //Highlight the sections key
                    var element = LayerList[zi];
                    element.ShiftColor(-1);          
                }
            }
            
            //Cooldown
            setTimeout(()=>{Cooldown = false}, 150);
        }
    }, false);
}