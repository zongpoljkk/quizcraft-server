const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const WordPOS = require("wordpos");
const synonyms = require("synonyms");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
var sentences = [`She agreed to re-type the letter quickly.`,`Evie can play tennis and badminton but she prefers team sports.`]

const wordpos = new WordPOS();

const randInt = (start, end) => {
    return Math.floor(Math.random() * (end - start + 1)) + start;
};

const generateAdverbsOfManner = async (subtopicName, difficulty) => {
  var out = '';
  var adverb,adj,verbs;
  var sentenceIndex = randInt(0,sentences.length-1)
  switch (difficulty) {
    case EASY:
      try {
        // adverbs = await wordpos.getPOS(sentences[0])
        verbs = await wordpos.getVerbs(sentences[sentenceIndex])
        adverbs = await wordpos.getAdverbs(sentences[sentenceIndex])
        adj  = await wordpos.randAdjective({startsWith:adverbs[0][0]})
        // syn = synonyms(adverb[randInt(0,adverbs.length-1)])
      }catch(err){
        console.log(err)
      }
      console.log('verbs',verbs)
      console.log('adverbs',adverbs)
      console.log('adj',adj)
      // console.log(syn)
      break;
  }
};
generateAdverbsOfManner('test','EASY')
return 0
module.exports = { generateAdverbsOfManner }