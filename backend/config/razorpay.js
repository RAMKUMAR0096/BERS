const Razorpay = require('razorpay');
var razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECERT_KEY_ID })

module.exports = razorpay