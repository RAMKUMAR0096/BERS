const userModel = require("../../models/userModel");

const changeProfilepic = async (req, res) => {
  try {
    const { profilePic } = req.body;

    // Validate that the profilePic is provided
    if (!profilePic) {
      return res.status(400).json({ success: false, message: 'Profile picture is required.' });
    }

    // Get the user ID from the authenticated user
    const userId = req.userId; // This should now work correctly

    // Update the user's profile picture in the database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePic },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Return a success response
    res.status(200).json({ success: true, message: 'Profile picture updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = changeProfilepic;
