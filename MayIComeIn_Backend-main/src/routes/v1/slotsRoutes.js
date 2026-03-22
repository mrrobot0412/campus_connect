const express = require("express");
const loginAuth = require("../../middlewares/authMiddleware");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const Student = require("../../models/student")
const Teacher = require("../../models/teachers")
// const Slots = require("../../models/Slots")
const {JWT_SECRET} = require("../../config/server-config")

const mongoose = require('mongoose');

async function insertSlotIfTimeIsFree(id, time, status) {
  const tenMins = 10 * 60 * 1000;
  const min = new Date(time.getTime() - tenMins);
  const max = new Date(time.getTime() + tenMins);

  return await Teacher.updateOne(
    {
      _id: id,
      "slots.time": { $not: { $gte: min, $lte: max } }
    },
    { $push: { slots: { time, status } } }
  );
}



router.post("/bookSlots",loginAuth,
    async function(req,res){
     

        try {
        var id = req.user.userId
        var slotId = req.body.slotId
        var teacherId = req.body.teacherId
        // console.log(req.slotId)
            // Check if email already exists
            const existingTeacher = await Student.findOne({ _id:id });
            if (!existingTeacher) {
              return res.status(400).json({ message: 'NO such student' });
            }
            // console.log(existingTeacher)
            const result = await Teacher.aggregate([
                // Match the teacher with this slot
                { $match: { _id: new mongoose.Types.ObjectId(teacherId) } },
                { $unwind: "$slots" },
                { $match: { "slots._id": new mongoose.Types.ObjectId(slotId) } },
                {
                  $facet: {
                    slotToBook: [
                      { $project: { time: "$slots.time" } }
                    ],
                    alreadyBooked: [
                      {
                        $lookup: {
                          from: "teachers",
                          let: { slotTime: "$slots.time" },
                          pipeline: [
                            { $unwind: "$slots" },
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    { $eq: ["$slots.time", "$$slotTime"] },
                                    { $eq: ["$slots.bookedBy", new mongoose.Types.ObjectId(id)] }
                                  ]
                                }
                              }
                            }
                          ],
                          as: "conflict"
                        }
                      },
                      { $project: { conflict: 1 } }
                    ]
                  }
                }
              ]);
if(result[0].conflict?.length > 0 ){ return  res.status(400).json({ message: 'alreay booked slot for same timing' });}              
    
            const update = await Teacher.updateOne(
                { _id: teacherId, "slots._id": slotId },
                {
                  $set: {
                    "slots.$.student": id,
                    "slots.$.status": "booked"
                  }
                }
              );
              
      
        //  slots.stude

            return  res.status(201).json(update);
          } catch (error) {
            console.error(error);
            return  res.status(500).json({ message: 'Server error' });
          }
        

})




router.get("/retriveSlots",loginAuth,
    async function(req,res){
     

        try {
        var id = req.user.userId
            // Check if email already exists
            const existingTeacher = await Student.findOne({ _id:id });
            if (!existingTeacher) {
              return res.status(400).json({ message: 'NO such student' });
            }
            // console.log(existingTeacher)
    
            var update = await Teacher.find({'slots.student':id}, { firstName: 1,lastName:1, "slots.time": 1, _id: 0 , "slots.status": 1,} )
            console.log(update)
        //  slots.stude

            return  res.status(201).json(update);
          } catch (error) {
            console.error(error);
            return  res.status(500).json({ message: 'Server error' });
          }
        

})

router.post("/addSlot", loginAuth, async function (req, res) {
  try {
    var id = req.user.userId;
    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ _id: id });
    if (!existingTeacher) {
      return res.status(400).json({ message: "NO such teacher" });
    }
    console.log(existingTeacher);
    var time = new Date(req.body.time);
    var data = {
      time: time,
    };
    var update = await Teacher.updateOne(
      { _id: id, "slots.time": { $ne: data.time } },
      { $push: { slots: data } }
    );
    console.log(update);

    return res.status(201).json({ message: "slot  added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
// Updating slot timing
router.put("/updateSlot/:id", async (req, res) => {
  try {
    const { time } = req.body;
    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      { time },
      { new: true }
    );
    res.status(200).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router