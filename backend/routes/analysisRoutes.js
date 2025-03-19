const express = require("express");
const auth = require("../middleware/auth.middleware");
const { getAnalysisData, getSpendingByCategory  } = require("../logic/analysisLogic");

const router = express.Router();

// router.get("/analytics", auth, async (req, res) => {
//   console.log("GETTING ANALYSIS DATA");
//   try {
//     const authToken = req.headers.authorization;
//     const analysisData = await getAnalysisData(req.user._id, authToken);

//     if (analysisData.error) {
//       return res.status(404).json({ error: analysisData.error });
//     }

//     res.status(200).json(analysisData);
//   } catch (error) {
//     console.error("Analysis page route error:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/analytics", auth, async (req, res) => {
    console.log("GETTING ANALYSIS DATA");
  
    try {
      console.log("User ID from request:", req.user._id);
      console.log("Authorization header:", req.headers.authorization); // Debug if token is missing
      
      const analysisData = await getAnalysisData(req.user._id, req.headers.authorization);
  
      if (analysisData.error) {
        console.log("Analysis data error:", analysisData.error);
        return res.status(404).json({ error: analysisData.error });
      }
  
      console.log("Sending analysis data response..."); //, analysisData);
      res.status(200).json(analysisData);
    } catch (error) {
      console.error("Analysis page route error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  

// router.get("/analytics", async (req, res) => { 
//     console.log("GETTING ANALYSIS DATA"); 
//     res.status(200).json({ message: "Success" });
//   });
  

module.exports = router;
