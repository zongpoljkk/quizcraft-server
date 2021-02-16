const { ALPHABET } = require("../../utils/const");

const randInt = async (start, end, haveNegative) => {
  if (haveNegative) {
    return (
      (Math.floor(Math.random() * (end - start + 1)) + start) *
      (-1) ** Math.floor(Math.random() * 2)
    );
  } else {
    return Math.floor(Math.random() * (end - start + 1)) + start;
  }
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

const baseSelector = () => {
  let rand = Math.floor(Math.random() * 4) + 1; //choose base
  let a, b, c;
  switch (rand) {
    case 1: //int
      a = randInt(2, 10, true); //random (+-)[2,10]
      break;
    case 2: //float
      a =
        (Math.random() * 9 + 1.01).toFixed(2) *
        (-1) ** Math.floor(Math.random() * 2); //random (+-)[1.01,10.00)
      break;
    case 3: //fraction
      b = randInt(1, 10, true); //random (+-)[1,10]
      c = randInt(2, 10, false); //random [2,10]
      c = c == b ? c + 1 : c;
      a = `(${b}/${c})`;
      break;
    case 4: //alphabet
      a = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      break;
  }
  return a;
};

module.exports = { randInt, shuffle, baseSelector };

