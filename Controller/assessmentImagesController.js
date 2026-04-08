import { prisma } from "../libs/prisma.js";


export const uploadAssessmentImages = async (req, res) => {
  try {
    const { assessment_detail_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    const imageData = files.map((file) => ({
      assessment_detail_id: Number(assessment_detail_id),
      image_url: `/uploads/${file.filename}`,
    }));

    const savedImages = await prisma.assessment_images.createMany({
      data: imageData,
    });

    res.status(201).json({
      success: true,
      message: "Images uploaded and saved successfully",
      count: savedImages.count,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
    uploadAssessmentImages,
};
