const express = require("express");

const router = express.Router();

router.post("/login", (req, res) => {
    res.json({
        success: true,
        message: "Login Successful"
    });
});

router.get("/products", (req, res) => {
    res.json({
        success: true,
        message: "Products fetched"
    });
});

router.get("/profile", (req, res) => {
    res.json({
        success: true,
        message: "Profile fetched"
    });
});

router.post("/payment", (req, res) => {
    res.json({
        success: true,
        message: "Payment Successful"
    });
});

module.exports = router;