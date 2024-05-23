const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let accountName
      if (req.cookies.jwt) {
        accountName = res.locals.accountData.account_firstname
      } else {
        accountName = ""
      }
      const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        isLoggedIn,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        // console.log(account_email)
        if (!emailExists){
          throw new Error("Email does not exist. Please register or try again with a different email.")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    // console.log("EMAIL")
    // console.log(account_email)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let accountName
      if (req.cookies.jwt) {
        accountName = res.locals.accountData.account_firstname
      } else {
        accountName = ""
      }
      const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        isLoggedIn,
        account_email,
      })
      return
    }
    next()
  }

  validate.updateRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
    ]
  }

  validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let accountName
      if (req.cookies.jwt) {
        accountName = res.locals.accountData.account_firstname
      } else {
        accountName = ""
      }
      const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
      res.render("account/updateAccount", {
        errors,
        title: "Update Account",
        nav,
        isLoggedIn,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      })
      return
    } else {
      // If the rest of the data is good, check to ensure the email is not already present in the database.
      // Also check to see whether the user changed the password at all.
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists) {
        const current_email = res.locals.accountData.account_email
    if (current_email == account_email) {
      next()
    } else {
      // If the email already exists and it is not the current email, send an error to the user
      throw new Error("Email exists. Please use a different email")
    }
      } else {
        next()
      }
    }
  }

  validate.passwordRules = () => {
    return [
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  validate.checkPasswordData = async (req, res, next) => {
    const { account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let accountName
      if (req.cookies.jwt) {
        accountName = res.locals.accountData.account_firstname
      } else {
        accountName = ""
      }
      const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
      res.render("account/updateAccount", {
        errors,
        title: "Update Account",
        nav,
        isLoggedIn,
        account_firstname: accountName,
        account_lastname: res.locals.accountData.account_lastname,
        account_email: res.locals.accountData.account_email,
        account_id,
      })
      return
    }
    next()
  }
  
  module.exports = validate