const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// Create a schema.
const userSchema = new Schema({
  method: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    required: true,
  },
  local: {
    email: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
    },
  },
  google: {
    id: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
  },
  facebook: {
    id: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
  },
});

userSchema.pre('save', async function(next) {
  try {
    if (this.method !== 'local') {
      next();
    }
    // Generate a salt.
    const salt = await bcrypt.genSalt(10);
    // Gen pw hash. (salt + hash)
    const pwHash = await bcrypt.hash(this.local.password, salt);
    // Re-assign hashed version over original plain text pw.
    this.local.password = pwHash;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.local.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Create a model.
const User = mongoose.model('user', userSchema);

// Export the model.
module.exports = User;
