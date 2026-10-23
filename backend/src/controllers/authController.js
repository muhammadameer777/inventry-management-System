import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'campusevents-secret-key';
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
};

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  organization: user.organization,
  bio: user.bio,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization, role } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Full name is required.' });
    if (!email?.trim() || !/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Only allow ORGANIZER self-registration; ADMIN must be created manually
    const assignedRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        phone: phone?.trim() || null,
        organization: organization?.trim() || null,
      },
    });

    const token = generateToken(newUser);
    return res.status(201).json({ success: true, message: 'Account created successfully.', token, user: safeUser(newUser) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken(user);
    return res.status(200).json({ success: true, message: 'Signed in successfully.', token, user: safeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, organization, bio } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(organization !== undefined ? { organization: organization?.trim() || null } : {}),
        ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
      },
    });
    return res.status(200).json({ success: true, message: 'Profile updated.', user: safeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
