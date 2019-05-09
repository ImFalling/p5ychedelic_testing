function IncreaseFactorWrapAround(maxFactor){
    NextFactor = (NextFactor + 1) % maxFactor;
}

function DecreaseFactorWrapAround(maxFactor){
    NextFactor = (NextFactor-1 > 0 ? NextFactor-1 : maxFactor);
}

var PositiveRubberband = true;

function RubberbandFactor(maxFactor){
    if(PositiveRubberband){
        if(NextFactor < maxFactor)
            NextFactor += 1;
        else{
            PositiveRubberband = false;
            NextFactor = maxFactor;
            NextFactor -= 1;
        }
    }
    else{
        if(NextFactor > 1){
            NextFactor -= 1;
        }
        else{
            PositiveRubberband = true;
            NextFactor = 1;
            NextFactor += 1;
        }
    }
}