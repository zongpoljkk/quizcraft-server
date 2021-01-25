const Problem = require("../models/Problem");
const User = require("../models/User");
const { ITEM_NAME } = require("../utils/const");

exports.getHintByProblemId = async (req, res) => {
  const userId = req.userId;
  const problemId = req.query.problemId;
  var user = await User.findOne(
    { _id: userId }, 
    { items:1, usedItems:1}
  );

  var problem = await Problem.findById(problemId);
  if (!problem) {
    return res.status(400).json({ success: false, error: "problem not found" });
  }
  let foundUsedItem = false;
  for (i in problem.usedItems) {
    if (problem.usedItems[i].itemName = ITEM_NAME.HINT) {
      problem.usedItems[i].amount++;
      foundUsedItem = true;
      break;
    }
  }
  if (!foundUsedItem) {
    problem.usedItems.push({
      itemName: ITEM_NAME.HINT,
      amount: 1
    })
  }

  // * Save used item * //
  foundUsedItem = false;
  for (i in user.usedItems) {
    if (user.usedItems[i].itemName = ITEM_NAME.HINT) {
      user.usedItems[i].problems.push(problemId);
      user.usedItems[i].amount++;
      foundUsedItem = true;
      break;
    }
  }
  if (!foundUsedItem) {
    user.usedItems.push({
      itemName: ITEM_NAME.HINT,
      amount: 1,
      problems: problemId
    })
  }
  //save to database
  await user.save();
  await problem.save();
  return res.status(200).json({ success: true, data: { problemId: problemId, body: problem.hintBody }});
}