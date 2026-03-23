const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes");
const { ServerConfig, ConnectDB } = require("./src/config");

const app = express();
app.use(cors());
app.use(express.json())
app.use("/api", apiRoutes);
app.get("/test",async function(req,res){
 
  
  return res.status(200).send({"message":"seerver is running"});

})

app.listen(ServerConfig.PORT, async () => {
    //mongoDB connection
    await ConnectDB()
    console.log(`Server is up at ${ServerConfig.PORT} `);
  });
  