const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const User = require("../models/User");
const Item = require("../models/Item");
const jwt = require("jsonwebtoken");
const config = require("../config/keys");
const { GAME_MODE, DIFFICULTY } = require("../utils/const");
const { DIFFICULTY_EXP, DIFFICULTY_COIN, MODE_SURPLUS } = require("../utils/gameConfig");
const { levelSystem, rankSystem, MAX_LEVEL } = require("../utils/level");
const { findActiveItem } = require("./item");
const { ITEM_NAME } = require("../utils/const"); 

//Add user for testing
exports.addUser = (req, res, next) => {
  const user = new User(req.body);
  user.save((err, newUser) => {
    if (err) res.send(err);
    else if (!newUser) res.send(400);
    else res.send(newUser);
    next();
  });
};

exports.getAllUsers = async (req, res) => {
  await User.find().exec((err, users) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!users.length) {
      return res.status(400).json({ success: false, data: "no users" });
    }
    return res.status(200).json({ success: true, data: users });
  });
};

exports.getProfileByUID = async (req, res) => {
  var mongoose = require("mongoose");
  const _id = req.query._id;
  await User.aggregate(
    [
      {
        $match: {
          _id: mongoose.Types.ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "uploads.chunks",
          localField: "photo.id",
          foreignField: "files_id",
          as: "photo",
        },
      },
      {
        $unwind: {
          path: "$photo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "items.itemName",
          foreignField: "name",
          as: "fromItems",
        },
      },
      {
        $lookup: {
          from: "media.chunks",
          localField: "fromItems.image.id",
          foreignField: "files_id",
          as: "itemImages",
        },
      },
      {
        $addFields: {
          itemInfoWithoutImgs: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$fromItems",
                          as: "fromItem",
                          cond: { $eq: ["$$fromItem.name", "$$item.itemName"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          items: 0,
          achievements: 0,
          __v: 0,
          "photo._id": 0,
          "photo.files_id": 0,
          "photo.n": 0,
          "itemInfoWithoutImgs.name": 0,
          "itemInfoWithoutImgs.price": 0,
          "itemInfoWithoutImgs.__v": 0,
          "itemInfoWithoutImgs._id": 0,
          "itemInfoWithoutImgs.lottie": 0,
        },
      },
      {
        $unwind: {
          path: "$itemInfoWithoutImgs",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$itemInfoWithoutImgs.image",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          school: { $first: "$school" },
          class: { $first: "$class" },
          rank: { $first: "$rank" },
          coin: { $first: "$coin" },
          photo: { $first: "$photo" },
          streak: { $first: "$streak" },
          role: { $first: "$role" },
          firstname: { $first: "$firstname" },
          lastname: { $first: "$lastname" },
          smartSchoolAccount: { $first: "$smartSchoolAccount" },
          username: { $first: "$username" },
          lastLogin: { $first: "$lastLogin" },
          exp: { $first: "$exp" },
          level: { $first: "$level" },
          maxExp: { $first: "$maxExp" },
          itemInfoWithoutImgs: { $push: "$itemInfoWithoutImgs" },
          itemImages: { $first: "$itemImages"}
        },
      },
      {
        $addFields: {
          itemInfos: {
            $map: {
              input: "$itemInfoWithoutImgs",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$itemImages",
                          as: "image",
                          cond: { $eq: ["$$image.files_id", "$$item.image.id"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          itemInfoWithoutImgs: 0,
          itemImages: 0,
          "itemInfos.image": 0,
          "itemInfos._id": 0,
          "itemInfos.files_id": 0,
          "itemInfos.n": 0
        },
      },
    ],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user.length) {
        return res.status(400).json({ success: false, error: "no users" });
      }
      return res.status(200).json({ success: true, data: user });
    }
  );
};

exports.editUsername = async (req, res) => {
  let token = req.header("Authorization");
  var userIdFromToken;
  if (!token) {
    return res
      .status(403)
      .json({ success: false, error: "No token provided!" });
  }
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trimLeft();
  } else {
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, error: "Unauthorized!" });
    userIdFromToken = decoded.userId;
  });

  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  if (userIdFromToken !== body.userId) {
    return res.status(400).json({
      success: false,
      error: "userId not match userId that decoded from token!",
    });
  }

  const regex = RegExp(
    "^(?=[a-zA-Zก-๛_d\S]*[a-zA-Zก-๛\S])[-a-zA-Zก-๛0-9_d\S]{5,12}$"
  );
  const usernameValidate = regex.test(body.username);

  if (body.username == null || body.username.trim().length == 0) {
    return res.status(400).json({
      success: false,
      error: "Username cannot be blank!",
    });
  }

  if (!usernameValidate) {
    return res.status(400).json({
      success: false,
      error: "Username format is not correct!",
    });
  }

  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!user && usernameValidate) {
      User.findOneAndUpdate(
        { _id: req.body.userId },
        { username: req.body.username },
        { new: true },
        (err, user) => {
          if (err) {
            return res.status(500).json({ success: false, error: err });
          }
          if (!user) {
            return res.status(400).json({ success: false, error: "no data" });
          }
          return res.status(200).json({
            success: true,
            data: { username: user.username },
          });
        }
      );
    } else {
      return res
        .status(400)
        .json({ success: false, error: "already have this username!" });
    }
  });
};

exports.usedItem = async (req, res) => {  
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  if (req.userId !== body.userId) {
    return res.status(400).json({
      success: false,
      error: "userId not match userId that decoded from token!",
    });
  }

  User.findOne(
    {
      _id: req.body.userId,
      items: {
        $elemMatch: {
          itemName: req.body.itemName,
          amount: { $eq: 0 },
        },
      },
    },
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user) {
        User.findOneAndUpdate(
          {
            _id: req.body.userId,
            items: {
              $elemMatch: {
                itemName: req.body.itemName,
                amount: { $gt: 0 },
              },
            },
          },
          { $inc: { "items.$.amount": -1 } },
          { new: true },
          (err, user) => {
            if (err) {
              return res.status(500).json({ success: false, error: err });
            }
            if (!user) {
              return res.status(400).json({ success: false, error: "no data" });
            }
            let items = user.items;
            let index = items.findIndex((x) => x.itemName === body.itemName);
            return res
              .status(200)
              .json({ success: true, data: user.items[index] });
          }
        );
      } else {
        return res.status(400).json({
          success: false,
          error: "cannot use this item bc amount = 0!",
        });
      }
    }
  );
};

const deleteProfilePicture = (name, query) => { 
  mongoose.connection.db.collection(name, function (err, collection) {
    collection.findOneAndDelete(query)
});
}

exports.changeProfilePicture = (req, res, next) => {
  const userId = req.body.userId;
  console.log(req.file)
  User.findById(userId)
    .select("_id photo")
    .exec((err, user) => {
      if (err) {
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      } else if (!user) {
        res.status(400).send({
          success: false,
          error: "Unable to find user with the given ID",
        });
      }

      if (user.photo) {
        deleteProfilePicture('uploads.files', { _id: ObjectId(user.photo.id)});
        deleteProfilePicture('uploads.chunks', { files_id: ObjectId(user.photo.id)});
      }

      user.photo = req.file;
      user.save();
      res.status(200).send({ success: true, data: "Upload succeeded" });
    });
};

exports.getAmountOfItems = (req, res) => {
  const userId = req.query.userId;
  User.findById(userId)
    .select("_id items")
    .exec((err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      } else if (!user) {
        return res.status(400).json({
          success: false,
          error: "Unable to find user with the given id",
        });
      }
      let hint = 0;
      let skip = 0;
      let refresh = 0;
      user.items.forEach((item) => {
        switch (item.itemName) {
          case "Hint":
            hint += item.amount;
            break;
          case "Skip":
            skip += item.amount;
            break;
          case "Refresh":
            refresh += item.amount;
            break;
        }
      });
      res.send({ hint: hint, skip: skip, refresh: refresh });
    });
};

exports.updateStreak = async (userId) => {
  const now = new Date();
  const user = await User.findOneAndUpdate({ _id: userId }, { lastLogin: now });
  const lastLoginDate = new Date(user.lastLogin);
  const nextDate = new Date(user.lastLogin);
  nextDate.setDate(nextDate.getDate() + 1);
  const activeItem = findActiveItem(user, ITEM_NAME.FREEZE);
  if (now.toDateString() == lastLoginDate.toDateString()) {
    //same day, do nothing
    console.log("sameday");
    return;
  } else if (now.toDateString() == nextDate.toDateString()) {
    //inc streak by 1
    await User.findOneAndUpdate({ _id: userId }, { $inc: { streak: 1 } });
    console.log("inc streak");
    return;
  } else if (activeItem) {
    let nextDateOfExpiredDate = activeItem.expiredDate;
    nextDateOfExpiredDate.setDate(nextDateOfExpiredDate.getDate() + 1);
    if (now.toDateString() == nextDateOfExpiredDate.toDateString()) {
      //inc streak by 1
      await User.findOneAndUpdate({ _id: userId }, { $inc: { streak: 1 } });
      console.log("inc streak by freeze");
      return;
    } else {
      //set streak to 1
      await User.findOneAndUpdate({ _id: userId }, { streak: 1 });
      console.log("set 1");
      return;
    }
  } else {
    //set streak to 1
    await User.findOneAndUpdate({ _id: userId }, { streak: 1 });
    console.log("set 1");
    return;
  }
};

exports.buyItem = async (req, res) => {
  if(req.userId !== req.body.userId){
    return res.status(400).json({
      success: false,
      error: "userId not match userId that decoded from token!",
    });
  }
  
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }
  try {
    const item = await Item.findOne({ name: req.body.itemName }, (err, item) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.toString() });
      }
      if (!item) {
        return res.status(400).json({ success: false, error: "no items" });
      }
      return item;
    });
    
    const priceOfItem = item.price;
    const nameOfItem = item.name;
  
    const user = await User.findById(body.userId);
  
    if (user.coin < priceOfItem) {
      return res.status(400).json({
        success: false,
        error: "You don't have enough money to buy this item!",
      });
    }
    let userItem = user.items.find(item => item.itemName == nameOfItem);
  
    if (!userItem) {
      userItem = {
        itemName: nameOfItem,
        amount: 1,
      }
      user.items.push(userItem);
    } else {
      if (userItem.amount >= 999) {
        return res.status(400).json({
          success: false,
          error: "Number of item cannot exceed 999",
        });
      }
      userItem.amount++;
    }
    user.coin -= priceOfItem;
  
    await user.save();
    return res.status(200).json({ success: true, data: userItem });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
};

exports.updateCoinAndExp = (user, gameMode, difficulty) => {  
  const levelDictionary = levelSystem();
  const rankDictionary = rankSystem();
  let earnedCoins = 0, earnedExp = 0, modeSurplus = 1;

  // ------ Handle mode surplus ------ //
  switch (gameMode) {
    case GAME_MODE.CHALLENGE:
      modeSurplus = MODE_SURPLUS.CHALLENGE;
      break;
    case GAME_MODE.QUIZ:
      modeSurplus = MODE_SURPLUS.QUIZ;
      break;
    case GAME_MODE.GROUP:
      modeSurplus = MODE_SURPLUS.GROUP;
      break;
    default:
      modeSurplus = MODE_SURPLUS.PRACTICE;
      break;
  }

  // * Handle Earned coins and exp * //
  switch (difficulty) {
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

  let activeItem = findActiveItem(user, ITEM_NAME.DOUBLE);
  if (activeItem && Date.now() <= activeItem.expiredDate) {
    earnedExp *= 2;
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
  return { user: user, levelUp: levelUp, rankUp: rankUp, earnedCoins: earnedCoins, earnedExp: earnedExp };
};