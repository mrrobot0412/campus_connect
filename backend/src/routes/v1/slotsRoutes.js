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
    
            // Concurrent lock: only update if the slot is currently 'available'
            const update = await Teacher.updateOne(
                { _id: teacherId, "slots._id": slotId, "slots.status": "available" },
                {
                  $set: {
                    "slots.$.student": id,
                    "slots.$.status": "booked"
                  }
                }
            );
              
            if (update.modifiedCount === 0) {
              return res.status(400).json({ message: 'Slot is no longer available or invalid' });
            }

            return res.status(201).json({ message: 'Slot booked successfully' });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
          }
})




router.get("/retriveSlots", loginAuth, async function(req, res) {
    try {
        var id = req.user.userId;
        const existingStudent = await Student.findOne({ _id: id });
        
        if (!existingStudent) {
            return res.status(400).json({ message: 'No such student' });
        }

        // Use aggregation to flatten the slots array and return only the slots belonging to this student
        const bookedSlots = await Teacher.aggregate([
            { $match: { "slots.student": new mongoose.Types.ObjectId(id) } },
            { $unwind: "$slots" },
            { $match: { "slots.student": new mongoose.Types.ObjectId(id) } },
            { $project: {
                teacherId: "$_id",
                firstName: 1, 
                lastName: 1, 
                department: 1, 
                roomNumber: 1,
                slotId: "$slots._id", 
                time: "$slots.time", 
                status: "$slots.status"
            }},
            { $sort: { time: 1 } }
        ]);

        return res.status(200).json({ bookedSlots });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post("/cancelSlot", loginAuth, async (req, res) => {
    try {
        const { teacherId, slotId } = req.body;
        const userId = req.user.userId;

        // Ensure the student or teacher can cancel it (simplification: if it matches, clear it)
        const update = await Teacher.updateOne(
            { _id: teacherId, "slots._id": slotId },
            {
                $set: {
                    "slots.$.student": null,
                    "slots.$.status": "available"
                }
            }
        );

        if (update.modifiedCount === 0) {
            return res.status(400).json({ message: "Could not cancel slot. Invalid IDs." });
        }

        return res.status(200).json({ message: "Slot canceled successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

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