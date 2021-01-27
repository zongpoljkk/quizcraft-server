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

exports.addFile = (req, res) => {
  const itemName = req.body.itemName;
  const image = req.files.image;
  const lottie = req.files.lottie;
  Item.findOne({name: itemName})
    .select("_id photo")
    .exec((err, item) => {
      if (err) {
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      } else if (!item) {
        res.status(400).send({
          success: false,
          error: "Unable to find item with the given itemName",
        });
      }
      item.image = image;
      item.lottie = lottie;
      item.save();
      res.status(200).send({ success: true, data: "Upload succeeded" });
    });
};

exports.getAllItems = async (req, res) => {
  await Item.aggregate(
    [
      {
        $lookup: {
          from: "media.chunks",
          localField: "image.id",
          foreignField: "files_id",
          as: "image_info",
        },
      },
      { $unwind: "$image_info" },
      {
        $lookup: {
          from: "media.chunks",
          localField: "lottie.id",
          foreignField: "files_id",
          as: "lottie_info",
        },
      },
      { $unwind: "$lottie_info" },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          "image_info.data": 1,
          "lottie_info.data": 1,

        }
      }
    ],
    (err, items) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!items.length) {
        return res.status(400).json({ success: false, items: "no items" });
      }
      return res.status(200).json({ success: true, data: items });
    }
  );
};

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
        problem.usedItems[i].userId.push(userId);
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      problem.usedItems.push({
        itemName: ITEM_NAME.SKIP,
        amount: 1,
        userId: userId,
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
      return res.status(400).json({ success: false, error: "problem not found" });
    }
    let foundUsedItem = false;
    for (i in problem.usedItems) {
      if (problem.usedItems[i].itemName = ITEM_NAME.REFRESH) {
        problem.usedItems[i].amount++;
        problem.usedItems[i].userId.push(userId);
        foundUsedItem = true;
        break;
      }
    }
    if (!foundUsedItem) {
      problem.usedItems.push({
        itemName: ITEM_NAME.REFRESH,
        amount: 1,
        userId: userId,
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