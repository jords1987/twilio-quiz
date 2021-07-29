exports.handler = function(context, event, callback) {

    let twiml = new Twilio.twiml.VoiceResponse();
    
    if(event.Digits === event.answer){
      twiml.say("Thats correct, well done clever clogs!...");
    }
    else{
      twiml.say("oh no you was wrong, the correct answer was" + event.answer + "...");
    }
  
    return callback(null, twiml);
  };