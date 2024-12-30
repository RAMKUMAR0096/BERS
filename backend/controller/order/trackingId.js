const orderModel = require("../../models/orderProductModel");

async function trackingId(req,res){
const { orderId, trackingId } = req.body;

// Validation: Check if all required fields are present
if (!orderId || !trackingId) {
  return res.status(400).json({ success: false, message: 'Order ID and Tracking ID are required.' });
}

try {
  // Find the order by ID and update the tracking ID
  const updatedOrder = await orderModel.findByIdAndUpdate(
    orderId,
    { trackingId },
    { new: true } // Return the updated document
  );

  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'Tracking ID updated successfully.',
    data: updatedOrder,
  });
} catch (error) {
  console.error('Error updating tracking ID:', error);
  res.status(500).json({ success: false, message: 'An error occurred while updating the tracking ID.' });
}
}
module.exports=trackingId;
