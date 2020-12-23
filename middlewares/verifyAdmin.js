const ADMIN = 'ADMIN'

const isAdmin = async (req, res, next) => {
  if (req.role != ADMIN) {
    return res.status(401).json({ success: false, error: "Access Denied" });
  }
  next();
}

const adminOnly = (req, res, next) => {
  isAdmin(req,res,next);
};

module.exports = adminOnly;