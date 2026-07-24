const { asyncHandler } = require('../middleware/validation');
const User = require('../models/User');
const bcrypt = require('bcryptjs');




const getAllCustomers = asyncHandler(async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter).select('-password');
        res.status(200).json({
            status: 'success',
            users
        });
    }
    catch (err) {
        res.status(400).json({
            message: 'failed to fetch',
            error: err
        });
    }
});

const createUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, phone, company, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            company,
            role: role || 'customer'
        });

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                company: user.company,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'error',
            message: 'Failed to create user',
            error: err
        });
    }
});

module.exports = {
    getAllCustomers,
    createUser
}