const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { createJwtToken } = require('../util/jwt');

const router = express.Router();
  
  // Signup route
  router.post('/signup',async (req, res) => {
    try {
      const { name, email, password } = req.body;
      // const filePath = req.file ? req.file.path : null; // Path to the uploaded file
      console.log(`Api call Signup`,{name,email,password})
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.error(`User with email ${email} already exists`);
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username:name, email, password: hashedPassword });
      await user.save();
      
      console.log(`Success in Signup`)

      res.status(201).json({ message: 'User registered successfully',email, username : name, token : createJwtToken({email}) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  
  
  // Login route
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Api call Login',{email,password})
      const user = await User.findOne({ email })
      console.log(user);
      if (!user) {
        console.log('User does not exists')
        return res.status(401).json({ error: 'Email or Password is incorrect' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log({passwordMatch});
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Email or Password is incorrect' });
      }
      
      const token = createJwtToken({email})
      console.log('Success in login')
      res.json({ message: 'Authentication successful' ,token,user});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  module.exports = router;