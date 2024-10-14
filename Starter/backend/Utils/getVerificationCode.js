const getVerificationCode = () => {
    const verificationCode = Math.floor(Math.random() * 900000 + 100000).toString();


    return verificationCode
}

module.exports = getVerificationCode  