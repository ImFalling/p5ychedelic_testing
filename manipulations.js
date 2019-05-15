var Manipulations = {
    IncreaseFactorWrapAround : function(maxFactor){
        NextSegmentFactor = (NextSegmentFactor < maxFactor ? NextSegmentFactor+1 : 1);
    },
    
    DecreaseFactorWrapAround : function(maxFactor){
        NextSegmentFactor = (NextSegmentFactor-1 > 1 ? NextSegmentFactor-1 : maxFactor);
    },
    
    PositiveSegmentRubberband : true,
    
    RubberbandFactor : function(maxFactor, minFactor){
        if(minFactor == null)
            minFactor = 1;
        if(this.PositiveSegmentRubberband){
            if(NextSegmentFactor < maxFactor)
                NextSegmentFactor += 1;
            else{
                this.PositiveSegmentRubberband = false;
                NextSegmentFactor = maxFactor;
                NextSegmentFactor -= 1;
            }
        }
        else{
            if(NextSegmentFactor > minFactor)
                NextSegmentFactor -= 1;
            else{
                this.PositiveSegmentRubberband = true;
                NextSegmentFactor = minFactor;
                NextSegmentFactor += 1;
            }
        }
    },

    IntervalSegmentFactorRubberband : function(maxFactor, minFactor, interval){
        this.facInt = setInterval( () => {
            this.RubberbandFactor(maxFactor, minFactor);
        }, interval);
    },

    ClearSegmentFactorInterval : function(){
        clearInterval(this.facInt);
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
    },

    EveryOtherDir : false,

    ToggleDirection : function(){
        GlobalDirection *= -1;
    },

    FollowMouse : true,

    ToggleFollowMouse : function(){
        if(this.FollowMouse)
            this.FollowMouse = false;
        else
        this.FollowMouse = true;
    },

    MouseFactor : 3,
    SpawnAtMouse : false,

    ToggleSpawnAtMouse : function(){
        if(this.SpawnAtMouse)
            this.SpawnAtMouse = false;
        else
            this.SpawnAtMouse = true;
    },

    IntervalRotationalOffset : function(offset, interval){
        this.rotInt = setInterval(()=> {NextRotationalOffset += offset}, interval);
    },
    
    ClearRotationalInterval : function(){
        clearInterval(this.rotInt);
    },

    ToggleLerping : function(){
        if(LerpingEnabled)
            LerpingEnabled = false;
        else
            LerpingEnabled = true;
    },

    PositiveLerpingRubberband : true,

    IntervalLerpRatioRubberband : function(min, max, amount, interval){
        this.lerpInt = setInterval(() => {

            if(this.PositiveLerpingRubberband){
                LerpFactor += amount;
                if(LerpFactor >= max)
                    this.PositiveLerpingRubberband = false;
            }
            else{
                LerpFactor -= amount;
                if(LerpFactor <= min)
                    this.PositiveLerpingRubberband = true;
            }
        }, interval);
    }
}