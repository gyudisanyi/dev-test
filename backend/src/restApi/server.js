import express from 'express'
import router from './route/router'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3000

app.use(  
   cors({
      origin: "*", // calls from all origins permitted
      methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE" // only allow these requests
   })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Definált utak hozááadása
app.use("/api", router)

// Nem definiált utak kezelése
app.get("*", function(req, res) {
   res.send("App works!")
})

app.listen(port, function() {
   console.log('Server started on port: ' + port);
})