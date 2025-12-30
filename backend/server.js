const express = require('express'); // ספריית עזר לבניית שרת - express
const { Pool } = require("pg"); // יבוא של ספרייה (נועדה להתחבר לבסיס נתונים ולשלוח שאילתות)
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require("express-session")


const app = express();
const port = 2000;
app.use(express.json());
const pool = new Pool({
    user: "postgres",
    host: "localhost", // כאן היה כתוב "lost", שגיאה
    database: "MyDB",
    password: "12345678",
    port: 5432,
});
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials:true,
    }));

app.use(
    session({
        secret: "mySecretOryan",
        resave: false,
        saveUninitialized: false,
        cookie:{
            httpOnly: true,
            secure: false,
            sameSite:"lax"
        }
    })
)

app.get("/dish", async (req, res) => { //קבלת כל המנות
     if(!req.session.user){
         return res.status(401).send({message:"Unauthorized"});
     }
    const restaurant_id = req.session.user.id;
    try {
        const result = await pool.query('SELECT * FROM dish WHERE restaurant_id = $1',[restaurant_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/searchDish', async (req, res) => {
    const {dish} = req.body; 
    const restaurant_id = req.session.user.id;
    try {
        const result = await pool.query('SELECT * FROM dish WHERE restaurant_id = $1 AND dish=$2',[restaurant_id,dish]);
        if(result.rows.length==0){
            return res.json("No dish found");
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


  app.post('/addDish', async (req, res) => {
  const { dish, price, description, restaurant_id, image_url } = req.body; // הוספנו image_url
  try {
    const result = await pool.query(
      'INSERT INTO dish (dish, price, description, restaurant_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [dish, price, description, restaurant_id, image_url] // הוספנו גם לפרמטרים
    );
    if (result.rowCount > 0) {
      res.json({
        message: "Dish added successfully",
        newDish: result.rows[0],
      });
    } else {
      res.json({ message: 'Error adding dish' });
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
  

app.delete('/deletDish/:id', async (req, res) => { //מחיקת
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM dish WHERE id = $1', [id]);
        res.json(result.rowCount > 0 ? 'Deleted' : 'Dish not found');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


app.put("/updateDish/:id", async (req, res) => {
    const id = req.params.id;
    const { dish, price, description, restaurant_id, image_url } = req.body; // הוספת image_url

    try {
        const result = await pool.query(
            `UPDATE dish SET dish = $1, price = $2, description = $3, restaurant_id = $4, image_url = $5 WHERE id = $6`,
            [dish, price, description, restaurant_id, image_url, id]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
app.post("/register",async (req,res) => {
    const {username,password} = req.body;
    try{
        const checkUser = await pool.query('SELECT * FROM restaurants WHERE restaurant = $1',[username]);
        if(checkUser.rows.length>0){
            return res.status(401).json({message:"שם המשתמש תפוס"})
        }

        const hasSheadPassword = await bcrypt.hash(password,10);
        const result = await pool.query(
            'INSERT INTO restaurants (restaurant,password) VALUES ($1, $2) RETURNING *',
            [username,hasSheadPassword]);
        const user = result.rows[0];
        if(result.rowCount>0){
            res.status(201).json({message:"User register secsufully", user}) //תגובה ללקוח 
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internetional error"})
    }
});

app.post("/login",async (req,res)=>{
    const {username,password} = req.body;
    try{
        const result = await pool.query('SELECT * FROM restaurants WHERE restaurant = $1',[username]);
        if(result.rows.length==0){
            return res.status(401).json({message:"שם משתמש או סיסמה לא נכונים"})
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({message:"שם משתמש או סיסמה לא נכונים"})
        }
        req.session.user= {id:user.id, username:user.username}
        res.json({message:"התחברות הצליחה",user})

    }catch(error){
        console.log(error);
        res.status(500).json({message:"Intenetional Server Error"})
    }
});

app.get("/me",(req,res)=>{
    if(req.session.user){
        res.json({loggedIn:true,user:req.session.user})
    }
    else{
        res.status(401).json({loggedIn:false})
    }
})

app.post("/logout",(req,res)=>{
    req.session.destroy(()=>{
        res.json({messagte: "Logged Out"})
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // הוספתי רווח אחרי המילה port
});


