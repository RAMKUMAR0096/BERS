const nodemailer = require('nodemailer');
const orderModel = require("../../models/orderProductModel");

const cancelOrderController = async (request, response) => {
  try {
    const { orderId } = request.body;
    const currentUserId = request.userId;

    // Validate orderId
    if (!orderId) {
      return response.status(400).json({
        message: "Order ID is required",
        error: true,
      });
    }

    // Find the order by orderId and userId to ensure the user owns the order
    const order = await orderModel.findOne({ _id: orderId, userId: currentUserId });

    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
      });
    }

    // Check if the order is already cancelled
    if (order.orderStatus === "Order Cancelled") {
      return response.status(400).json({
        message: "Order is already cancelled",
        error: true,
      });
    }

    // Extract order details
    const { userAddress, email, paymentDetails, productDetails, totalAmount } = order;
    const name = userAddress.name;
    const payment_Id = paymentDetails?.paymentId || "N/A";
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
      subject: 'Order Cancellation from Ram Shop',
      text: `
Hello ${name},

Your order has been successfully cancelled.
Order Details:
- Payment Id: ${payment_Id}
- Product(s): ${ProductsName}
- Total Amount: ${totalAmount}

To process your refund, please visit Ram Shop with your payment proof (such as the receipt or transaction details). Our team will assist you in completing the refund process smoothly.

If you have any questions or need further assistance, please reach out to our support team. We’re here to help.

Best regards,
The Ram Shop Team
`
    };

    // Send email to the customer
    await transporter.sendMail(customerEmail, function (error, info) {
      if (error) {
        console.error("Failed to send customer email:", error);
      } else {
        console.log("Customer email sent:", info.response);
      }
    });

    // Email to be sent to the shop owner
    const ownerEmail = {
      from: `Ram Shop <${process.env.COMPANY_EMAIL}>`,
      to: process.env.OWNER_EMAIL,
      subject: 'Order Cancelled Notification - Ram Shop',
      text: `
Hello Ram Shop Owner,

We wanted to inform you that an order has been cancelled. Please find the details below:

Order Details:
- Order Id: ${order._id}
- Customer Name: ${userAddress.name}
- Customer Email: ${email}
- Mobile: ${userAddress.mobile}
- Address: ${userAddress.address}, ${userAddress.locality}, ${userAddress.city}, ${userAddress.state} - ${userAddress.pincode}
- Payment Id: ${payment_Id}
- Product(s): ${ProductsName}
- Total Amount: ${totalAmount}
- Payment Method: ${paymentDetails.payment_method_type}
- Payment Status: ${paymentDetails.payment_status}

Please take any necessary actions as required. If you need any further information, feel free to reach out.

Best regards,
The Ram Shop System
`
    };

    // Send email to the shop owner
    await transporter.sendMail(ownerEmail, function (error, info) {
      if (error) {
        console.error("Failed to send owner email:", error);
      } else {
        console.log("Owner email sent:", info.response);
      }
    });

    // Update the order status to "Order Cancelled"
    order.orderStatus = "Order Cancelled";
    await order.save();

    response.json({
      message: "Order cancelled successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in cancelOrderController:", error);
    response.status(500).json({
      message: error.message || "An error occurred while processing your request",
      error: true,
    });
  }
};

module.exports = cancelOrderController;
