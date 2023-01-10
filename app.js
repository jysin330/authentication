require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/user");
const auth = require("./middleware/auth")
const cookieParser = require("cookie-parser")
app.use(cookieParser());
// express cannot handle json file directly
// needed middleware
app.use(express.json());

app.get('/', (req, res) => {
    res.send("<h1>helle backend</h1>")
})
app.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        if (!(firstname && lastname && email && password)) {
            res.status(400).send("all fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(401).send("user already exists");
        }

        const myEncPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: myEncPassword
        })
        //  token

        const token = jwt.sign({
            user_id: user._id, email
        }, process.env.SECRET_KEY, { expiresIn: "2h" });

        user.token = token;
        //  update or not

        // password undefined
        user.password = undefined;
        //  send token or send just success yes and redirect- choice
        res.status(201).json({ user });

    } catch (error) {
        console.log(error)
    }
});
app.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(401).send("missing field")
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({
                user_id: user._id, email
            }, process.env.SECRET_KEY, { expiresIn: "2h" });
            user.token = token;
            user.password = undefined;
            // res.status(200).json({ user });

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.status(200).cookie('token', token, options).json({
                success: true,
                token,
                user
            })
        }
        res.status(401).send("email or password is incorrect")

    } catch (error) {
        console.log(error);

    }
})
app.get("/dashboard", auth, (req, res) => {
    res.send("this is a secret information")
})
module.exports = app;