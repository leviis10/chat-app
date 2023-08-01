function generateMessage(username, text) {
  return {
    username,
    text,
    createdAt: new Date().toISOString(),
  };
}

module.exports = generateMessage;
