const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'e-commerce',
  port:"3307",
});
 
connection.connect((err)=>{
    if (err)throw err;
    console.log("DB CONNECTED");
});
 

module.exports = connection;