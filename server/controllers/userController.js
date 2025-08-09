import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const registerUser = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        if (process.env.MOCK === 'true') {
            const role = username?.toLowerCase() === 'admin' ? 'admin' : 'user';
            const token = 'mock-token';
            return res.status(201).json({ success: true, token, user: { username, email, role } });
        }
        // check duplicate
        const exist = await User.findOne({ username });
        if (exist) return res.status(400).json({ error: "Username already exists" });

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, password: hashedPassword, email, role: "user" });
        await user.save();

        // return token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ success: true, token, user: { username, email, role: user.role } });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: "Register failed" });
    }
};

// Login
export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (process.env.MOCK === 'true') {
            const role = username?.toLowerCase() === 'admin' ? 'admin' : 'user';
            const token = 'mock-token';
            return res.json({ success: true, token, user: { username, email: `${username}@mock.local`, role } });
        }
        const user = await User.findOne({ username }).select('+password');
        if (!user) return res.status(400).json({ error: "User not found" });

        // verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Wrong password" });

        // return token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ success: true, token, user: { username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: "Login failed" });
    }
};

// acquire user information (need token)
export const getUserProfile = async (req, res) => {
    try {
        if (process.env.MOCK === 'true') {
            return res.json({ username: 'mock', email: 'mock@local', role: req.user?.role || 'user', createdAt: new Date().toISOString() });
        }
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Fetch user failed" });
    }
};

// update user information (need token)
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.email = req.body.email || user.email;
        // 密码更新可选
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }
        await user.save();

        res.json({ success: true, user: { username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};
