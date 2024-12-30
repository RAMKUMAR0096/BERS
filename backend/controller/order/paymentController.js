// const razorpay=require('../../config/razorpay') 

// const userModel = require('../../models/userModel');


// const paymentController = async (request, response) => {
//     try {
//         const { cartItems } = request.body;

//         const user = await userModel.findOne({ _id: request.userId });

//         const amount = cartItems.reduce((total, item) => {
//             return total + item.productId.sellingPrice * item.quantity * 100; // converting to paise
//         }, 0);
//         const firstImage = cartItems.length > 0 ? cartItems[0].productId.productImage[0] : '';
//         const productNames = cartItems.map((item) => item.productId.productName);
//         const productCreatedAt=cartItems.map((item,index)=>{
//             return item.createdAt
//         })
//         const productQuantity=cartItems.map((item,index)=>{
//             return item.quantity
//         })

//         const orderOptions = {
//             amount: amount,
//             currency: 'INR',
//             receipt: `receipt_${request.userId}`,
//             notes: {
//                 userId: request.userId,
//                 customer_email: user.email,
//                 image:firstImage,
//                 name:productNames,
//                 quantity:productQuantity,
//                 createdAt:productCreatedAt,
//             },
            

//         };

//         const order = await razorpay.orders.create(orderOptions);
//         response.status(201).json({
//             success: true,
//             order,
//             amount,
//             productNames,
//             key: process.env.RAZORPAY_KEY_ID,
//             success_url: `${process.env.FRONTEND_URL}/success`, // Success URL for redirection
//             cancel_url: `${process.env.FRONTEND_URL}/cancel`    // Cancel URL for redirection
//         });

//     } catch (error) {
//         response.status(500).json({
//             message: error?.message || error,
//             error: true,
//             success: false,
//         });
//     }
// };

// module.exports = paymentController;

const razorpay = require('../../config/razorpay'); 
const userModel = require('../../models/userModel');

const paymentController = async (request, response) => {
    try {
        const { cartItems } = request.body;
        const user = await userModel.findOne({ _id: request.userId });
        const allImages = [...new Set(cartItems.map(item => item.productId.productImage).flat())];


        // Calculate total amount
        const amount = cartItems.reduce((total, item) => {
            return total + item.productId.sellingPrice * item.quantity * 100; // converting to paise
        }, 0);

        // Get the first image of the first product (or any logic to select an image)
        const firstImage = allImages[0];

        // Extract other product details
        const productNames = cartItems.map((item) => item.productId.productName);

        const orderOptions = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${request.userId}`,
            notes: {
                userId: request.userId,
                customer_email: user.email,
                image: firstImage,  // Send the first image here
                name: productNames.join(', '),  // Join product names as a string
            },
        };

        // Create the order in Razorpay
        const order = await razorpay.orders.create(orderOptions);
        

        // Send response to frontend
        response.status(201).json({
            success: true,           
            order: order,            
            amount: amount,          
            productNames: productNames,   
            productImage: firstImage,    
            cartItems: cartItems,    
            user: user,              
            allImages: allImages,    
            key: process.env.RAZORPAY_KEY_ID,   
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`    
        });

    } catch (error) {
        response.status(500).json({
            message: error?.message || error,
            error: true,
            success: false,
        });
    }
};

module.exports = paymentController;

