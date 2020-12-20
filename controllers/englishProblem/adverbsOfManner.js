const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const WordPOS = require("wordpos");
const synonyms = require("synonyms");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
var sentences = [`She agreed to re-type the letter quickly.`]

const wordpos = new WordPOS();

const randInt = (start, end) => {
    return Math.floor(Math.random() * (end - start + 1)) + start;
};

const generateAdverbsOfManner = async (subtopicName, difficulty) => {
  var out = '';
  var adverb;
  var sentenceIndex = randInt(0,sentences.length)
  switch (difficulty) {
    case EASY:
      try {
        adverb = await wordpos.getAdverbs(sentences[0])
        syn = synonyms(adverb[0])
      }catch(err){
        console.log(err)
      }
      console.log(adverb)
      console.log(syn)
      break;
  }
};
// generateAdverbsOfManner('test','EASY')
// return 0
module.exports = { generateAdverbsOfManner }