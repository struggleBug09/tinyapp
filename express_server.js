const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

let users = {};
let usersCopy = {};
let urls = {};

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
  for (let obj1 in urlDatabase) {
    if (urlDatabase[obj1].user_id === id) {
      urls[obj1] = {
        "longURL": urlDatabase[obj1].longURL,
        "userID": urlDatabase[obj1].user_id
      }
    }
  }
  return urls;
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
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    urls: urlsForUser(user_id),
    users: req.cookies["users"],
    user: user
  };
  if (typeof user == "undefined") {
    return res.status(401).send("<h1>Please login/register to shorten URLs</h1>");
  }
  res.render("urls_index", templateVars);
  
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    urls: urlDatabase,
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
  const user_id = req.cookies["user_id"];
  const longURL = req.body.longURL;
  const user = users[user_id];
  if (!urlDatabase[id]) {
    urlDatabase[id] = {};
  }
  urlDatabase[id].longURL = longURL;
  urlDatabase[id].user_id = user_id;
  if (typeof user == "undefined") {
    return res.status(401).send("<h1>Please login to shorten URLs</h1>");
  }
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
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
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  console.log("urls", urls)
  urlDatabase[id] = {
    longURL: req.body.longURL,
    "userID": urlDatabase[id].user_id
  };
  urlDatabase[id] = {
    longURL: req.body.longURL,
    "userID": urlDatabase[id].user_id
  };
  console.log("AFTER urlDatabase", urlDatabase)
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  for (let uniqueID in users) {
    if (users[uniqueID].email === req.body.email) {
      if (users[uniqueID].password == req.body.password) {
        let user_id = uniqueID;
        res.cookie("user_id", user_id);
        res.redirect("/urls");
      } else {
        return res.status(403).send("Please use the correct password.");
      }
    }
  }
  return res.status(403).send("Please use a valid email");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  users = usersCopy;
  res.redirect("/login")
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
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
  const user_id = generateRandomString();
  users[user_id] = {
    "id": user_id,
    "email": req.body.email,
    "password": req.body.password
  }
  usersCopy = users;
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("login");
});