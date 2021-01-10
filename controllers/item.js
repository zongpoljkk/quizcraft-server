const Item = require("../models/Item");
const User = require("../models/User");
const Challenge = require("../models/Challenge");
const { GAME_MODE, ITEM_NAME } = require("../utils/const");

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

exports.useSkipItem = async (req,res) => {
  const userId = req.body.userId;
  if (req.userId !== userId) {
    return res.status(400).json({
      success: false,
      error: "userId not match userId that decoded from token!",
    });
  }
  try {
    const user = await User.findOne({ _id: userId });
    let skipItem;
    for (i in user.items) {
      if (user.items[i].itemName == ITEM_NAME.SKIP) {
        skipItem = user.items[i];
        break;
      }
    }
    if (!skipItem || skipItem.amount <= 0) {
      return res.status(400).json({ success: false, error: "User do not has skip item" });
    }
    const gameMode = req.body.gameMode;
    if (gameMode == GAME_MODE.CHALLENGE) {
      //todo update user result and update item in user
      const challengeId = req.body.challengeId;
      const problemIndex = req.body.challengeId;
      await Challenge.findOne({
        _id: challengeId,
        $or: [{ user1Id: userId }, { user2Id: userId }],
      }).exec((err, challenge) => {
        if (err) return res.status(500).json({ success: false, error: err });
        else if (!challenge) return res.status(400).json({ success: false, error: "Challenge not exist" });
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

      })
    } else if (gameMode == GAME_MODE.QUIZ) {
      //todo -> increase point?
    }
    return res.send(user.items)

  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}