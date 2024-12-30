const mongoose = require('mongoose');

// Schema for individual product details in the order
const productDetailsSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    brandName: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }], // Assuming multiple images can be associated
    quantity: { type: Number, required: true },
});

// Schema for payment details in the order
const paymentDetailsSchema = new mongoose.Schema({
    paymentId: { type: String, required: true },
    payment_method_type: { type: String, required: true },
    payment_status: { type: String, required: true },
});

// Main order schema
const orderSchema = new mongoose.Schema({
    productDetails: [productDetailsSchema], // Embedding product details schema
    email: { type: String, required: true, trim: true },
    userId: { type: String, required: true },
    userAddress: { // Schema for user address details
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        pincode: { type: String, required: true },
        locality: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        landmark: { type: String, default: '' },
        alternativePhone: { type: String, default: '' },
        addressType: { type: String, required: true },
    },
    paymentDetails: paymentDetailsSchema, // Embedding payment details schema
    totalAmount: { type: Number, required: true },
    orderStatus: { type: String, default: 'Processing Your Order' }, // New field with default value
    trackingId: { type: String, default: 'Not Assigned Yet' }, // New tracking ID field with a default value
    createdAt: { type: Date, default: Date.now }, // Automatically set the date when the order is created
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
