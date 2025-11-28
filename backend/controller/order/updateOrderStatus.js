const orderModel = require("../../models/orderProductModel");

async function updateOrderStatus(req, res) {
  const { orderId, orderStatus } = req.body;
  console.log(orderStatus)

  // Validate
  if (!orderId || !orderStatus) {
    return res.status(400).json({
      success: false,
      message: "Order ID and Order Status are required.",
    });
  }

  try {
    // Update DB
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the order status.",
    });
  }
}

module.exports = updateOrderStatus;
