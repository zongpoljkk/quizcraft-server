const Report = require("../models/Report");

exports.addReport = (req, res) => {
  const report = new Report(req.body);
  report.save((err, newReport) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!newReport)
      return res.status(400).json({ success: false, error: "no data" });
    else return res.status(200).json({ success: true, data: "Successfully reported the problem" });
  });
};
