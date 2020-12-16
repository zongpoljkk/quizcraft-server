exports.levelSystem = () => {
  const levels = 40;
  const exp_for_first_level = 100;
  const exp_for_last_level = 100000;

  const B = Math.log(exp_for_last_level / exp_for_first_level) / (levels - 1);
  const A = exp_for_first_level / (Math.exp(B) - 1.0);

  const levelDictionary = new Object();

  for (const i of Array(levels).keys()) {
    const old_xp = Math.round(A * Math.exp(B * i));
    const new_xp = Math.round(A * Math.exp(B * (i + 1)));
    levelDictionary[i + 1] = new_xp - old_xp;
  }
  return levelDictionary;
};

exports.rankSystem = () => {
  return {
    8: "SILVER",
    16: "GOLD",
    24: "DIAMOND",
    32: "PLATINUM",
  };
};
