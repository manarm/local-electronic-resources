const express = require("express"),
      router = express.Router();
      
router.get("/error", (req, res) => {
    res.render("error");
});

module.exports = router;