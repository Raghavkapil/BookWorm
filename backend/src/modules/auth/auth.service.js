const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const config = require('../../config/env');

class AuthService {
  async register({ firstName, lastName, email, password }) {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      const error = new Error('Email is already registered');
      error.code = 'EMAIL_ALREADY_EXISTS';
      error.status = 409;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role: 'CUSTOMER',
        giftPointsBalance: 500, // Sign-up bonus gift points
        cart: {
          create: {}
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        giftPointsBalance: true,
        createdAt: true
      }
    });

    // Record welcome bonus gift point transaction
    await prisma.giftPointsTransaction.create({
      data: {
        userId: user.id,
        transactionType: 'CREDIT',
        points: 500,
        referenceId: 'WELCOME_BONUS'
      }
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        cart: true
      }
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.code = 'UNAUTHORIZED';
      error.status = 401;
      throw error;
    }

    // Ensure user has a cart
    if (!user.cart) {
      await prisma.cart.create({
        data: { userId: user.id }
      });
    }

    const token = this.generateToken(user);

    const userPayload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      giftPointsBalance: user.giftPointsBalance,
      createdAt: user.createdAt
    };

    return { user: userPayload, token };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        giftPointsBalance: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' }
        }
      }
    });

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return user;
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}

module.exports = new AuthService();
