const express = require("express");
const loginAuth = require("../../middlewares/authMiddleware");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const Student = require("../../models/student")
const Teacher = require("../../models/teachers")
const {JWT_SECRET} = require("../../config/server-config")






// router.get("/getTeachers", loginAuth, async function name(req, res) {
//   const department = req.query.department;

//   try {
//     const query = department ? { department: department } : {};
//     const allteachers = await Teacher.find(query);
//     return res.status(200).json({ teachers: allteachers });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({ message: "Internal server error" });

// router.get("/getTeachers",
//   // loginAuth, 
//   async function name(req,res) {
//     const department = req.query.department;
    
//     try{
//       const query = department ? { department: department } : {};
//       const allteachers = await Teacher.find(query);
//       return res.status(200).json({teachers:allteachers})
//     }
//     catch(e){
//       console.log(e)
//       return res.status(500).json({message:"Internal server error"})
//     }
// });



router.get("/profile", loginAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.userId).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({ teacher });
  } catch (err) {
    console.error("Error fetching teacher profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getTeacher/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/searchBySpecialization", async (req, res) => {
  const { q, department } = req.query;

  try {
    let query = {
      specialization: { $regex: q, $options: "i" },
    };

    if (department) {
      query.department = department;
    }

    const teachers = await Teacher.find(query);
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/getTeachers", async (req, res) => {
  const { department, search } = req.query;
  let query = {};

  // if (department) query.department = department;
  // if (search) {
  //   query.$text = { $search: search };
  // }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }
  console.log(query);

  try {
    const teachers = await Teacher.find(query);
    console.log({ query, teachers });

    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
router.post(
  "/addResearchPaper",
  loginAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("journal").optional(),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const teacherId = req.user.userId;
      const { title, journal } = req.body;

      const paperData = { title };
      if (journal) paperData.journal = journal;
      // if (year) paperData.year = year;

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacherId,
        { $push: { papers: paperData } },
        { new: true }
      ).select("-password");

      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.status(201).json({
        message: "Research paper added successfully",
        researchPapers: updatedTeacher.researchPapers,
      });
    } catch (err) {
      console.error("Error adding research paper:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.put("/updateContact", loginAuth, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { contact, roomNumber, email } = req.body;

    const updateData = {};
    if (contact) updateData.contact = contact;
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (email) updateData.email = email;

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ message: "Contact information updated successfully", teacher });
  } catch (err) {
    console.error("Error updating contact info:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.delete("/deleteResearchPaper/:title", loginAuth, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const title = req.params.title;

    // if (!mongoose.Types.ObjectId.isValid(paperId)) {
    //   return res.status(400).json({ error: "Invalid paper ID" });
    // }
    console.log(title);
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $pull: { papers: { title: title } } },
      { new: true }
    ).select("-password");

    if (!updatedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({
      message: "Research paper deleted successfully",
      researchPapers: updatedTeacher.papers,
    });
  } catch (err) {
    console.error("Error deleting research paper:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add specialization
router.post(
  "/addSpecialization",
  loginAuth,
  [body("specialization").notEmpty().withMessage("Specialization is required")],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const teacherId = req.user.userId;
      const { specialization } = req.body;

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacherId,
        {
          $addToSet: {
            specialization: { $each: specialization },
          },
        },
        { new: true }
      ).select("-password");

      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.status(201).json({
        message: "Specialization updated successfully",
        specialization: updatedTeacher.specialization,
      });
    } catch (err) {
      console.error("Error updating specialization:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get all teachers (with optional filters)
router.get("/getTeachersByDept", async (req, res) => {
  const { department } = req.query;
  let query = {};

  if (department) query.department = department;

  // if (search) {
  //   query.$or = [
  //     { firstName: { $regex: search, $options: "i" } },
  //     { lastName: { $regex: search, $options: "i" } },
  //     { specialization: { $regex: search, $options: "i" } },
  //   ];
  // }

  try {
    const teachers = await Teacher.find(query).select("-password");
    res.json({ teachers });
  } catch (err) {
    console.error("Error getting teachers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add new teacher
router.post(
  "/addTeacher",
  [
    body("firstName")
      .isString()
      .notEmpty()
      .withMessage("First name is required"),
    body("lastName").isString().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("department")
      .isString()
      .notEmpty()
      .withMessage("Department is required"),
    body("roomNumber")
      .isString()
      .notEmpty()
      .withMessage("Room number is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, department, roomNumber, password } =
      req.body;

    try {
      // Check if email already exists
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new teacher
      const teacher = new Teacher({
        firstName,
        lastName,
        email,
        department,
        roomNumber,
        password: hashedPassword,
      });

      await teacher.save();

      res.status(201).json({
        message: "Teacher added successfully",
        teacher: {
          _id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          department: teacher.department,
        },
      });
    } catch (error) {
      console.error("Error adding teacher:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Teacher login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find teacher by email
      const teacher = await Teacher.findOne({ email });
      if (!teacher) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, teacher.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const payload = {
        userId: teacher._id,
        role: "teacher",
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

      res.json({
        token,
        teacher: {
          _id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          department: teacher.department,
        },
      });
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.post("/addManyTeachers", async (req, res) => {
  try {
    const teachers = req.body.teachers;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ error: "teachers array is required" });
    }

    const insertedTeachers = await Teacher.insertMany(teachers, {
      ordered: false, // allows continuing on duplicate errors
    });

    res.status(201).json({ message: "Teachers added", insertedTeachers });
  } catch (err) {
    res.status(500).json({
      error: "Error inserting teachers",
      details: err.message || err,
    });
  }
});module.exports = router;

router.post(
  "/addTeacher",
  [
    body("firstName")
      .isString()
      .notEmpty()
      .withMessage("First name is required"),
    body("lastName").isString().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("department").isIn(["CSED", "ECED"]).withMessage("Invalid department"),
    body("roomNumber")
      .isString()
      .notEmpty()
      .withMessage("Room number is required"),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, department, roomNumber } = req.body;

    try {
      // Check if email already exists
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const teacher = new Teacher({
        firstName,
        lastName,
        email,
        department,
        roomNumber,
      });
      await teacher.save();

      return res
        .status(201)
        .json({ message: "Teacher added successfully", teacher });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);
router.get(
  "/searchByPaper",

  async (req, res) => {
    const { q, department } = req.query;
var query ={}
    try {
      if (q) {
        query.$text = { $search: q };
      }
    console.log(query)

      const teachers = await Teacher.find(query);
      res.json({ teachers });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router