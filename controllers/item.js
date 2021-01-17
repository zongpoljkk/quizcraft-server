const Item = require("../models/Item");
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Problem = require("../models/Problem");
const { GAME_MODE, ITEM_NAME } = require("../utils/const");
const { updateCoinAndExp } = require("./user");
const { NUMBER_OF_PROBLEM } = require("../utils/challenge");

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
    const challengeId = req.body.challengeId;
    const problemIndex = req.body.problemIndex;
    if (problemIndex < 0 || problemIndex >= NUMBER_OF_PROBLEM) {
      return res.status(400).json({ success: false, error: "Wrong problem index" });
    }
    var user = await User.findOne(
      { _id: userId }, 
      { level:1, rank:1, exp:1, maxExp:1, coin:1, items:1, usedItems:1 }
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
    var challenge = await Challenge.findOne({ _id: challengeId, $or: [{ user1Id: userId }, { user2Id: userId }] });
    if (!challenge) return res.status(400).json({ success: false, error: "Challenge not exist" });

    const problemId = challenge.problems[problemIndex];

    // * Handle used item * //
    user.items[indexOfSkipItem].amount -= 1;
    let foundUsedItem = false;
    for (i in user.usedItems) {
      if (user.usedItems[i].itemName = ITEM_NAME.SKIP) {
        user.usedItems[i].problems.push(problemId);
        user.usedItems[i].amount++;
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      user.usedItems.push({
        itemName: ITEM_NAME.SKIP,
        amount: 1,
        problems: problemId
      })
    }

    let levelUp, rankUp, earnedCoins, earnedExp;
    [{ user, levelUp, rankUp, earnedCoins, earnedExp }] = await updateCoinAndExp(user, GAME_MODE.CHALLENGE, challenge.difficulty);
    
    //update result and score in challenge
    if (problemIndex == NUMBER_OF_PROBLEM - 1) {
      challenge.whoTurn = challenge.whoTurn == 1? 2 : 1;
      challenge.user1IsRead = false;
      challenge.user2IsRead = false;
      challenge.currentProblem = 0;
    }
    if (challenge.user1Id == userId) {
      if (challenge.user1Result.length - problemIndex != 1) return res.status(400).json({ success: false, error: "Wrong problem index" });
      challenge.user1Result.set(problemIndex, 1);
      challenge.user1Score++;
      challenge.user1GainCoin += earnedCoins;
      challenge.user1GainExp += earnedExp;
    } else {
      if (challenge.user2Result.length - problemIndex != 1) return res.status(400).json({ success: false, error: "Wrong problem index" });
      challenge.user2Result.set(problemIndex, 1);
      challenge.user2Score++;
      challenge.user2GainCoin += earnedCoins;
      challenge.user2GainExp += earnedExp;
    }
    
    var problem = await Problem.findOne({ _id: problemId });
    if (!problem) {
      return res.status(400).json({ success: false, error: "problem not founded" });
    }
    foundUsedItem = false;
    for (i in problem.usedItems) {
      if (problem.usedItems[i].itemName = ITEM_NAME.SKIP) {
        problem.usedItems[i].amount++;
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      problem.usedItems.push({
        itemName: ITEM_NAME.SKIP,
        amount: 1
      })
    }

    //save to database
    await challenge.save();
    await user.save();
    await problem.save();
    return res.status(200).json({ success: true, data: { levelUp, rankUp, earnedCoins, earnedExp  } });    
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}

exports.useSkipItemForQuiz = async (req,res) => {
  try {
    const userId = req.userId;
    const problemId = req.body.problemId;
    var user = await User.findOne(
      { _id: userId }, 
      { level:1, rank:1, exp:1, maxExp:1, coin:1, items:1, usedItems:1}
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
    
    var problem = await Problem.findOne({ _id: problemId });
    if (!problem) {
      return res.status(400).json({ success: false, error: "problem not founded" });
    }
    let foundUsedItem = false;
    for (i in problem.usedItems) {
      if (problem.usedItems[i].itemName = ITEM_NAME.SKIP) {
        problem.usedItems[i].amount++;
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      problem.usedItems.push({
        itemName: ITEM_NAME.SKIP,
        amount: 1
      })
    }

    // * Handle used item * //
    user.items[indexOfSkipItem].amount -= 1;
    foundUsedItem = false;
    for (i in user.usedItems) {
      if (user.usedItems[i].itemName = ITEM_NAME.SKIP) {
        user.usedItems[i].problems.push(problemId);
        user.usedItems[i].amount++;
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      user.usedItems.push({
        itemName: ITEM_NAME.SKIP,
        amount: 1,
        problems: problemId
      })
    }

    let levelUp, rankUp, earnedCoins, earnedExp;
    [{ user, levelUp, rankUp, earnedCoins, earnedExp }] = await updateCoinAndExp(user, GAME_MODE.QUIZ, problem.difficulty);

    //save to database
    await user.save();
    await problem.save();
    return res.status(200).json({ success: true, data: { levelUp, rankUp, earnedCoins, earnedExp } }); 
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}

exports.useRefreshItem = async (req,res) => {
  try {
    const userId = req.userId;
    const problemId = req.body.problemId;
    var user = await User.findOne(
      { _id: userId }, 
      { items:1, usedItems:1}
    );
    let refreshItem, indexOfRefreshItem, i;
    for (i in user.items) {
      if (user.items[i].itemName == ITEM_NAME.REFRESH) {
        refreshItem = user.items[i];
        indexOfRefreshItem = i;
        break;
      }
    }
    if (!refreshItem || refreshItem.amount <= 0) {
      return res.status(400).json({ success: false, error: "User does not has refresh item" });
    }
    
    var problem = await Problem.findOne({ _id: problemId });
    if (!problem) {
      return res.status(400).json({ success: false, error: "problem not founded" });
    }
    let foundUsedItem = false;
    for (i in problem.usedItems) {
      if (problem.usedItems[i].itemName = ITEM_NAME.SKIP) {
        problem.usedItems[i].amount++;
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      problem.usedItems.push({
        itemName: ITEM_NAME.SKIP,
        amount: 1
      })
    }

    // * Handle used item * //
    user.items[indexOfRefreshItem].amount -= 1;
    foundUsedItem = false;
    for (i in user.usedItems) {
      if (user.usedItems[i].itemName = ITEM_NAME.REFRESH) {
        user.usedItems[i].problems.push(problemId);
        user.usedItems[i].amount++;
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      user.usedItems.push({
        itemName: ITEM_NAME.REFRESH,
        amount: 1,
        problems: problemId
      })
    }
  
    //save to database
    await user.save();
    await problem.save();
    return res.status(200).json({ success: true, data: user.items[indexOfRefreshItem] }); 
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}