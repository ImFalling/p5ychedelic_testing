var manipulations = {
    IncreaseFactorWrapAround : function(maxFactor){
        NextFactor = (NextFactor < maxFactor ? NextFactor+1 : 1);
    },
    
    DecreaseFactorWrapAround : function(maxFactor){
        NextFactor = (NextFactor-1 > 1 ? NextFactor-1 : maxFactor);
    },
    
    PositiveRubberband : true,
    
    RubberbandFactor : function(maxFactor){
        if(this.PositiveRubberband){
            if(NextFactor < maxFactor)
                NextFactor += 1;
            else{
                this.PositiveRubberband = false;
                NextFactor = maxFactor;
                NextFactor -= 1;
            }
        }
        else{
            if(NextFactor > 1){
                NextFactor -= 1;
            }
            else{
                this.PositiveRubberband = true;
                NextFactor = 1;
                NextFactor += 1;
            }
        }
    },
    
    IncreaseColorWrapAround : function(){
        NextColor = (NextColor += 1) % Object.keys(ColorSets).length;
    },
    
    ToggleScaleDirection : function(){
        if(ScaleDirection == 1)
            ScaleDirection = -1;
        else if(ScaleDirection == -1)
            ScaleDirection = 1;
    },

    DisableScaling : function(){
        ScaleDirection = 0;
    },

    EnableScaling : function(i){
        ScaleDirection = i;
    }
}