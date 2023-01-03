
const User = require('./models/user-model');


const deleteUser = (req, res) => {
    const { username } = req.body;
    User.findOneAndDelete({
      username
    })
      .then(user => {
        if(user) {
            
          // res.status(200).json({
          //   message: 'User deleted successfully'
          // });
          res.redirect('/accountmngr');
        } else {
          res.status(404).json({
            message: 'User not found'
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: 'Error processing request'
        });
      });
  };

  module.exports = deleteUser;