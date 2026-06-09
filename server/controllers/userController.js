import { Op } from 'sequelize';
import User from '../models/User.js';

// @desc    Get all users or search users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user.id;

    let queryCondition = {
      id: { [Op.ne]: currentUserId } // Exclude current user
    };

    if (search) {
      queryCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: queryCondition,
      attributes: ['id', 'name', 'email', 'profilePic', 'isOnline', 'createdAt'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'profilePic', 'isOnline', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
