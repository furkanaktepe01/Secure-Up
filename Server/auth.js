const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (request, response, next) => { 
  
  try {
    
    const token = await request.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    request.user = decodedToken;

    next();
    
  } catch (error) {
    response.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
