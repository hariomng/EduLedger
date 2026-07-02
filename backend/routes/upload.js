const express = require("express");
const multer = require("multer");
const { pinata } = require("../lib/pinata.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function toNodeFile(uploadedFile) {
  if (!uploadedFile) return null;
  const fileName = uploadedFile.originalname || uploadedFile.name || "file.bin";
  const fileType = uploadedFile.mimetype || "application/octet-stream";
  if (typeof File !== "undefined") {
    return new File([uploadedFile.buffer], fileName, { type: fileType });
  }
  // Fallback for older Node where File is not global
  const { File: NodeFile } = require("undici");
  return new NodeFile([uploadedFile.buffer], fileName, { type: fileType });
}

router.post("/", upload.fields([{ name: "file" }, { name: "thumbnail" }]), async (req, res) => {
  try {
    const file = req.files?.file?.[0];
    const image = req.files?.thumbnail?.[0];

    if (!file) return res.status(400).json({ error: "No document file provided" });

    const results = {};

    const uploadFileInput = toNodeFile(file);
    if (!uploadFileInput) return res.status(400).json({ error: "Invalid file upload" });

    const uploadedFile = await pinata.upload.public.file(uploadFileInput, {
      metadata: { name: file.originalname },
    });
    const fileUrl = await pinata.gateways.public.convert(uploadedFile.cid);
    results.fileUrl = fileUrl;

    if (image) {
      const uploadImageInput = toNodeFile(image);
      if (!uploadImageInput) {
        return res.status(400).json({ error: "Invalid image upload" });
      }
      const fileThumb = await pinata.upload.public.file(uploadImageInput, {
        metadata: { name: image.originalname },
      });
      const imgUrl = await pinata.gateways.public.convert(fileThumb.cid);
      results.imgUrl = imgUrl;
    }

    const otherFields = {};
    // multer doesn't populate other form entries in the same way; read from req.body
    for (const key of Object.keys(req.body || {})) {
      otherFields[key] = req.body[key];
    }

    const metadataJSON = {
      ...otherFields,
      file: results.fileUrl,
      image: results.imgUrl || null,
      timestamp: new Date().toISOString(),
    };

    const uploadedJson = await pinata.upload.public.json(metadataJSON);
    const jsonUrl = await pinata.gateways.public.convert(uploadedJson.cid);
    results.metadataUrl = jsonUrl;

    return res.json({ success: true, fileUrl: results.fileUrl, image: results.imgUrl || "", metadata: results.metadataUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
