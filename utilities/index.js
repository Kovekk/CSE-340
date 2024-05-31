const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************
 * Constructs the header tools section
 ************************** */
Util.buildHeaderTools = async function (isLoggedIn, accountName) {
  // console.log(isLoggedIn)
  if (isLoggedIn) {
    let html = `<a title="Click to manage account" href="/account/">Hello ${accountName}</a>`
    html += '<a title="Click to logout" href="/account/logout">Logout</a>'
    return html
    
  } else {
    return '<a title="Click to log in" href="/account/login">My Account</a>'
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildDetailsGrid = async function(data) {
  // console.log(typeof data)
  let grid
  if (typeof data != "undefined") {
  grid = `<div class="details">
  <img src="${data.inv_image}" alt="${data.inv_color} ${data.inv_year} ${data.inv_make} ${data.inv_model}}">
  <div class="price">
  <p>$${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>
  <button>Buy Now</button>
  </div>
  <ul>
  <li>Make: ${data.inv_make}</li>
  <li>Model: ${data.inv_model}</li>
  <li>Year: ${data.inv_year}</li>
  <li>Mileage: ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</li>
  <li>Color: ${data.inv_color}</li>
  </ul>
  </div>`
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid // Buttons may be changed to an a tag later
}

/* **************************************
* Build the add-inventory classifications option list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
    if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
      }
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
    })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

Util.checkAccountType = (req, res, next) => {
  const accountType = res.locals.accountData.account_type
  if (accountType == "Employee" || accountType == "Admin") {
    next()
  } else {
    req.flash("notice", "Not an employee or admin")
    return res.redirect("/account/login")
  }
}

Util.buildReviews = async function(isLoggedIn, accountName, accountLastName, inv_id, account_id) {
  const reviewData = await invModel.getReviewDataByInvId(inv_id) // CREATE A JOIN IN THE MODEL TO CONNECT THE ACCOUNT DATA FOR EACH REVIEW
  const firstInitial = accountName.charAt(0)
  let reviews = "<h2>Reviews</h2>"
  reviews += "<ul class='detailReviews'>"
  if (reviewData) {
    reviewData.sort((a, b) => a.review_date - b.review_date);
    reviewData.forEach(async function (review) {
      // console.log(reviewData)
      // const accountData = await accountModel.getAccountById(review.account_id)
      reviews += '<li>'
      const accountFirstInitial = review.account_firstname.charAt(0)
      reviews += '<p>' + accountFirstInitial + ' ' + review.account_lastname + '</p>'
      reviews += '<p>' + review.review_text + '</p>'
      reviews += '</li>'
      // console.log(accountFirstInitial)
    })
  } else {
    console.log("***  NO REVIEW DATA FOR THIS PRODUCT ***")
  }
  
  reviews += "</ul>"
  if (isLoggedIn) {
    reviews += '<form id="createReviewForm" action="/inv/createReview" method="post">'
    reviews += '<label class="reviewScreenName">'
    reviews += firstInitial + ' ' + accountLastName
    reviews += '<textarea id=review_text name=review_text rows="6" cols="50" placeholder="Leave your review here.">'
    reviews += '</textarea>'
    reviews += '</label>'
    reviews += '<input type="hidden" value="'+ inv_id +'" id="inv_id" name="inv_id">'
    reviews += '<input type="hidden" value="'+ account_id +'" id="account_id" name="account_id">'
    reviews += '<input type="submit" id="createReview" name="submit" value="Create Review">'
    reviews += "</form>"
  } else {
    reviews += '<p>To leave a review, please <a href="/account/login">log in</a></p>'
  }
  return reviews
}

Util.buildReviewManagement = async function (accountId) {
  const reviewData = await invModel.getReviewDataByAccountId(accountId)
  let reviewManagement = '<h3>Manage Reviews</h3>'
  if (reviewData) {
    reviewManagement += '<ul class="ReviewManagement">'
    reviewData.forEach(review => {
      reviewManagement += '<li>'
      reviewManagement += '<p class="vehicleReviewed">' + review.inv_make + ' ' + review.inv_model + '</p>'
      reviewManagement += '<p>' + review.review_text + '</p>'
      reviewManagement += '<div class="reviewEditDelete"><a href="/inv/editReview/' + review.review_id + '" class="reviewEdit">Edit</a>'
      reviewManagement += '<a href="/inv/deleteReview/' + review.review_id + '"class="reviewDelete">Delete</a></div>'
    })
    reviewManagement += '<ul>'
  } else {
    console.log("No reviews for this account")
  }
  return reviewManagement
}

module.exports = Util