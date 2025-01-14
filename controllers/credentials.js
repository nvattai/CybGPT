const isValidEmail = require('email-validator')

const utility = require('../utility/utility.js')

/**
 * Create a new operation to check the credentials of an email address and send the operation code to the user.
 * @param {string} email - The email address to check.
 */

exports.checkEmailCredentials = async function (req, res) {
  const email = req.params.email

  console.log('Check email credentials of ' + email)

  if (isValidEmail.validate(email)) {
    const operationCode = utility.getOperationCode()

    await utility.sendEmail(email, operationCode)

    await utility.createOperation(operationCode, 'checkEmailCredentials', {
      email
    })

    return res.sendStatus(200)
  } else {
    res.sendStatus(400)
  }
}
