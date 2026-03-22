const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: {required:true, type: String },
    lastName: { required:true,type: String },
    email: { required:true, type: String },
    roll :{type:Number ,required:true},
    password:{type:String ,required:true}
}, { timestamps: true });


const Student = new mongoose.model('Student', studentSchema);

module.exports = Student;