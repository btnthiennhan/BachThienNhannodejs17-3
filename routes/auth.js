var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');

router.post('/signup', async function(req, res, next) {
    try {
        let body = req.body;
        let result = await userController.createUser(
          body.username,
          body.password,
          body.email,
         'user'
        )
        res.status(200).send({
          success:true,
          data:result
        })
      } catch (error) {
        next(error);
      }

});
router.post('/login', async function(req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userController.checkLogin(username,password);
        res.status(200).send({
            success:true,
            data:result
        })
      } catch (error) {
        next(error);
      }

});
router.get('/me',check_authentication, async function(req, res, next){
    try {
      res.status(200).send({
        success:true,
        data:req.user
    })
    } catch (error) {
        next();
    }
});
router.get('/resetPassword/:id', 
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function(req, res, next) {
    try {
      let user = await userSchema.findById(req.params.id);
      if (!user) {
        throw new Error("Không tìm thấy người dùng");
      }
      
      // Đặt lại mật khẩu về "123456"
      user.password = "123456";
      await user.save();
      
      res.status(200).send({
        success: true,
        message: "Mật khẩu đã được đặt lại về 123456",
        data: {
          id: user._id,
          username: user.username
        }
      });
    } catch (error) {
      next(error);
    }
});

// Route đổi mật khẩu
router.post('/changePassword', 
  check_authentication,
  async function(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        throw new Error("Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới");
      }

      // Lấy thông tin người dùng từ req.user (được set bởi check_authentication)
      const user = await userSchema.findById(req.user._id);
      
      // Kiểm tra mật khẩu hiện tại
      if (!bcrypt.compareSync(currentPassword, user.password)) {
        throw new Error("Mật khẩu hiện tại không đúng");
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      await user.save();

      res.status(200).send({
        success: true,
        message: "Đổi mật khẩu thành công"
      });
    } catch (error) {
      next(error);
    }
});
module.exports = router