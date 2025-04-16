const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const port = 3000;
app.listen(port);

console.log("Server Started");

app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const url = process.env.MONGO_URL;

mongoose.connect(url, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MongoDB Connected");
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  notes: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
});

const User = mongoose.model("User", userSchema, "users");

const u = new User({
  username: "john",
  notes: [{ title: "foo", description: "bar" }],
});

app.get("/users", (req, res) => {
  User.find({}, (error, user) => {
    if (error) {
      res.send(error);
    } else {
      res.send(user);
    }
  });
});

app.get("/user/:username", (req, res) => {
  User.findOne({ username: req.params.username }, (error, user) => {
    if (error) {
      res.send(error);
    } else {
      res.send(user);
    }
  });
});

app.get("/notes", (req, res) => {
  User.find({}, (error, user) => {
    if (error) {
      res.send(error);
    } else {
      let notes = [];
      user.forEach((u) => {
        u.notes.forEach((note) => {
          notes.push(note);
        });
      });
      res.send(notes);
    }
  });
});

// app.get("/note/:title", (req, res) => {
//   User.find({}, (error, users) => {
//     if (error) {
//       res.send(error);
//     } else{

//     for (let u of users) {
//       for (let note of u.notes) {
//         if (note.title === req.params.title) {
//           return res.send(note);
//         }
//       }
//     }

//     res.send("Note not found");
// }
//   });
// });

app.get("/note/:title", (req, res) => {
  User.findOne({ "notes.title": req.params.title }, (error, user) => {
    if (error) {
      return res.send(error);
    } else
    if (!user) {
      return res.send("Note not found");
    }

    const note = user.notes.find((note) => note.title === req.params.title);

    if (!note) {
      return res.send("Note not found");
    }

    res.send(note);
  });
});

app.post("/user",(req,res)=>{
  const u = new User({username:req.body.username,notes:req.body.notes})
  u.save((error,result)=>{
    if(result)
      res.send(result)
    else
      res.send(error)
  })
})

app.post("/note",(req,res)=>{
  //step 1: create a new note
  const note = {title:req.body.title,description:req.body.description}

  //step 2: find the user who is the author of note
  let author_username = req.body.author
  User.findOne({username:author_username},(error,author)=>{
    if(author){
      author.notes.push(note)
      //step 3: save the author
      author.save((error,result)=>{
        if(result)
          res.send(result)
        else
          res.send(error)
      })

    }
    else{
      res.send("User not found...")
    }
  })


})

app.delete("/user/:username",(req,res)=>{
  User.findOneAndDelete({username:req.params.username},(error,result)=>{
    if(result)
      res.send(result)
    else
      res.send(error)
  })
})

app.delete("/note",(req,res)=>{
  User.findOne({"notes.title":req.body.title},(error,author)=>{
    if(author){
      author.notes= author.notes.filter(n=>{return n.title !== req.body.title})
      author.save()
      res.send("Note deleted...")
    }
    else{
      res.send("Note not found..")
    }
  })
})

// u.save((error,result) => {
//     if(error) {
//         console.log(error)
//     }
//     else {
//         console.log(result)
//     }
// })
