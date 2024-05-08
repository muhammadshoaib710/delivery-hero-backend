import express from 'express';
import {
	login,
	logout,
	signup,
	changePassword,
} from '../controllers/auth.controllers.js';
import protectRoute from '../middleware/protectedRoute.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);
router.post('/change-password', protectRoute, changePassword);

export default router;
