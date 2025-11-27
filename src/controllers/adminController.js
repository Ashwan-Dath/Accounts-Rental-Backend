const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
});

const generateOtp = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

const sendOtpEmail = async (recipient, otp) => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error('SMTP credentials are not configured');
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: 'Admin registration OTP',
    text: `Use the following OTP to verify your admin account: ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Use the following OTP to verify your admin account:</p><h2>${otp}</h2><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`
  });
};

// @desc Register admin
// @route POST /admin/register
// @access Public (should be protected later)
exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, and password'
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await sendOtpEmail(email, otp);

    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.otp;
    delete adminResponse.otpExpires;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully. OTP sent to email.',
      admin: adminResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering admin'
    });
  }
};

// @desc Login admin
// @route POST /admin/login
// @access Public (should be protected later)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!admin.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your account before logging in'
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in admin'
    });
  }
};

// @desc Verify admin OTP
// @route POST /admin/verifyOtp
// @access Public (should be protected later)
exports.verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and otp'
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      otp
    }).select('+password +otp +otpExpires');

    if (!admin || !admin.otpExpires || admin.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    admin.otp = undefined;
    admin.otpExpires = undefined;
    admin.isVerified = true;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      admin: adminResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying OTP'
    });
  }
};

// @desc Resend admin OTP
// @route POST /admin/resendOtp
// @access Public (should be protected later)
exports.resendAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Please enter correct email'
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    admin.otp = otp;
    admin.otpExpires = otpExpires;
    admin.isVerified = false;

    await sendOtpEmail(admin.email, otp);
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resending OTP'
    });
  }
};

// @desc Get all users with pagination
// @route GET /admin/users/all
// @access Private (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const pageInput = req.query.page ?? req.body?.page;
    const page = parseInt(pageInput, 10) > 0 ? parseInt(pageInput, 10) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        pageSize: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users'
    });
  }
};
