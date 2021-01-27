const { SSE_TOPIC } = require("../utils/const");

exports.subscribers = [];

var num = 0;

// Middleware for GET /api/group/event endpoint
exports.groupEventsHandler = (req, res, next) => {
  // Mandatory headers and http status to keep connection open
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache"
  };
  res.writeHead(200, headers);

  // After client opens connection send init data
  const groupId = req.query.groupId;
  const userId = req.userId;
  const initSubscribeData = {
    groupId,
    startProcessAt: Date.now(),
    type: SSE_TOPIC.INIT_CONNECTION
  };
  // ! Important: \n\n is so important for send data
  const data = `data: ${JSON.stringify(initSubscribeData)}\n\n`;
  res.write(data);

  // Generate subscriber data bind userId and groupId with HTTP response object
  const newSubscriber = {
    groupId,
    userId,
    res
  };
  this.subscribers.push(newSubscriber);

  // When process closes connection we update the subscriber list
  // avoiding the disconnected one
  req.on("close", () => {
    // for debug
    // console.log(`${userId} connection closed`);
    this.subscribers = this.subscribers.filter(s => s.userId !== userId);
  });
}

exports.sendEventToGroupMember = async (groupId, sseTopic) => {
  num++;
  const message = `${num}`;

  // Create message to send data.
  const event = {
    message,
    type: sseTopic
  };

  //send to people in group
  this.subscribers.forEach(s => {
    if(s.groupId === groupId) s.res.write(`data: ${JSON.stringify(event)}\n\n`)
  });
}

exports.sendEventToUser = async (userId, sseTopic) => {
  num++;
  const message = `${num}`;

  // Create message to send data.
  const event = {
    message,
    type: sseTopic
  };

  //send to user
  this.subscribers.forEach(s => {
    if(s.userId === userId) s.res.write(`data: ${JSON.stringify(event)}\n\n`)
  });
}

exports.closeConnection = async (req, res) => {
  const userId = req.userId;
  // for debug
  // console.log(`${userId} connection closed`);
  this.subscribers = this.subscribers.filter(s => s.userId !== userId);
  res.status(200).json({
    status: 200,
    message: `Close connection on user id : ${userId} success`
  });
}