const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const English = require("../../models/English");
const WordPOS = require("wordpos");
const pos = require('pos');
const synonyms = require("synonyms");
const { choice } = require("synonyms/dictionary");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const SENTENCE = "SENTENCE";
const WORD = "WORD"
var sentences = [`She quickly types the letter.`
                ,`Evie can play tennis and badminton but she prefers team sports.`
                ,`He swam well despite being tired.`
                ,'He kept telling himself that one day it would all somehow make sense.']

const wordpos = new WordPOS({stopwords: ["all","one","somehow"]});

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

const generateAdverbsOfManner = async (subtopicName, difficulty) => {
  var out = '';
  var adverbs,adj,verbs,words,sentence,tokenize;
  var b,random,word,lowerWord;
  switch (difficulty) {
    case EASY:
      try {
        sentence = sentences[1]
        // sentence = await getSentence()
        console.log(sentence)
        words = new pos.Lexer().lex(sentence);
        console.log(words)
        var tagger = new pos.Tagger();
        var taggedWords = tagger.tag(words);
        console.log(taggedWords)
        var filterTags = ['JJ','JJR','JJS','MD','RB','RBR','RBS','VB','VBD','VBG','VBN','VBP','VBZ']
        //JJ JJR JJS MD RB RBR RBS VB VBD VBG VBN VBP VBZ
        var filterWords = []
        for (i in taggedWords) {
          var taggedWord = taggedWords[i];
          var word = taggedWord[0];
          var tag = taggedWord[1];
          if (filterTags.includes(tag)){
            filterWords.push(word);
          }
        }
        console.log("filterWords",filterWords)
        // tokenize = await wordpos.parse(sentences[3])
        pos2 = await wordpos.getPOS(sentence)
        console.log(pos2)
        // verbs = pos.verbs
        // adverbs = pos.adverbs
        // adj = pos.adjectives 
        // posList = [verbs,adverbs,adj]
        // do {
        //   random = randInt(0,posList.length-1)
        // }
        // while (posList[random].length == 0)
        // word = posList[random][randInt(0,posList[random].length-1)]
        // lowerWord = word.toLowerCase()
        // console.log(word)
        // choices = await getChoices(lowerWord);
        // if (choices) {
        //   console.log(choices)

        // } else {

        // }
        // adj  = await wordpos.randAdjective({startsWith:adverbs[0][0]+adverbs[0][1]})
        // syn = synonyms(adverb[randInt(0,adverbs.length-1)])
        // console.log('verbs',verbs)
        // console.log('adj',adj)
        // console.log('adverbs',adverbs)
      }catch(err){
        console.log(err)
      }
      break;
  }
};
// generateAdverbsOfManner('test','EASY')
// return 0
module.exports = { generateAdverbsOfManner }