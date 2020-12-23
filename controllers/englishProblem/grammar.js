const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const English = require("../../models/English");
const WordPOS = require("wordpos");
const pos = require('pos');
const synonyms = require("synonyms");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const SENTENCE = "SENTENCE";
const WORD = "WORD"
var sentences = [`She quickly types the letter.`
                ,`Evie can play tennis and badminton but she prefers team sports.`
                ,`He swam well despite being tired.`
                ,'He kept telling himself that one day it would all somehow make sense.'
                ,'He swore he just saw his sushi move.'
                ,'He was surprised that his immense laziness was inspirational to others.'
                ,"She borrowed the book from him many years ago and hasn't yet returned it."]

const wordpos = new WordPOS({stopwords: false});
const SELECT_ONE = "SELECT_ONE"
const RADIO_CHOICE = "RADIO_CHOICE"

const randInt = (start, end) => {
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

const getSentence = async () => {
  let count = await English.countDocuments({type: SENTENCE});
  let random = randInt(0,count-1);
  let sentence = await English.findOne({type: SENTENCE}).skip(random);
  return sentence.sentence
};

const getChoices = async (word) => {
  let words = await English.findOne({type: WORD, words: { $eq: word }})
  if (words) return words.words
  else return null
};

const shuffle = async (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

const generateGrammar = async (subtopicName, difficulty) => {
  var adverbs,adj,verbs,words,sentence,tokenize;
  var random,word,lowerWord,selectedWord,temp;
  var problemBody = "", problemTitle = "";
  var answerBody = "",answerChoices;
  var hintBody = "",solution = "";
  const answerMode = randInt(0,1)? SELECT_ONE: RADIO_CHOICE;
  switch (difficulty) {
    case EASY:
      try {
        // sentence = sentences[6]
        sentence = await getSentence()
        words = new pos.Lexer().lex(sentence);
        var tagger = new pos.Tagger();
        var taggedWords = tagger.tag(words);
        var filterTags = ['JJ','JJR','JJS','MD','RB','RBR','RBS','VB','VBD','VBG','VBN','VBP','VBZ']
        var filterWords = []
        for (i in taggedWords) {
          let taggedWord = taggedWords[i];
          let tag = taggedWord[1];
          if (filterTags.includes(tag)){
            word = taggedWord[0];
            filterWords.push(word);
          }
        }
        random = randInt(0,filterWords.length-1)
        selectedWord = filterWords[random]
        lowerWord = selectedWord.toLowerCase()
        choices = await getChoices(lowerWord);
        if(!choices) {
          choices = []
          choices.push(lowerWord);
          for (i=0;i<4;i++) {
            temp  = await wordpos.randAdjective({startsWith:lowerWord[0]+lowerWord[1]})
            choices.push(temp[0])
          }
        }
        //opt 1 select correct word
        problemTitle = "Choose the correct option to complete the sentence."
        if (answerMode==SELECT_ONE) {
          let n = choices.length 
          if (n < 2) {
            for (i=0;i<2-n;i++) {
              temp  = await wordpos.randAdjective({startsWith:lowerWord[0]+lowerWord[1]})
              choices.push(temp)
            }
          }
          do {
            temp = choices[randInt(0,choices.length-1)]
          }
          while (temp == lowerWord);
          problemBody = randInt(0,1)? sentence.replace(selectedWord,`[${selectedWord}&${temp}]`) 
                            : sentence.replace(selectedWord,`[${temp}&${selectedWord}]`);
        } 
        else if (answerMode==RADIO_CHOICE) {
          let n = choices.length 
          if (n < 4) {
            for (i=0;i<4-n;i++) {
              temp  = await wordpos.randAdjective({startsWith:lowerWord[0]+lowerWord[1]})
              choices.push(temp)
            }
          }
          answerChoices = [selectedWord]
          do {
            random = randInt(0,choices.length-1);
            word = choices[random];
            if (!answerChoices.includes(word)) {
              answerChoices.push(word);
            }
          }
          while (answerChoices.length < 4);
          answerChoices = await shuffle(answerChoices);
          problemBody = sentence.replace(selectedWord,`[]`);
        }
      }catch(err){
        console.log(err);
        return err;
      }
      //create answer
      answerBody = selectedWord;

      //create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: answerMode,
        title: problemTitle,
        choices: answerChoices? answerChoices: [], 
      });
      problemId = problem._id;
      answer = new Answer({
        problemId: problemId,
        body: answerBody,
        solution: solution,
      });
      hint = new Hint({ problemId: problemId, body: hintBody });
      
      //save to database
      try{
        await problem.save();
        await answer.save();
        await hint.save();
        return [{ problem, answer, hint }];
      }catch (err) {
        console.log(err)
        return err;
      }
      break;
  }
};

module.exports = { generateGrammar }