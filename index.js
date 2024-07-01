const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

dotenv.config({ path: "./config.env" });
const port = process.env.PORT || 3000;
const apiKey = process.env.GEOLOCATION_API_KEY;

app.get("/", (req, res, next) => {
  console.log("root route");
  res.status(200).json({
    message: "Hello welcome",
  });
});

app.use("/api/hello", async (req, res, next) => {
  console.log("api/hello");
  let visitorName = req.query.visitor_name;
  const clientIP = req.ip === "::1" ? "102.90.45.226" : req.ip;

  if (
    (visitorName.startsWith('"') && visitorName.endsWith('"')) ||
    (visitorName.startsWith("'") && visitorName.endsWith("'"))
  ) {
    visitorName = visitorName.slice(1, -1);
  }
  let responseGeo;
  try {
    responseGeo = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${clientIP}`
    );
    console.log(responseGeo.data);
  } catch (err) {
    // console.log(err);
    return res.status(500).json({
      message: "Failed to fetch data",
    });
  }

  const location = responseGeo.data.location.region;
  const temp_c = responseGeo.data.current.temp_c;

  res.status(200).json({
    client_ip: clientIP,
    location,
    greeting: `Hello, ${visitorName}!, the temperature is ${temp_c} degrees Celsius in ${location}`,
  });
});

app.all("*", (req, res, next) => {
  // console.log("yeah man");
  // console.log(`${req.originalUrl} not found in my server`);
  res.status(400).json({
    message: `${req.originalUrl} not found in my server`,
  });
});

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
