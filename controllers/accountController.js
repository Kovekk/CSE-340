const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    res.render("account/login", {
      title: "Login",
      nav,
      isLoggedIn,
      errors: null,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    res.render("account/register", {
      title: "Register",
      nav,
      isLoggedIn,
      errors: null,
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      isLoggedIn,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        isLoggedIn,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        isLoggedIn,
        errors: null,
      })
    }
  }

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    isLoggedIn,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
    console.log(error)
   return new Error('Access Forbidden')
  }
 }

   /* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  res.locals.loggedin = 0
  res.locals.accountData = {}
  res.clearCookie("jwt")
  res.redirect("/")
}

async function buildAccountManagement(req, res) {
  // console.log(res.locals.accountData)
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  console.log(res.locals.accountData.account_firstname)
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    isLoggedIn,
    errors: null,
    accountName: res.locals.accountData.account_firstname,
    accountType: res.locals.accountData.account_type,
  })
}

async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  res.render("account/updateAccount", {
    title: "Update Account",
    nav,
    isLoggedIn,
    errors: null,
    account_firstname: accountName,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email,
    account_id: res.locals.accountData.account_id,
  })
}

async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const updateResult = await accountModel.updateAccount(
    account_firstname, 
    account_lastname, 
    account_email, 
    account_id
  )

  if (updateResult) {
    let accountData = res.locals.accountData
    accountData.account_firstname = account_firstname
    accountData.account_lastname = account_lastname
    accountData.account_email = account_email
    res.clearCookie("jwt")

    req.flash(
      "notice",
      "Your account has been updated"
    )
    res.redirect("/account/")
  } else {
    const nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    req.flash("notice", "Sorry, the update has failed.")
    res.status(501).render("account/updateAccount", {
      title: "Update Account",
      nav,
      isLoggedIn,
      errors: null,
      account_firstname, 
      account_lastname, 
      account_email, 
      account_id,
    })
  }
}

async function changePassword(req, res) {
  const { account_password, account_id } = req.body
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      isLoggedIn,
      errors: null,
    })
  }

  const changeResult = accountModel.changePassword(hashedPassword, account_id)

  if (changeResult) {
    req.flash(
      "notice",
      `Congratulations, the password has been changed`
    )
    res.status(201).render("account/accountManagement", {
      title: "Manage Account",
      nav,
      isLoggedIn,
      errors: null,
      accountName: res.locals.accountData.account_firstname,
      accountType: res.locals.accountData.account_type,
    })
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    res.status(501).render("account/updateAccount", {
      title: "Registration",
      nav,
      isLoggedIn,
      errors: null,
      account_firstname: res.locals.accountData.account_firstname, 
      account_lastname: res.locals.accountData.account_lastname, 
      account_email: res.locals.accountData.account_email, 
      account_id: res.locals.accountData.account_id,
    })
  }
}
  
  module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accountLogout, buildUpdateAccount, updateAccount, changePassword }