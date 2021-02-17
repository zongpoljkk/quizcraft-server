const { SSE_TOPIC } = require("../utils/const");
const { v4:uuidv4 } = require('uuid');

exports.subscribers = [];

exports.test = [];

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
  const processId = uuidv4().substring(0, 8);
  
  this.subscribers = this.subscribers.filter(s => s.userId !== userId);
  
  //for debug
  this.test = this.test.filter(s => s.userId !== userId);

  const initSubscribeData = {
    processId,
    groupId,
    startProcessAt: Date.now(),
    type: SSE_TOPIC.INIT_CONNECTION
  };
  // ! Important: \n\n is so important for send data
  const data = `data: ${JSON.stringify(initSubscribeData)}\n\n`;
  res.write(data);

  // Generate subscriber data bind userId and groupId with HTTP response object
  const newSubscriber = {
    processId,
    groupId,
    userId,
    res
  };

  //for debug
  const newTest = {
    processId,
    groupId,
    userId,
  };
  this.test.push(newTest);

  this.subscribers.push(newSubscriber);

  //for debug
  console.log("init",this.subscribers.length,userId)
  console.log(this.test)
  // When process closes connection we update the subscriber list
  // avoiding the disconnected one
  req.on("close", () => {
    // for debug
    console.log(`${userId} connection closed on close`);
    this.subscribers = this.subscribers.filter(s => s.processId !== processId);
    this.test = this.test.filter(s => s.processId !== processId);
  });
}

exports.sendEventToGroupMember = async (groupId, sseTopic) => {
  num++;
  const message = `${num}`;

  //for debig
  console.log(this.subscribers.length)
  console.log(this.test)

  // Create message to send data.
  const event = {
    message,
    type: sseTopic
  };

  //send to people in group
  this.subscribers.forEach(s => {
    if(s.groupId == groupId) {
      s.res.write(`data: ${JSON.stringify(event)}\n\n`)
      console.log("send to group",s.userId,sseTopic,message)
    }
  });
  console.log("Send-Event-To-Group", groupId, sseTopic,message,"\n");
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
    if(s.userId == userId) {
      s.res.write(`data: ${JSON.stringify(event)}\n\n`)
      console.log("send to user",s.userId,sseTopic,message)
    }
  });
  console.log("Send-Event-To-User", userId, sseTopic,message,"\n");
}

exports.closeConnection = async (req, res) => {
  const userId = req.userId;
  // for debug
  console.log(`${userId} connection closed`);
  this.subscribers = this.subscribers.filter(s => s.userId !== userId);
  this.test = this.test.filter(s => s.userId !== userId);
  res.status(200).json({
    status: 200,
    message: `Close connection on user id : ${userId} success`
  });
}