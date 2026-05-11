const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (file) => {
  const result = await cloudinary.uploader.upload(file, {
    folder: "cpms/users",
    width: 300,
    crop: "scale",
  });

  return {
    public_id: result.public_id,
    url: result.secure_url,
  };
};
