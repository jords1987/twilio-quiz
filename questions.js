
// This is your new function. To start, set the name and path on the left.
const fetch = require("node-fetch");
const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.handler = async function(context, event, callback) {
  //add function that will shuffle later
  const shuffleArray = function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }
  try{
    //fetch a list of 10 questions from the api
    var questionApiResponse = await fetch("https://opentdb.com/api.php?amount=10");
    var questions = (await questionApiResponse.json()).results;
    
    //Create a TwiML voice response ready to return 
    const response = new VoiceResponse();    
      
    for(var i=0;i<questions.length;i++){
      var answers = [];  
            
      //Add the correct answer, and all of the incorrect anserts
      answers.push({correct:true, answer: decodeURI(questions[i].correct_answer)});      
      for(var j=0;j<questions[i].incorrect_answers.length;j++){
        answers.push({correct:false, answer: decodeURI(questions[i].incorrect_answers[j])});
      }
      //Shuffle the answers and assign them option numbers
      shuffleArray(answers)
      var correctOption = 0;
      answers.map((val,idx) => {
        val.option = idx + 1;
        if(val.correct) correctOption = idx +1;
      })      
      
      //Make the twiml that will read out the question and calls the process answer function
      const gather = response.gather({
          action: `https://${context.DOMAIN_NAME}/processAnswer?answer=` + correctOption,
          method: 'GET',
          input: 'dtmf',
          timeout: 5,
          finishOnKey: '*',
          numDigits: 1
      });
      
      //Build up the options for the customer to press the correct answer
      var answerString = " is it, ";
      answers.forEach(element => {
        answerString += " ";
        answerString += element.option;
        answerString += ". ";
        answerString += decodeURI(element.answer);
        answerString += ".. ";
      });      
      //a little hack here to remove the special chars from the question
      //so that when polly reads them, they sound OK
      gather.say(decodeURI(questions[i].question).replace(/&quot;/g, '-').replace(/&#039;/g, '-'));
      
      //Say the options for answers
      gather.say(answerString);
      
      response.say('Next Question');
    }
    //Now we loop around the function to get the next 10 questions
    response.redirect(`https://${context.DOMAIN_NAME}/questions`);

    return callback(null, response);
  }
  catch(exception){
    console.log(`Error executing function ${exception}`);
    callback(null, "Error");
  }
};