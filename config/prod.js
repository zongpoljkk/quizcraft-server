// prod.js - production keys here!!!
module.exports = {
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_URI,
  cookieKey: process.env.COOKIE_KEY,
  secret: process.env.SECRET,
  mcvClientId: process.env.MCV_CLIENT_ID,
  mcvClientSecret: process.env.MCV_CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
  cors_origin: process.env.CORS_ORIGIN
};

