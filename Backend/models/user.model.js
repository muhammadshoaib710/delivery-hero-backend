import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		gender: {
			type: String,
			required: true,
			enum: ['male', 'female'],
		},
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
			},
		],
		customers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Customer',
			},
		],
		shippings: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Shipping',
			},
		],
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
