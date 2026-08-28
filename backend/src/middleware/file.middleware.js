const multer = require("multer")

const storage = multer.memoryStorage()

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/pdf",
        ]

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(
                new Error(
                    "Only PDF files are allowed"
                )
            )
        }
    },
})

module.exports = upload

