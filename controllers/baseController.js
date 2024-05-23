const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  // console.log(req.cookies.jwt)
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  res.render("index", {title: "Home", nav, isLoggedIn})
}

module.exports = baseController