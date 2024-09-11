const router = require("express").Router();
const conn = require('../db/dbConnection');
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const upload= require("../middleware/uploadImages")
const util = require("util"); // helper
const fs = require("fs");


//ADMIN[CREATE,UPDATE,DELETE,LIST]
//create product
router.post(
    "",
    admin,
    upload.single("image"),
    body("name")
      .isString()
      .withMessage("please enter a valid product name")
   ,
  
    body("description")
      .isString()
      .withMessage("please enter a valid description ")
      .isLength({ min: 20 })
      .withMessage("description name should be at lease 20 characters"),
      body("price")
      .isString()
      .withMessage("please enter a valid price "),
      body("discount")
      .isString()
      .withMessage("please enter a valid discount "),
    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- VALIDATE THE IMAGE
        if (!req.file) {
          return res.status(400).json({
            errors: [
              {
                msg: "Image is Required",
              },
            ],
          });
        }
  
        // 3- PREPARE product OBJECT
        const product = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          discount: req.body.discount,

        image_url: req.file.filename,
        };
  

        // 4 - INSERT product INTO DB
        const query = util.promisify(conn.query).bind(conn);
        await query("insert into discounts set ? ", product);
        res.status(200).json({
          msg: "product created successfully !",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );



// UPDATE product [ADMIN]
router.put(
  "/:id", // params
  admin,
  upload.single("image"),
  body("name")
    .isString()
    .withMessage("please enter a valid product name")
    .isLength({ min: 10 })
    .withMessage("product name should be at lease 10 characters"),

  body("description")
    .isString()
    .withMessage("please enter a valid description ")
    .isLength({ min: 20 })
    .withMessage("description name should be at lease 20 characters"),
    body("price")
      .isString()
      .withMessage("please enter a valid price "),
      body("discount")
      .isString()
      .withMessage("please enter a valid discount "),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF product EXISTS OR NOT
      const product = await query("select * from discounts where id = ?", [
        req.params.id,
      ]);
      if (!product[0]) {
        res.status(404).json({ ms: "product not found !" });
      }

      // 3- PREPARE product OBJECT
      const productObj = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        discount: req.body.discount,

      };

      if (req.file) {
        productObj.image_url = req.file.filename;
        fs.unlinkSync("./upload/" + product[0].image_url); // delete old image
      }

      // 4- UPDATE product
      await query("update discounts set ? where id = ?", [productObj, product[0].id]);

      res.status(200).json({
        msg: "product updated successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);



//delete
router.delete(
    "/:id", // params
    admin,
    async (req, res) => {
      try {

        // 2- CHECK IF product EXISTS OR NOT
        const query = util.promisify(conn.query).bind(conn);

        const product = await query("select * from discounts where id = ?", [
          req.params.id,
        ]);
        if (!product[0]) {
          res.status(404).json({ ms: "product not found !" });
        }
  
        // 3- PREPARE product OBJECT
    
  
          fs.unlinkSync("./upload/" + product[0].image_url); // delete old image
        
  
        await query("delete from discounts where id = ?", [product[0].id]);
  
        res.status(200).json({
          msg: "product deleted successfully",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );
//USER[LIST,REVIEW]

router.get("",async (req,res)=>{
    const query = util.promisify(conn.query).bind(conn);
    let search ="";
    if(req.query.search){
        search =`where name LIKE '%${req.query.search}%' or description LIKE '%${req.query.search}%'or price LIKE '%${req.query.search}%'`
    }
    const products = await query(`select * from discounts ${search}`)
    products.map(product=>{

        product.image_url ="http://"+req.hostname+":4000/"+product.image_url;
    })
    res.status(200).json(products);
})
// SHOW product [ADMIN, USER]
router.get("/:id", async (req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    const product = await query("select * from discounts where id = ?", [
      req.params.id,
    ]);
    if (!product[0]) {
      res.status(404).json({ ms: "product not found !" });
    }
    product[0].image_url = "http://" + req.hostname + ":4000/" + product[0].image_url;
    product[0].reviews = await query(
      "select * from user_product_review where product_id = ?",
      product[0].id
    );
    res.status(200).json(product[0]);
  });
// MAKE REVIEW [ADMIN, USER]
router.post(
    "/review",
    authorized,
    body("product_id").isNumeric().withMessage("please enter a valid product ID"),
    body("review").isString().withMessage("please enter a valid Review"),
    async (req, res) => {
      try {
        const query = util.promisify(conn.query).bind(conn);
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- CHECK IF product EXISTS OR NOT
        const product = await query("select * from discounts where id = ?", [
          req.body.product_id,
        ]);
        if (!product[0]) {
          res.status(404).json({ ms: "product not found !" });
        }
  
        // 3 - PREPARE product REVIEW OBJECT
        const reviewObj = {
          user_id: res.locals.user.id,
          product_id: product[0].id,
          review: req.body.review,
         
        };
  
        // 4- INSERT product OBJECT INTO DATABASE
        await query("insert into user_product_review set ?", reviewObj);
  
        res.status(200).json({
          msg: " review added successfully !",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

  
module.exports = router;
