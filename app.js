const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config({ path: "./config.env" });
const port = process.env.PORT || 3000;
const apiKey = process.env.GEOLOCATION_API_KEY;

app.use("/api/hello", async (req, res, next) => {
  let visitorName = req.query.visitor_name;

  if (
    (visitorName.startsWith('"') && visitorName.endsWith('"')) ||
    (visitorName.startsWith("'") && visitorName.endsWith("'"))
  ) {
    visitorName = visitorName.slice(1, -1);
  }
  let responseIP, responseGeo;
  try {
    responseIP = await axios("https://get.geojs.io/v1/ip/geo.json");
    responseGeo = await axios(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${responseIP.data.latitude},${responseIP.data.longitude}`
    );
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch data",
    });
  }

  res.status(200).json({
    client_ip: responseIP.data.ip,
    location: responseIP.data.city,
    greeting: `Hello, ${visitorName}!, the temperature is ${responseGeo.data.current.temp_c} degrees Celcius in ${responseIP.data.city}`,
  });
});

app.all("*", (req, res, next) => {
  console.log("yeah man");
  console.log(`${req.originalUrl} not found in my server`);
  res.status(400).json({
    message: `${req.originalUrl} not found in my server`,
  });
});

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
