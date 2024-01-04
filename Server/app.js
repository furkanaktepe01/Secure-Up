const express = require("express");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors =  require("cors");


const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const File = require("./db/fileModel");
const auth = require("./auth");

dbConnect();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Server's Response!" });
  next();
});

app.post("/register", (request, response) => {

  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {

      const user = new User({
        username: request.body.username,
        password: hashedPassword,
        publicKey: request.body.publicKey
      });

      user
        .save()
        .then((result) => {
          response.status(201).send({
            result
          });
        })
        .catch((error) => {
          response.status(500).send({
            error
          });
        });
    })
    .catch((e) => {
      response.status(500).send({
        e
      });
    });
});

app.post("/login", (request, response) => {    

  User.findOne({ username: request.body.username })

    .then((user) => {

      bcrypt
        .compare(request.body.password, user.password)
        .then((passwordCheck) => {                  

          if(!passwordCheck) {
            return response.status(400).send({
              error
            });
          }

          const token = jwt.sign(
            {
              id: user._id,
              username: user.username,
              publicKey: user.publicKey
            },
            process.env.JWT_SECRET,
            { expiresIn: "5h" }
          );

          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        .catch((error) => {
          response.status(400).send({
            error
          });
        });
    })

    .catch((e) => {
      response.status(404).send({
        message: "Username not found",
        e,
      });
    });
});

app.get("/users", auth, (request, response) => {
  response.send(request.user);
});

app.get("/public-key-of/:username", auth, (request, response) => {    
  
  User.findOne({ username: request.params.username })

    .then((user) => {  

      response.send(user.publicKey);
    })
    .catch((e) => {
      response.status(404).send({
        message: "Username not found",
        e,
      });
    });
});

app.post("/file", auth, (request, response) => {    

  const file = new File({
    fileName: request.body.fileName,
    fileType: request.body.fileType,
    cid: request.body.cid,
    from: request.body.from,
    to: request.body.to,
    chunkCount: request.body.chunkCount
  });

  file
    .save()
    .then((result) => {
      response.status(201).send({
        result
      });
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

app.get("/files/uploaded", auth, (request, response) => {

  File.find({ $and: [ { to: request.user.username }, { from: request.user.username } ] })

    .then((files) => { 

      const { username, password } = request.user;

      response.send({ username, password, files });
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

app.get("/files/received", auth, (request, response) => {

  File.find({ $and: [ { to: request.user.username }, { from: { $ne: request.user.username } } ] })

    .then((files) => { 

      const { username, password } = request.user;

      response.send({ username, password, files });
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

app.get("/files/sent", auth, (request, response) => {

  File.find({ $and: [ { from: request.user.username }, { to: { $ne: request.user.username } } ] })

    .then((files) => { 

      const { username, password } = request.user;

      response.send({ username, password, files });
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

app.post("/signatures", (request, response) => {

  File.updateOne({ cid: request.body.cid }, {
    $set: {
      receiptSignature: request.body.receiptSignature
    }
  })
  
    .then((result) => { 

      response.send({result});
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

app.post("/signatures/check", (request, response) => {

  File.find({ cid: request.body.cid })
    
    .then((result) => {

      const isSigned = result[0].receiptSignature.length != 0;   

      response.send(isSigned);
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

app.post("/signature-of", (request, response) => {

  File.find({ cid: request.body.cid })
    
    .then((result) => {

      response.send(result);
    })
    .catch((error) => {
      response.status(500).send({
        error
      });
    });
});

module.exports = app;
