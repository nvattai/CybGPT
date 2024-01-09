const axios = require('axios')
const isValidIP = require('is-my-ip-valid')()
const isValidEmail = require('email-validator')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const emailProviders = new Set(require('email-providers/all.json'))

const config = require('../config/config.js')
const utility = require('../utility/utility.js')

/**
 * Create a new operation to get the raw pages of the email domain and send the operation code to the user.
 * @param {string} email - The email address to extrract the domain from.
 */
exports.getRawPages = async function (req, res) {
  const email = req.params.email

  console.log('Get raw pages of ' + email)

  if (isValidEmail.validate(email) && !emailProviders.has(email.split('@')[1])) {
    const operationCode = utility.getOperationCode()

    await utility.sendEmail(email, operationCode)

    await utility.createOperation(operationCode, 'getRawPages', {
      email
    })

    return res.json({
      operationResult: 'The request has been sent. Please check your email for the operation code to insert in the chat.'
    })
  } else {
    console.log('422')
    return res.json({
      operationResult: 'Please check the parameters. The email must be a valid business email address.'
    })
  }
}

/**
 * Start the scansion of an ip address and return the result.
 * @param {string} ip - The ip address to scan.
 */
exports.scanIP = async function (req, res) {
  const ip = req.params.ip

  console.log('Scan IP ' + ip)

  if (isValidIP(ip)) {
    try {
      const response = await axios({
        url: `${config.ip_feed}/cyb/scanIP/${ip}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })

      res.json(response.data)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  } else {
    res.sendStatus(400)
  }
}

/**
 * Create an operation to scan a company external surface and send the operation code to the user.
 * @param {string} userEmail - The email address of the user.
 * @param {string} language - The language of the report.
 */
exports.scanCompany = async function (req, res) {
  const userEmail = req.query.userEmail
  const language = req.query.language

  console.log('Scan company ' + userEmail + ' ' + language)

  let validationParameters = true
  if (userEmail && language) {
    if (!isValidEmail.validate(userEmail) || emailProviders.has(userEmail.split('@')[1])) {
      validationParameters = false
    } else if (language.length > 2) {
      validationParameters = false
    }

    if (validationParameters) {
      const operationCode = utility.getOperationCode()

      await utility.sendEmail(userEmail, operationCode)

      await utility.createOperation(operationCode, 'scanCompany', {
        companyName: utility.extractCompanyName(userEmail),
        userEmail,
        language
      })

      return res.json({
        operationResult: 'The request has been sent. Please check your email for the operation code to insert in the chat.'
      })
    } else {
      console.log('422')
      return res.json({
        operationResult: 'Please check the parameters. The email must be a valid business email address and you must specify the language for the report.'
      })
    }
  } else {
    return res.sendStatus(400)
  }
}
