const Item = require("../models/Item");

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
          error: "Unable to find user with the given ID",
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
          from: "uploads.chunks",
          localField: "image.id",
          foreignField: "files_id",
          as: "image_info",
        },
      },
      { $unwind: "$image_info" },
      {
        $lookup: {
          from: "uploads.chunks",
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