const express = require('express');
const router = express.Router();
const { getAllCustomers, createUser } = require('../controllers/customers');
const { protect, admin } = require('../middleware/auth');


router.get("/", protect, getAllCustomers);
router.post("/", protect, createUser);

module.exports = router;