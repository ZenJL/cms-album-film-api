const router = require('express').Router();
const jwt = require('jsonwebtoken');

// @route   POST /api/auth
// @desc    authorize user
// @access  Public
router.post('/', async (req, res) => {
    const token = req.header('x-auth-token');
    if(!token) {
        return res.statusCode(400).json({
            message: 'Access denied'
        })
    }

    // verify token
    try {
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        res.status(200).json({
            user,
            isSuccess: true
        })
    } catch (error) {
        res.status(500).json({
            message: 'Sever Error',
            isSuccess: false
          })
    }

})

module.exports = router;