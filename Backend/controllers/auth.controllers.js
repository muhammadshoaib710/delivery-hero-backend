import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateTokenAndSetCookie from '../utils/generateToken.js';
import OTP from '../models/otp.model.js';
import otpGenerator from 'otp-generator';

export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password, confirmPassword, gender } =
			req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: 'Username already exists' });
		}

		const emailExists = await User.findOne({ email });

		if (emailExists) {
			return res.status(400).json({ error: 'Email already exists' });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// https://avatar-placeholder.iran.liara.run/

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			email,
		});

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();
			let otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
				lowerCaseAlphabets: false,
				specialChars: false,
			});
		
			let result = await OTP.findOne({ otp: otp });
			while (result) {
				otp = otpGenerator.generate(6, {
					upperCaseAlphabets: false,
				});
				result = await OTP.findOne({ otp: otp });
			}
		
			const otpPayload = { email, otp, user: newUser._id };
			const otpBody = await OTP.create(otpPayload);
		
			res.status(200).json({
				success: true,
				message: 'OTP sent successfully',
				otp,
			});
			
		} else {
			res.status(400).json({ error: 'Invalid user data' });
		}
	} catch (error) {
		console.log('Error in signup controller', error.message);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
export const verifyOTP=async(req,res)=>{

	
	const uOTP = req.body.otp;
console.log(uOTP);

if (uOTP) {
    const otp = await OTP.findOne({ otp: uOTP });
    console.log(otp);
    if (otp) {
        const user = await User.findById(otp.user);
        if (user) {
            user.status = 'verified';
            await user.save();
            await OTP.deleteMany({ user: user._id });
            return res.status(200).json({ message: 'User verified successfully' });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } else {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
} else {
    return res.status(400).json({ error: 'Invalid OTP' });
}
}

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(
			password,
			user?.password || ''
		);

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: 'Invalid username or password' });
		}

		const token = generateTokenAndSetCookie(user._id, res);
		// console.log('token', token);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			status: user.status,
		});
	} catch (error) {
		console.log('Error in login controller', error.message);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie('jwt', '', { maxAge: 0 });
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		console.log('Error in logout controller', error.message);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		const userID = req.user._id;
		const user = await User.findById(userID);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid old password' });
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();

		res.status(200).json({ message: 'Password changed successfully' });
	} catch (error) {
		console.log('Error in login controller', error.message);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

