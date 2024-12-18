const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profilePics");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

let app = express();
app.use(cors());
app.use(express.json()); //to collect JSON data from req and assigns to req.body
app.use(express.urlencoded()); //to collect URLEncoded data from req and assigns to req.body
app.use("/profilePics", express.static("profilePics"));
app.use(express.static(path.join(__dirname, "./client/build")));
let authorize = (req, res, next) => {
  console.log("inside authorise emw");
  let token = req.headers["authorization"];
  console.log(token);
  next();
};

app.use(authorize);

app.get("*", (req, res) => {
  res.sendFile("./client/build/index.html");
});

app.post("/signup", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  console.log(req.file);

  let hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      email: req.body.email,
      password: hashedPassword,
      mobileNo: req.body.mobileNo,
      profilePic: req.file.path,
    });

    await User.insertMany([newUser]);

    res.json({ status: "success", msg: "User created successfully." });
  } catch (err) {
    res.json({ status: "failure", msg: "Unable to create account." });
  }
});

app.post("/login", upload.none(), async (req, res) => {
  console.log(req.body);

  let userDetailsArr = await User.find().and({ email: req.body.email });

  console.log(userDetailsArr);
  let isPasswordCorrect = await bcrypt.compare(
    req.body.password,
    userDetailsArr[0].password
  );

  if (userDetailsArr.length > 0) {
    if (isPasswordCorrect == true) {
      let token = jwt.sign(
        {
          email: req.body.email,
          password: req.body.password,
        },
        "abracadabra"
      );

      let dataToClient = {
        firstName: userDetailsArr[0].firstName,
        lastName: userDetailsArr[0].lastName,
        age: userDetailsArr[0].age,
        email: userDetailsArr[0].email,
        mobileNo: userDetailsArr[0].mobileNo,
        profilePic: userDetailsArr[0].profilePic,
        token: token,
      };

      res.json({ status: "success", data: dataToClient });
    } else {
      res.json({ status: "failure", msg: "Invalid Password" });
    }
  } else {
    res.json({ status: "failure", msg: "Invalid Email" });
  }
});

app.put("/updateProfile", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);

  try {
    if (req.body.firstName.trim().length > 0) {
      console.log("inside updating firstname");
      await User.updateMany(
        { email: req.body.email },
        { firstName: req.body.firstName }
      );
    }

    if (req.body.lastName.trim().length > 0) {
      console.log("inside updating lastname");
      await User.updateMany(
        { email: req.body.email },
        { lastName: req.body.lastName }
      );
    }

    if (req.body.age > 0) {
      console.log("inside updating age");
      await User.updateMany({ email: req.body.email }, { age: req.body.age });
    }

    if (req.body.password) {
      console.log("inside updating password");
      await User.updateMany(
        { email: req.body.email },
        { password: req.body.password }
      );
    }

    if (req.body.mobileNo) {
      console.log("inside updating mobileno");
      await User.updateMany(
        { email: req.body.email },
        { mobileNo: req.body.mobileNo }
      );
    }

    if (req.file) {
      console.log("inside updating profilepic");
      await User.updateMany(
        { email: req.body.email },
        { profilePic: req.file.path }
      );
    }

    res.json({ status: "success", msg: "Profile updated successfully." });
  } catch (err) {
    res.json({ status: "failure", msg: "Unable to update profile", err: err });
  }
});

app.delete("/deleteProfile", async (req, res) => {
  console.log(req.query);

  try {
    await User.deleteMany({ email: req.query.email });
    res.json({ status: "success", msg: "Profile deleted successfully." });
  } catch (err) {
    res.json({ status: "failure", msg: "Unable to delte profile." });
  }
});

app.post("/validateToken", upload.none(), async (req, res) => {
  console.log(req.body.token);

  let decryptedToken = jwt.verify(req.body.token, "abracadabra");

  console.log(decryptedToken);

  let userDetailsArr = await User.find().and({ email: decryptedToken.email });

  console.log(userDetailsArr);

  if (userDetailsArr.length > 0) {
    if (userDetailsArr[0].password == decryptedToken.password) {
      let dataToClient = {
        firstName: userDetailsArr[0].firstName,
        lastName: userDetailsArr[0].lastName,
        age: userDetailsArr[0].age,
        email: userDetailsArr[0].email,
        mobileNo: userDetailsArr[0].mobileNo,
        profilePic: userDetailsArr[0].profilePic,
      };

      res.json({ status: "success", data: dataToClient });
    } else {
      res.json({ status: "failure", msg: "Invalid Password" });
    }
  } else {
    res.json({ status: "failure", msg: "Invalid Email" });
  }
});

app.listen(process.env.port, () => {
  console.log(`Listening to port ${process.env.port}`);
});

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  email: String,
  password: String,
  mobileNo: String,
  profilePic: String,
});

let User = new mongoose.model("users", userSchema, "users");

let insertDataIntoDB = () => {
  try {
    let newUser = new User({
      firstName: "Madhavi",
      lastName: "Latha",
      age: 20,
      email: "madhavilatha@gmail.com",
      password: "madhavi",
      mobileNo: "+91-9988776655",
    });

    User.insertMany([newUser]);
    console.log("inserted data into db successfully");
  } catch (err) {
    console.log("Unable to insert data into db");
  }
};

let connectToMDB = async () => {
  try {
    mongoose.connect(process.env.mdburl);

    console.log("Successfully connected to MDB");
  } catch (err) {
    console.log("Unable to connect to MDB");
    console.log(err);
  }
};

connectToMDB();
