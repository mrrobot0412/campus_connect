const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' }); // Run from the backend folder

const Teacher = require('./src/models/teachers');

const seedTeachers = async () => {
    try {
        if (!process.env.MONGOURI) {
            console.error("MONGOURI is not defined in your .env file!");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGOURI);
        console.log('Connected to Database. Creating mock teachers...');
        
        // Use a default password `password123`
        const passwordHash = await bcrypt.hash('password123', 10);

        const dummyTeachers = [
            {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@thapar.edu',
                department: 'CSED',
                roomNumber: 'C-301',
                specialization: ['Machine Learning', 'Artificial Intelligence', 'Data Science'],
                papers: [
                    { title: 'Deep Learning Optimization in 2024', journal: 'IEEE Transactions' },
                    { title: 'Generative Models for Code Generation', journal: 'ACM Computing Surveys' }
                ],
                password: passwordHash,
                slots: [
                    { time: new Date(Date.now() + 86400000), status: 'available' }, // Tomorrow
                    { time: new Date(Date.now() + 172800000), status: 'available' }, // Day after tomorrow
                    { time: new Date(Date.now() + 176400000), status: 'available' } // Day after tomorrow + 1 hour
                ]
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@thapar.edu',
                department: 'ECED',
                roomNumber: 'E-205',
                specialization: ['VLSI Design', 'Embedded Systems'],
                papers: [{ title: 'FPGA Power Optimization', journal: 'ACM' }],
                password: passwordHash,
                slots: [
                    { time: new Date(Date.now() + 86400000), status: 'available' },
                    { time: new Date(Date.now() + 90000000), status: 'available' }
                ]
            },
            {
                firstName: 'Charlie',
                lastName: 'Brown',
                email: 'charlie.brown@thapar.edu',
                department: 'CSED',
                roomNumber: 'C-405',
                specialization: ['Cybersecurity', 'Network Security', 'Cryptography'],
                papers: [
                    { title: 'Zero Trust Architecture', journal: 'Springer' }, 
                    { title: 'Network Intrusions Detection', journal: 'IEEE' }
                ],
                password: passwordHash,
                slots: [
                    { time: new Date(Date.now() + 259200000), status: 'available' }, // 3 days from now
                    { time: new Date(Date.now() + 345600000), status: 'available' }  // 4 days from now
                ]
            },
            {
                firstName: 'Diana',
                lastName: 'Prince',
                email: 'diana.prince@thapar.edu',
                department: 'ECED',
                roomNumber: 'E-112',
                specialization: ['Signal Processing', 'Wireless Communications', '5G Networks'],
                papers: [
                    { title: '5G Hardware Innovations', journal: 'IEEE' },
                    { title: 'Digital Signal Analysis', journal: 'Springer' }
                ],
                password: passwordHash,
                slots: [
                    { time: new Date(Date.now() + 100000000), status: 'available' },
                    { time: new Date(Date.now() + 103600000), status: 'available' }
                ]
            },
            {
                firstName: 'Evan',
                lastName: 'Wright',
                email: 'evan.wright@thapar.edu',
                department: 'CSED',
                roomNumber: 'C-210',
                specialization: ['Web Development', 'Cloud Computing', 'Distributed Systems'],
                papers: [{ title: 'Microservices vs Monoliths', journal: 'ACM' }],
                password: passwordHash,
                slots: [
                    { time: new Date(Date.now() + 500000000), status: 'available' }
                ]
            }
        ];

        await Teacher.insertMany(dummyTeachers);
        console.log(`Successfully seeded ${dummyTeachers.length} teachers! Their password is 'password123'.`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding Database:', err);
        process.exit(1);
    }
};

seedTeachers();
