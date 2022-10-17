import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "./images/product_images",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

export const uploadimages = upload.fields([{name: "img", maxCount: 4}]);

