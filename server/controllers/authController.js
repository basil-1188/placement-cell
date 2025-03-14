import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';


export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Place-Pro | Nirmala College MCA Placement Portal',
            html: `
                <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1'>
                <div style="max-width: 600px; margin: auto; padding: 16px">
                    <h2 style="font-size: 20px; margin: 16px 0">Welcome to Place-Pro</h2>
                    <p style="margin: 0 0 16px">Dear ${name},</p>
                    <p style="margin: 0 0 16px">
                      Welcome to <strong>Place-Pro</strong>, the official placement portal of the <strong>Nirmala College MCA Department</strong>! 🎉
                    </p>
                    <p style="margin: 0 0 16px">
                      Your account has been successfully created. You can now log in using your registered email to explore job opportunities, attend mock tests, and access training resources.
                    </p>
                    <p style="margin: 0 0 16px">
                      Stay updated with the latest placement activities and make the most of this platform.
                    </p>
                    <p style="margin: 0 0 16px">
                      If you have any questions, feel free to reach out to the placement team.
                    </p>
                    <p style="margin: 0">
                      Best regards,<br />
                      <strong>Nirmala College MCA Placement Team</strong>
                    </p>
                  </div>
                </div>
            `
        }
        await transporter.sendMail(mailOptions);

        return res.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error.message);
        return res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and passwords are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Logged Out' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};