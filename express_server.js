const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

let users = {};
let usersCopy = {};

function generateRandomString() {
  const letter = 'abcdefghijklmnopqrstuvwxyz';
  let randomLetter = '';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
   randomLetter = letter[Math.floor(Math.random() * letter.length)];
   randomString += randomLetter;
  }
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
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = { 
    urls: urlsForUser(userID),
    users: req.cookies["users"],
    user: user
  };
  if (typeof user == "undefined") {
    return res.status(401).send("<h1>Please login/register to shorten URLs</h1>");
  }
  res.render("urls_index", templateVars);
  
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = { 
    "urls": urlsForUser(userID),
    users: req.cookies["users"],
    user: user
  };
  if (typeof user == "undefined") {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const userID = req.cookies["userID"];
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
  const userID = req.cookies["userID"];
  const user = users[userID];
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    users: req.cookies["users"],
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
  const userID = req.cookies["userID"];
  urls = urlsForUser(userID);
  delete urlDatabase[id];
  delete urls[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies["userID"];
  urlDatabase[id] = {
    longURL: req.body.longURL,
    "userID": userID
  };
  urls = urlsForUser(userID);
  urls[id] = {
    longURL: req.body.longURL,
    "userID": userID
  };
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  for (let uniqueID in users) {
    if (users[uniqueID].email === req.body.email) {
      if (users[uniqueID].password == req.body.password) {
        let userID = uniqueID;
        res.cookie("userID", userID);
        res.redirect("/urls");
      } else {
        return res.status(403).send("Please use the correct password.");
      }
    }
  }
  return res.status(403).send("Please use a valid email");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  users = usersCopy;
  res.redirect("/login")
});

app.get("/register", (req, res) => {
  const userID = req.cookies["userID"];
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
  const getUserByEmail = Object.values(users).some(user => user.email === req.body.email);
  if (getUserByEmail) {
    return res.status(400).send("Please use a different email.");
  }
  const userID = generateRandomString();
  users[userID] = {
    "id": userID,
    "email": req.body.email,
    "password": req.body.password
  }
  usersCopy = users;
  res.cookie("userID", userID);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("login");
});

