require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST /
app.post("/", (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.sendFile(path.join(__dirname, "public", "failure.html"));
  }

  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };

  const jsonData = JSON.stringify(data);
  const dc = process.env.MAILCHIMP_API_KEY.split('-')[1];
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}`;
  const options = {
    method: "POST",
    auth: `anystring:${process.env.MAILCHIMP_API_KEY}`
  };

  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.sendFile(path.join(__dirname, "public", "success.html"));
    } else {
      res.sendFile(path.join(__dirname, "public", "failure.html"));
    }
  });

  request.on("error", (err) => {
    console.error(err);
    res.sendFile(path.join(__dirname, "public", "failure.html"));
  });

  request.write(jsonData);
  request.end();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});