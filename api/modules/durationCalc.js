function durationCalcTime(km){

    const SPEED_MIN = 14.7523 ;
    const LANDING_TAKEOFF_TIME = 42.2957 ;

    return km/SPEED_MIN + LANDING_TAKEOFF_TIME ;

}

exports.durationCalcTime = durationCalcTime ;