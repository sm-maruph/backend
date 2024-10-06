const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getToLet, postTolet, myTolet, getDetails, deleteTolet, insertBookmark, getBookmark, deleteBookmark, updateTolet} = require("../controllers/toletController");

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./tolet/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

// Route to fetch filtered ToLet data
router.get("/getTolet", getToLet);

// Route to handle ToLet posting (with image upload)
router.post("/post", upload.array("files", 10), postTolet); // Handle up to 10 images

router.get('/myTolet', myTolet)
router.get('/details/:id', getDetails); 
router.delete('/delete/:id', deleteTolet);
router.post('/InsertBookmark', insertBookmark)
router.get('/getBookmark', getBookmark)
router.delete('/deleteBookmark/:bid', deleteBookmark);
router.put('/update/:tid', updateTolet)

module.exports = router;