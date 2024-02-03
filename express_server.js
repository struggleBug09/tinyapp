const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers.js");
const secretKey = generateRandomString();

app.use(cookieSession({
  name: 'session',
  keys: [secretKey]
}));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = {};
let usersCopy = {};

function generateRandomString() {
  const letter = 'abcdefghijklmnopqrstuvwxyz';
  let randomLetter = '';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
   randomLetter = letter[Math.floor(Math.random() * letter.length)];
   randomString += randomLetter;
  };
  return randomString;
}

function urlsForUser(id) {
  let urlsObj = {};
  for (let obj1 in urlDatabase) {
    if (urlDatabase[obj1].userID === id) {
      urlsObj[obj1] = {
        "longURL": urlDatabase[obj1].longURL,
        "userID": urlDatabase[obj1].userID
      }
    }
  }
  return urlsObj;
}

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "ssp23"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "ssp23"
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const templateVars = { 
    urls: urlsForUser(userID),
    users: req.session["users"],
    user: user
  };
  if (typeof user == "undefined") {
    return res.status(401).send("<h1>Please login/register to shorten URLs</h1>");
  }
  res.render("urls_index", templateVars);
  
});

app.get("/urls/new", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const templateVars = { 
    "urls": urlsForUser(userID),
    users: req.session["users"],
    user: user
  };
  if (typeof user == "undefined") {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const userID = req.session["userID"];
  const longURL = req.body.longURL;
  const user = users[userID];
  if (!urlDatabase[id]) {
    urlDatabase[id] = {};
  }
  urlDatabase[id].longURL = longURL;
  urlDatabase[id].userID = userID;
  if (typeof user == "undefined") {
    return res.status(401).send("<h1>Please login to shorten URLs</h1>");
  }
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    users: req.session["users"],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session["userID"];
  urls = urlsForUser(userID);
  delete urlDatabase[id];
  delete urls[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session["userID"];
  urlDatabase[id] = {
    longURL: req.body.longURL,
    "userID": userID
  };
  urls = urlsForUser(userID);
  urls[id] = {
    longURL: req.body.longURL,
    "userID": userID
  };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("Please use a valid email");
  }
  if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Please use the correct password.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  users = usersCopy;
  res.redirect("/login")
});

app.get("/register", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const templateVars = { user: user };
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register",(req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out both email and password section.");
  }
  const existingUser = getUserByEmail(req.body.email, users);
  if (existingUser) {
    return res.status(400).send("Please use a different email.");
  }
  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {
    "id": userID,
    "email": req.body.email,
    "password": hashedPassword
  }
  usersCopy = users;
  req.session.userID = userID;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("login");
});


