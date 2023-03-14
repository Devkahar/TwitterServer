const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    avatar: {
        type: String,
    },
    bio:{
        type: String,
    },
    follower_count:{
        type: Number,
    },
    following_count:{
        type: Number,
    }
}, {
    timestamps: true,
})


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
    if(this.password===""){
        next();
        return;
    }
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema);

module.exports = User;