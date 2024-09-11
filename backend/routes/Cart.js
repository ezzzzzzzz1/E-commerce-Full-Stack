const router = require("express").Router();
const conn = require('../db/dbConnection');
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");

const { body, validationResult } = require("express-validator");
const upload= require("../middleware/uploadImages")
const util = require("util"); // helper
const fs = require("fs");
const multer = require('multer');
const session = require('express-session');

// // POST /cart - Add a product to the cart
// router.post(
//   "",
//   authorized,
//   upload.single("image"),
//   body("name")
//     .isString()
//     .withMessage("please enter a valid product name")
// ,
//   body("description")
//     .isString()
//     .withMessage("please enter a valid description "),
//     body("price")
//     .isString()
//     .withMessage("please enter a valid price "),
//   async (req, res) => {
//     try {
//       // 1- VALIDATION REQUEST [manual, express validation]
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       // 2- VALIDATE THE IMAGE
//       // if (!req.file) {
//       //   return res.status(400).json({
//       //     errors: [
//       //       {
//       //         msg: "Image is Required",
//       //       },
//       //     ],
//       //   });
//       // }

//       // 3- PREPARE product OBJECT
//       const product = {
//         name: req.body.name,
//         description: req.body.description,
//         price:req.body.price,
//         image_url: req.file.filename,
        
//       };

//       // 4 - INSERT product INTO DB
//       const query = util.promisify(conn.query).bind(conn);
//       await query("insert into cart set ? ", product);
//       res.status(200).json({
//         msg: "product created successfully !",
//       });
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );
// // router.post('/cart', multer().none(), (req, res) => {
// //   // Extract data from request body
// //   const { name, description, price, image_url } = req.body;

// //   // Validate incoming data (example: check required fields)
// //   if (!name || !description || !price || !image_url) {
// //     return res.status(400).json({ error: 'Missing required fields' });
// //   }

// //   // Create a new cart item
// //   const newItem = new Cart({
// //     name,
// //     description,
// //     price,
// //     image_url
// //   });

// //   // Save the new item to the database
// //   newItem.save()
// //     .then(() => {
// //       res.status(201).json({ message: 'Item added to cart successfully' });
// //     })
// //     .catch(err => {
// //       console.error('Error saving item to cart:', err);
// //       res.status(500).json({ error: 'Internal server error' });
// //     });
// // });

// // router.post(
// //   '/',
// //   admin,
// //   async (req, res) => {
// //     try {
// //       // Validate request
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({ errors: errors.array() });
// //       }

// //       // Validate image upload
      

// //       // Prepare product object
// //       const product = {
// //         name: req.body.name,
// //         description: req.body.description,
// //         price: req.body.price,
// //         image_url: req.file.filename // Assuming filename is stored by multer
// //       };

// //       // Insert product into database
// //       const query = util.promisify(conn.query).bind(conn);
// //       await query('INSERT INTO cart SET ?', product);

// //       // Respond with success message
// //       res.status(200).json({ msg: 'Product created successfully!' });
// //     } catch (err) {
// //       console.error('Error adding product to cart:', err);
// //       res.status(500).json({ error: 'Internal server error' });
// //     }
// //   }
// // );

//   router.get("",async (req,res)=>{
//     const query = util.promisify(conn.query).bind(conn);
//     let search ="";
//     if(req.query.search){
//         search =`where name LIKE '%${req.query.search}%' or description LIKE '%${req.query.search}%'`
//     }
//     const products = await query(`select * from cart ${search}`)
//     products.map(product=>{
  
//         product.image_url ="http://"+req.hostname+":4000/"+product.image_url;
//     })
//     res.status(200).json(products);
//   })
//   module.exports = router;

//   router.delete(
//     "/:id", // params
//     async (req, res) => {
//       try {

//         // 2- CHECK IF product EXISTS OR NOT
//         const query = util.promisify(conn.query).bind(conn);

//         const product = await query("select * from products where id = ?", [
//           req.params.id,
//         ]);
//         if (!product[0]) {
//           res.status(404).json({ ms: "product not found !" });
//         }
  
//         // 3- PREPARE product OBJECT
    
  
//           fs.unlinkSync("./upload/" + product[0].image_url); // delete old image
        
  
//         await query("delete from cart where id = ?", [product[0].id]);
  
//         res.status(200).json({
//           msg: "product deleted successfully",
//         });
//       } catch (err) {
//         res.status(500).json(err);
//       }
//     }
//   );


// let cart = [];

// router.get('', (req, res) => {
//     res.json(cart);
// });

// router.post('', (req, res) => {
//     cart = req.body;
//     res.status(200).send('Cart updated');
// });

// // Add DELETE endpoint
// router.delete('', (req, res) => {
//     cart = [];
//     res.status(200).send('Cart cleared');
// });

// module.exports = router;



router.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

router.get('', (req, res) => {
  // Initialize cart for the session if not already set
  if (!req.session.cart) {
      req.session.cart = [];
  }
  res.json(req.session.cart);
});

router.post('',(req, res) => {
  req.session.cart = req.body;
  res.status(200).send('Cart updated');
});

router.delete('', (req, res) => {
  req.session.cart = [];
  res.status(200).send('Cart cleared');
});

module.exports = router;