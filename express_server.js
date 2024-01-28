// const express = require("express");
// const app = express();
// const PORT = 8080;
// const cookieParser = require("cookie-parser");

// app.use(cookieParser());
// app.set("view engine", "ejs");
// app.use(express.urlencoded({ extended: true }));

// function generateRandomString() {
//   const letter = 'abcdefghijklmnopqrstuvwxyz';
//   let randomLetter = ''
//   let randomString = '';
//   for (let i = 0; i < 6; i++) {
//    randomLetter = letter[Math.floor(Math.random() * letter.length)];
//    randomString += randomLetter;
//   }
//   return randomString;
// }

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",

// };

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}!`);
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

// app.get("/urls", (req, res) => {
//   const templateVars = { 
//     urls: urlDatabase,
//     username: req.cookies["username"]
//   };
//   res.render("urls_index", templateVars);
// });

// app.get("/urls/new", (req, res) => {
//   const templateVars = { username: req.cookies["username"]};
//   res.render("urls_new", templateVars);
// });

// app.post("/urls", (req, res) => {
//   const id = generateRandomString();
//   const longURL = req.body.longURL;
//   urlDatabase[id] = longURL;
//   res.redirect(`/urls/${id}`);
// });

// app.get("/urls/:id", (req, res) => {
//   const templateVars = { 
//     id: req.params.id,
//     longURL: urlDatabase[req.params.id],
//     username: req.cookies["username"]
//   };
//   res.render("urls_show", templateVars);
// });

// app.get("/u/:id", (req, res) => {
//   const id = req.params.id;
//   const longURL = urlDatabase[id];
//   res.redirect(longURL);
// });

// app.post("/urls/:id/delete", (req, res) => {
//   const id = req.params.id;
//   delete urlDatabase[id];
//   res.redirect("/urls");
// });

// app.post("/urls/:id", (req, res) => {
//   const id = req.params.id;
//   urlDatabase[id] = req.body.longURL;
//   res.redirect("/urls");
// });

// app.post("/login", (req, res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect("/urls");
// });

// app.post("/logout", (req, res) => {
//   res.clearCookie("username");
//   res.redirect("/urls")
// });

// app.get("/register",(req, res) => {
//   const templateVars = { username: req.cookies["username"]};
//   res.render("register", templateVars);
// });

const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  const letter = 'abcdefghijklmnopqrstuvwxyz';
  let randomLetter = ''
  let randomString = '';
  for (let i = 0; i < 6; i++) {
   randomLetter = letter[Math.floor(Math.random() * letter.length)];
   randomString += randomLetter;
  }
  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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
    urls: urlDatabase,
    users: req.cookies["users"],
    user: user
  };
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
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    users: req.cookies["users"],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { user: user };
  res.render("register", templateVars);
});

app.post("/register",(req, res) => {
  const user_id = generateRandomString();
  users[user_id] = {
    "email": req.body.email,
    "password": req.body.password,
  }
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});