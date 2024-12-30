const nodemailer = require('nodemailer');
const orderModel = require("../../models/orderProductModel");

const orderSentController = async (request, response) => {
  try {
    const { orderId } = request.body;
    
    const currentUserId = request.userId;
    console.log(currentUserId)

    // Validate orderId
    if (!orderId) {
      return response.status(400).json({
        message: "Order ID is required",
        error: true,
      });
    }

    // Find the order by orderId and userId to ensure the user owns the order
    const order = await orderModel.findOne({ _id: orderId });
    console.log("order",order)
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
      });
    }

    // Check if the order is already marked as "Delivered"
    if (order.orderStatus === "Delivered") {
      return response.status(400).json({
        message: "Order is already marked as sent",
        error: true,
      });
    }

    // Extract order details
    const { userAddress, email, paymentDetails, productDetails, totalAmount } = order;
    const name = userAddress.name;
    const payment_Id = paymentDetails?.paymentId || "N/A"; // Use a fallback if paymentId is missing
    const allProductsName = productDetails.map(product => product.productName);
    const ProductsName = allProductsName.join(", ");

    // Create the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_APP_PASSWORD
      }
    });

    // Email to be sent to the customer
    const customerEmail = {
      from: `Ram Shop <${process.env.COMPANY_EMAIL}>`,
      to: email,
      subject: 'Your Order Has Been Delivered - Ram Shop',
      text: `
Hello ${name},

We’re delighted to let you know that your order has been successfully delivered!

Order Details:
- Order Id: ${order._id}
- Product(s): ${ProductsName}
- Total Amount: ${totalAmount}
- Delivered To: ${userAddress.name}, ${userAddress.address}, ${userAddress.locality}, ${userAddress.city}, ${userAddress.state} - ${userAddress.pincode}

We hope you enjoy your purchase! If there’s anything we can assist you with or if you have feedback to share, please don’t hesitate to reach out.

Thank you for choosing Ram Shop. We look forward to serving you again!

Best regards,
The Ram Shop Team
`
    };

    // Send the email to the customer
    await transporter.sendMail(customerEmail, function (error, info) {
      if (error) {
        console.error("Failed to send email:", error);
      } else {
        console.log("Customer email sent:", info.response);
      }
    });

    // Update the order status to "Delivered"
    order.orderStatus = "Delivered";
    await order.save();

    response.json({
      message: "Order marked as sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in orderSentController:", error);
    response.status(500).json({
      message: error.message || "An error occurred while processing your request",
      error: true,
    });
  }
};

module.exports = orderSentController;
