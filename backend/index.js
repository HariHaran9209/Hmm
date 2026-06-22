import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import router from './routes/auth.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("API is running")
})

app.use('/api/auth', router)

mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(5000, () => console.log("Server running in 5000")) 
    })
    .catch(err => console.log(err))