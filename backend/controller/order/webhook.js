const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const razorpay = require('../../config/razorpay');
const addToCartModel = require('../../models/cartProduct');
const orderModel = require('../../models/orderProductModel');
const endpointSecret = process.env.RAZORPAY_WEBHOOK_SECRET_KEY;

async function getPaymentMethod(paymentId) {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        console.log(payment.method); // Logs the payment method (e.g., 'card', 'netbanking', etc.)
        return payment.method;
    } catch (error) {
        console.error("Error fetching payment method:", error);
        throw error;
    }
}

const webhooks = async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const payloadString = JSON.stringify(req.body);

    // Verify the webhook signature to ensure it is from Razorpay
    //   const generatedSignature = crypto.createHmac('sha256', endpointSecret)
    //     .update(payloadString)
    //     .digest('hex');

    //   if (generatedSignature !== signature) {
    //     return res.status(400).send('Invalid signature');
    //   }

    // Parse the incoming paymentDetails
    const paymentDetails = JSON.parse(payloadString);
    console.log("PaymentDetails:", paymentDetails);

    const paymentId = paymentDetails.paymentDetails.paymentId;

    try {
        // Fetch the payment method type from Razorpay
        const paymentMethod = await getPaymentMethod(paymentId);

        const orderDetails = {
            productDetails: paymentDetails.productDetails,
            email: paymentDetails.email,
            userId: paymentDetails.userId,
            userAddress: paymentDetails.userAddress,
            paymentDetails: {
                paymentId: paymentDetails.paymentDetails.paymentId,
                payment_method_type: paymentMethod,
                payment_status: paymentDetails.paymentDetails.payment_status,
            },
            totalAmount: paymentDetails.totalAmount
        };
        console.log("OrderDetails:", orderDetails);

        if (orderDetails) {
            const order = new orderModel(orderDetails)
            const saveOrder = await order.save()

            if (saveOrder?._id) {
                const deleteCartItem = await addToCartModel.deleteMany({ userId: orderDetails.userId })
            }
        }
        const name = orderDetails.userAddress.name;
        const email = orderDetails.email;
        const payment_Id = orderDetails.paymentDetails.paymentId;
        const allProductsName = orderDetails.productDetails.map(product => product.productName);
        const ProductsName = allProductsName.join(", ");
        const TotalAmount = orderDetails.totalAmount;
        //send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_USERNAME,
                pass: process.env.NODEMAILER_APP_PASSWORD
            }
        });
        const Customer = {
            from: `Ram Shop <${process.env.COMPANY_EMAIL}>`, // Sets display name to "Ramnode96"
            to: email,
            subject: 'Thank You for Your Order from Ram Shop!',
            text: `
Hello ${name},

Thank you for shopping with us at Ram Shop! We’re thrilled to have you as our customer and excited to fulfill your order.

Order Details:
- Payment Id: ${payment_Id}
- Product(s): ${ProductsName}
- Total Amount: ${TotalAmount}

We’ll notify you once your order is on its way. If you have any questions, feel free to reach out to our support team.

Warm regards,
The Ram Shop Team
`
        };

        // Send customer email
        await transporter.sendMail(Customer, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Customer email sent: ' + info.response);
            }
        });

        // Define the owner notification email
        const Owner = {
            from: `Ram Shop <${process.env.COMPANY_EMAIL}>`, // Sets display name to "Ram Shop"
            to: process.env.OWNER_EMAIL,
            subject: `New Order Received from ${name}`,
            text: `
  Hello Ram Shop Owner,
  
  You have received a new order from ${name}. Here are the details:
  
  - Customer Name: ${name}
  - Payment Id: ${payment_Id}
  - Product(s): ${ProductsName}
  - Total Amount: ₹${TotalAmount}
  
  Please review and prepare the order for processing.
  
  Best regards,  
  Ram Shop Notification System
  `
        };


        // Send owner notification email
        await transporter.sendMail(Owner, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Owner notification email sent: ' + info.response);
            }
        });


        res.status(200).send('Webhook received');
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).send('Error processing webhook');
    }


};

module.exports = webhooks;
