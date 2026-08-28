const mongoose = require('mongoose')

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        require: [true,"token is required to be added to blacklist"]
    }
}, {
     timestamps: true
})

const tokenBlacklistModel = mongoose.model("blacklistTokens",blacklistTokenSchema)

module.exports = tokenBlacklistModel