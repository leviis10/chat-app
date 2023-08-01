const socket = io();

// Element
const chatSidebarEl = document.querySelector(".chat__sidebar");
const messagesEl = document.querySelector(".chat__messages");
const messageFormEl = document.querySelector(".message-form");
const messageFormInputEl = document.querySelector(".message-form__input");
const btnSendMessageEl = document.querySelector(".btn--send-message");
const btnSendLocationEl = document.querySelector(".btn--send-location");

// Template element
const messageTemplate = document.querySelector(".message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  ".location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector(".sidebar-template").innerHTML;

// Query string parse
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Helper function
function autoScroll() {
  // Get latest new message element
  const newMessageEl = messagesEl.lastElementChild;

  // Get height latest new message element
  const newMessageElStyles = getComputedStyle(newMessageEl);
  const newMessageElMarginBottom = parseInt(newMessageElStyles.marginBottom);
  const newMessageElHeight =
    newMessageEl.offsetHeight + newMessageElMarginBottom;

  // Get visible height
  const visibleHeight = messagesEl.offsetHeight;

  // Get actual height
  const actualHeight = messagesEl.scrollHeight;

  // Get scroll bar location
  const scrollOffset = messagesEl.scrollTop + visibleHeight;

  // Auto scroll if the actual height - new message element height is less than or equal to scroll bar location
  if (actualHeight - newMessageElHeight <= scrollOffset) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

// Event listener
messageFormEl.addEventListener("submit", (e) => {
  // Prevent default behaviour
  e.preventDefault();

  // Variable definition
  const message = e.target.elements.message.value;

  // Disable submit button
  btnSendMessageEl.setAttribute("disabled", true);

  // Emit event to server
  socket.emit("sendMessage", message, (err) => {
    if (err !== undefined) {
      return;
    }
  });

  // Enable submit button and clear input value
  btnSendMessageEl.removeAttribute("disabled");
  messageFormInputEl.value = "";
  messageFormInputEl.focus();
});

btnSendLocationEl.addEventListener("click", () => {
  // Check browser geolocation API
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  // Disable send location button
  btnSendLocationEl.setAttribute("disabled", true);

  // Fetch client location
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude });
  });

  // Enable send location button
  btnSendLocationEl.removeAttribute("disabled");
});

socket.on("message", (message) => {
  // Destructuring message object
  const { username, text, createdAt } = message;

  // Render incoming message
  const markup = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format("HH:mm"),
  });
  messagesEl.insertAdjacentHTML("beforeend", markup);

  // Auto scroll if message content is to long
  autoScroll();
});

socket.on("locationMessage", (location) => {
  // Destructuring location object
  const { username, locationURL, createdAt } = location;

  // Render location-message-template
  const markup = Mustache.render(locationMessageTemplate, {
    username,
    locationURL,
    createdAt: moment(createdAt).format("HH:mm"),
  });
  messagesEl.insertAdjacentHTML("beforeend", markup);

  // Auto scroll if message content is to long
  autoScroll();
});

socket.on("roomData", (data) => {
  // Destructuring data
  const { room, users } = data;

  // Render new user list markup
  const markup = Mustache.render(sidebarTemplate, { room, users });
  chatSidebarEl.innerHTML = markup;
});

// client initialization
socket.emit("join", { username, room }, (err) => {
  if (err) {
    alert(err);
    location.href = "/";
  }
});
