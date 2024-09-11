// ==================== INITIALIZE EXPRESS APP ====================
const express = require("express");
const app = express();

// ====================  GLOBAL MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // TO ACCESS URL FORM ENCODED
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors()); // ALLOW HTTP REQUESTS LOCAL HOSTS

// ====================  Required Module ====================
const auth = require("./routes/Auth");
const featured = require("./routes/FeaturedProducts");
const shop = require("./routes/Shop");
const discounts = require("./routes/Discounts");
const cart = require("./routes/Cart");


// ====================  RUN THE APP  ====================
app.listen(4000, "localhost", () => {
  console.log("SERVER IS RUNNING ");
});

// ====================  API ROUTES [ ENDPOINTS ]  ====================
app.use("/auth", auth);
app.use("/featured", featured);
app.use("/shop", shop);
app.use("/discounts", discounts);
app.use("/cart", cart);



