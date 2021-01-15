const Item = require("../models/Item");
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const { GAME_MODE, ITEM_NAME, DIFFICULTY } = require("../utils/const");
const { DIFFICULTY_EXP, DIFFICULTY_COIN, MODE_SURPLUS } = require("../utils/gameConfig");
const { levelSystem, rankSystem, MAX_LEVEL } = require("../utils/level");
const levelDictionary = levelSystem();
const rankDictionary = rankSystem();
const { updateCoinAndExp } = require("./user");
const { earn } = require("synonyms/dictionary");

//Add item for testing
exports.addItem = (req, res, next) => {
  const item = new Item(req.body);
  item.save((err, newItem) => {
    if (err) res.send(err);
    else if (!newItem) res.send(400);
    else res.send(newItem);
    next();
  });
};

exports.getAllItems = async (req, res) => {
  await Item.find()
    .exec((err, items) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!items.length) {
        return res.status(400).json({ success: false, data: "no items" });
      }
      return res.status(200).json({ success: true, data: items });
    })
    .catch((err) => console.log(err));
};

exports.useSkipItemForChallenge = async (req,res) => {
  try {
    const userId = req.userId;
    var user = await User.findOne(
      { _id: userId }, 
      { level:1, rank:1, exp:1, maxExp:1, coin:1, items:1}
    );
    let skipItem, indexOfSkipItem, i;
    for (i in user.items) {
      if (user.items[i].itemName == ITEM_NAME.SKIP) {
        skipItem = user.items[i];
        indexOfSkipItem = i;
        break;
      }
    }
    if (!skipItem || skipItem.amount <= 0) {
      return res.status(400).json({ success: false, error: "User does not has skip item" });
    }
    const challengeId = req.body.challengeId;
    const problemIndex = req.body.problemIndex;
    var challenge = await Challenge.findOne({ _id: challengeId, $or: [{ user1Id: userId }, { user2Id: userId }] });
    if (!challenge) return res.status(400).json({ success: false, error: "Challenge not exist" });

    // * Handle used item * //
    user.items[indexOfSkipItem].amount -= 1;

    let [{ updatedUser, levelUp, rankUp, earnedCoins, earnedExp }] = await updateCoinAndExp(user, GAME_MODE.CHALLENGE, challenge.difficulty);
    
    //update result and score in challenge
    if (challenge.user1Id == userId) {
      if (challenge.user1Result.length - problemIndex != 1) return res.status(400).json({ success: false, error: "Wrong problem index" });
      challenge.user1Result[problemIndex] = 1;
      challenge.user1Score++;
      challenge.user1GainCoin += earnedCoins;
      challenge.user1GainExp += earnedExp;
    } else {
      if (challenge.user2Result.length - problemIndex != 1) return res.status(400).json({ success: false, error: "Wrong problem index" });
      challenge.user2Result[problemIndex] = 1;
      challenge.user2Score++;
      challenge.user2GainCoin += earnedCoins;
      challenge.user2GainExp += earnedExp;
    }
    
    //save to database
    // await challenge.save();
    // await user.save()
    let updatedchallenge = {
      _id: challenge._id,
      whoTurn: challenge.whoTurn,
      user1 : {
        userId: challenge.user1Id,
        score: challenge.user1Score,
        result: challenge.user1Result,
        time: parseFloat(challenge.user1Time),
        isRead: challenge.user1IsRead,
        gainCoin: challenge.user1GainCoin,
        gainExp: challenge.user1GainExp,
      },
      user2 : {
        userId: challenge.user2Id,
        score: challenge.user2Score,
        result: challenge.user2Result,
        time: parseFloat(challenge.user2Time),
        isRead: challenge.user2IsRead,
        gainCoin: challenge.user2GainCoin,
        gainExp: challenge.user2GainExp,
      }
    }

    return res.status(200).json({ success: true, data: { updatedchallenge, updatedUser, levelUp, rankUp, earnedCoins, earnedExp  } });    
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}

exports.useSkipItem = async (req,res) => {
  const userId = req.userId;
  try {
    const user = await User.findOne({ _id: userId });
    let skipItem, indexOfSkipItem, i;
    for (i in user.items) {
      if (user.items[i].itemName == ITEM_NAME.SKIP) {
        skipItem = user.items[i];
        indexOfSkipItem = i;
        break;
      }
    }
    if (!skipItem || skipItem.amount <= 0) {
      return res.status(400).json({ success: false, error: "User does not has skip item" });
    }
    let earnedCoins, earnedExp, modeSurplus;
    const gameMode = req.body.gameMode;
    switch (gameMode) {
      case GAME_MODE.CHALLENGE:
        const challengeId = req.body.challengeId;
        const problemIndex = req.body.problemIndex;
        var challenge = await Challenge.findOne({ _id: challengeId, $or: [{ user1Id: userId }, { user2Id: userId }] });
        if (!challenge) return res.status(400).json({ success: false, error: "Challenge not exist" });

        //update result and score in challenge
        if (challenge.user1Id == userId) {
          if (challenge.user1Result.length - problemIndex != 1) return res.status(400).json({ success: false, error: "Wrong problem index" });
          challenge.user1Result[problemIndex] = 1;
          challenge.user1Score++;
        } else {
          if (challenge.user2Result.length - problemIndex != 1) return res.status(400).json({ success: false, error: "Wrong problem index" });
          challenge.user2Result[problemIndex] = 1;
          challenge.user2Score++;
        }

        //save to database
        await challenge.save();
        modeSurplus = MODE_SURPLUS.CHALLENGE;
        break;
      case GAME_MODE.QUIZ:
        modeSurplus = MODE_SURPLUS.QUIZ;
        break;
      default:
        return res.status(400).json({ success: false, error: "Provided game mode did not exist or cannot use skip item in that game mode" });
    }

    // * Handle used item * //
    user.items[indexOfSkipItem].amount -= 1;

    // * Handle Earned coins and exp * //
    switch (challenge.difficulty) {
      case DIFFICULTY.EASY:
        earnedCoins = DIFFICULTY_COIN.EASY * modeSurplus;
        earnedExp = DIFFICULTY_EXP.EASY * modeSurplus;
        break;
      case DIFFICULTY.MEDIUM:
        earnedCoins = DIFFICULTY_COIN.MEDIUM * modeSurplus;
        earnedExp = DIFFICULTY_EXP.MEDIUM * modeSurplus;
        break;
      case DIFFICULTY.HARD:
        earnedCoins = DIFFICULTY_COIN.HARD * modeSurplus;
        earnedExp = DIFFICULTY_EXP.HARD * modeSurplus;  
        break;
    }
    user.exp += earnedExp;
    user.coin += earnedCoins;

    // * Handle Level up * //
    // Compare user exp if it exceeds the limit of his/her level
    let levelUp = false;
    let rankUp = false;
    if (user.exp >= levelDictionary[parseInt(user.level)]) {
      if (user.level == MAX_LEVEL) {
      } else {
        levelUp = true;
        user.exp -= levelDictionary[parseInt(user.level)];
        user.maxExp = levelDictionary[parseInt(user.level + 1)];
        user.level += 1;
        // ? Handle Rank up ? //
        if (user.level in rankDictionary) {
          user.rank = rankDictionary[user.level];
          rankUp = true;
        }
      }
    }

    //save to database
    await user.save()

    return res.status(200).json({ success: true, data: { levelUp, rankUp, userItem: user.items } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}