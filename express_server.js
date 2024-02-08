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

const urlDatabase = {};

//Early 'to do' from exercise. Can be removed, but not explicitely told
app.get("/", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("login");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Early 'to do' from exercise. Can be removed, but not explicitely told
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Early 'to do' from exercise. Can be removed, but not explicitely told
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
   //Makes sure we only send user specific urls to templateVars with urlsForUser function
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
  //Same as GET/urls for data we're passing to templateVars
  const templateVars = { 
    "urls": urlsForUser(userID),
    users: req.session["users"],
    user: user
  };
  //Redirects if the user is not logged in
  if (typeof user == "undefined") {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //Adds our data to our database with our current session
  const id = generateRandomString();
  const userID = req.session["userID"];
  const longURL = req.body.longURL;
  const user = users[userID];
  urlDatabase[id] = {
    longURL: longURL,
    userID: userID
  };
  if (typeof user === "undefined") {
    return res.status(401).send("<h1>Please login to shorten URLs</h1>");
  }

  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const id = req.params.id;
  //This checks if the url exists in the database and sends an error msg if not
  if (!urlDatabase[id]) {
    return res.status(403).send("<h1>This link does not exist</h1>");
  }
  //Error message if user is not logged in
  if (typeof user == "undefined") {
    return res.status(401).send("<h1>Please log in. This link is invalid</h1>");
  }
  //Error message if user is logged in but not owner of link
  if (urlDatabase[id].userID !== userID) {
    return res.status(401).send("<h1>You do not have access to this page</h1>");
  }
  const templateVars = { 
    id: id,
    longURL: urlDatabase[req.params.id].longURL,
    users: req.session["users"],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  console.log("Requested id:", id);
  
  // Check if id exists in urlDatabase
  if (urlDatabase[id] && urlDatabase[id].longURL) {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("<h1>URL not found</h1>");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session["userID"];
  urls = urlsForUser(userID);
  //Remove data from database
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
  //Checks if email exists in the database, returns an error if not
  if (!user) {
    return res.status(403).send("Please use a valid email");
  }
  //Redirects to urls on a successful login
  if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Please use the correct password.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login")
});

app.get("/register", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  const templateVars = { user: user };
  //If user is already logged in, will redirect to /urls
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register",(req, res) => {
  //Returns error if email/password are not filled out
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out both email and password section.");
  }
  const existingUser = getUserByEmail(req.body.email, users);
  //Returns error if user is loggin in with an existing email with wrong password
  if (existingUser) {
    return res.status(400).send("Please use a different email.");
  }
  //Generates the user and saves the user data
  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {
    "id": userID,
    "email": req.body.email,
    "password": hashedPassword
  }
  //Sets our session and redirects to /urls
  req.session.userID = userID;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session["userID"];
  const user = users[userID];
  //Redirects to urls if user is already logged in
  if (typeof user !== "undefined") {
    res.redirect("/urls");
  }
  res.render("login");
});


