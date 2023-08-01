function generateLocationMessage(username, locationURL) {
  return {
    username,
    locationURL,
    createdAt: new Date().toISOString(),
  };
}

module.exports = generateLocationMessage;
