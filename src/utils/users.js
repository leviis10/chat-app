const users = [];

// add user
function addUser({ id, username, room }) {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return { err: "Username and room are required!" };
  }

  if (users.some((user) => user.username === username && user.room === room)) {
    return { err: "Username is in use!" };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
}

// remove user
function removeUser(id) {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return;
  }
  return users.splice(userIndex, 1)[0];
}

// get user
function getUser(id) {
  return users.find((user) => user.id === id);
}

// get all users
function getUsersInRoom(room) {
  return users.filter((user) => user.room === room);
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
