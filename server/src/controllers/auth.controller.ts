import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const getCaptcha = (req: Request, res: Response) => {
  const captcha = svgCaptcha.create();

  (req.session as any).captcha = {
    text: captcha.text,
    expires: Date.now() + 5 * 60 * 1000
  };

  res.type('svg');
  res.status(200).send(captcha.data);
};

export const login = async (req: Request, res: Response) => {
  const { username, password, captcha } = req.body;

  const sessionCaptcha = (req.session as any).captcha;

  if (
    !sessionCaptcha ||
    sessionCaptcha.expires < Date.now() ||
    sessionCaptcha.text.toLowerCase() !== captcha?.toLowerCase()
  ) {
    return res.status(400).json({ message: 'Invalid or expired CAPTCHA' });
  }

  // Clear captcha after use
  delete (req.session as any).captcha;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, role: user.role, level: user.level },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.json({
    message: 'Login successful',
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      level: user.level,
      balance: user.balance,
      parentId: user.parentId
    }
  });
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.json({ isAuthenticated: false });
    }

    res.json({
      isAuthenticated: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        level: user.level,
        balance: user.balance,
        parentId: user.parentId
      }
    });
  } catch {
    res.json({ isAuthenticated: false });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  req.session?.destroy(() => { });
  res.json({ message: 'Logged out' });
};
