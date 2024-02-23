import { Router } from "express";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import mongoose from "mongoose"; // Import mongoose package
import authJwt from "../helpers/jwt.js";
import multer from "multer";

const router = Router();
const fileType={
  'image/png':'png',
  'image/jpeg':'jpg',
  'image/jpg':'jpg'
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = fileType[file.mimetype];
    let uploadError = new Error('Invalid image type');
    
    if(isValid){
      uploadError=null;
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const extension = fileType[file.mimetype];
    if(!extension) return cb(new Error('Invalid file type'));
   const fileExt = file.originalname.split(" ").join('-');

    cb(null, `${fileExt}-${Date.now()}.${extension}`)
  }
})

const upload = multer({ storage: storage })

router.get(`/products`, async (req, res) => {
  const product = await Product.find().populate("category");
  if (!product) {
    res.status(500).json({ success: false, message: "no product found" });
  } else {
    res.status(200).send(product);
  }
});

//get a single product
router.get(`/products/:id`, async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.id); // Convert req.params.id to ObjectId
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
    } else {
      res.status(200).send(product);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.toString() });
  }
});

//create new product

router.post(`/products`,authJwt(), upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;
    const image = req.file.filename;
    console.log(image);
    const fullImagePath = req.protocol + "://" + req.get("host") + "/public/uploads/" + image;
    console.log("full ",fullImagePath)

    const categoryExist = await Category.findById(category);
    if (!categoryExist) {
      return res.status(400).send("Invalid Category");
    }

    if (!name || !image || !countInStock || !category) {
      return res.status(400).send("All data fields are required");
    }

    const product = await Product.create({
      name,
      description,
      richDescription,
      image: fullImagePath,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    });

    res.status(201).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//update a product
router.put(`/products/:id`,authJwt(), async (req, res) => {
  //first check given id is valid or not
  //after that check given category is valid or not
  //if all are valid then update the product

  try {
    const productId = new mongoose.Types.ObjectId(req.params.id); // Convert req.params.id to ObjectId
    if (!productId) return res.status(400).send("Invalid Product Id");
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let {
      name,
      description,
      richDescription,
      image,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;

    const categoryValid = mongoose.isValidObjectId(category);
    if (!categoryValid) return res.status(400).send("Invalid Category");

    const categoryExist = await Category.findById(category);
    if (!categoryExist) {
      return res.status(400).send("Invalid Category");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        richDescription,
        image,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReviews,
        isFeatured,
      },
      { new: true }
    );

    res.status(200).send(updatedProduct);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//delete a product
router.delete(`/products/:id`,authJwt(), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Invalid Product Id");
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(400).send("No product found");
    res.status(200).send("product deleted successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//get product count
router.get(`/products/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments({});
        res.status(200).json({ count: productCount });
    } catch (err) {
        res.status(500).send(err.message);
    }
 
});

//get featured products
router.get(`/products/get/featured`, async (req, res) => {
    try {
       
        const featuredProducts = await Product.find({ isFeatured: true })
        res.status(200).send(featuredProducts);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//get products by category query parameters



export default router;
