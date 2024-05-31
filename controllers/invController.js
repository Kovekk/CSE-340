const inventory_model = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await inventory_model.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    isLoggedIn,
    grid,
  })
}

/* ***************************
 *  Build inventory by details view
 * ************************** */

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  if (inv_id == 424242) {
    throw new Error("Easter egg found!")
  } else {
  const data = await inventory_model.getInventoryByInvId(inv_id)
  const grid = await utilities.buildDetailsGrid(data) // MAKE IN UTILITIES
  let nav = await utilities.getNav()
  let accountName
  let accountLastName
  let account_id
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
    accountLastName = res.locals.accountData.account_lastname
    account_id = res.locals.accountData.account_id
  } else {
    accountName = ""
    accountLastName = ""
    account_id = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  const invMake = data.inv_make
  const invModel = data.inv_model
  const invYear = data.inv_year
  const reviews = await utilities.buildReviews(req.cookies.jwt, accountName, accountLastName, inv_id, account_id)
  res.render("./inventory/details", {
    title: invYear + " " + invMake + " " + invModel,
    nav,
    isLoggedIn,
    grid,
    reviews, // is the comma necessary?
  })
}
}

/* ****************************************
*  Deliver InvManagement view
* *************************************** */
invCont.buildInvManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    isLoggedIn,
    classificationSelect,
  })
}

/* ****************************************
*  Deliver newClassification view
* *************************************** */
invCont.buildNewClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  res.render("inventory/add-classification", {
    title: "New Classification",
    nav,
    isLoggedIn,
    errors: null,
  })
}

/* ****************************************
*  Deliver newInventory view
* *************************************** */
invCont.buildNewInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "New Inventory",
    nav,
    isLoggedIn,
    classificationList,
    errors: null,
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image_tn.png"
  })
}

/* ****************************************
*  Process Classification
* *************************************** */
invCont.createClassification = async function (req, res) {
  const { classification_name } = req.body

  const regResult = await inventory_model.registerClassification(classification_name)

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, new classification "${classification_name}" has been created!`
    )
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    res.status(201).render("inventory/add-classification", {
      title: "New Classification",
      nav,
      isLoggedIn,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, creation of new classification failed.")
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    res.status(501).render("inventory/add-classification", {
      title: "New Classification",
      nav,
      isLoggedIn,
      errors: null,
    })
  }
}

invCont.createInventory = async function (req, res) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  const regResult = await inventory_model.registerInventory(
    inv_make,
    inv_model,
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, new inventory item "${inv_make} ${inv_model}" has been created!`
    )
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.status(201).render("inventory/add-inventory", {
      title: "New Inventory",
      nav,
      isLoggedIn,
      classificationList,
      errors: null,
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image_tn.png"
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await inventory_model.getInventoryByClassificationId(classification_id)
  // console.log(invData)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ****************************************
*  Deliver editInventory view
* *************************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inventory_id = req.params.inventory_id
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  const itemData = await inventory_model.getInventoryByInvId(inventory_id)
  let classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = itemData.inv_make + " " + itemData.inv_model
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    isLoggedIn,
    // POSSIBIBLE PROBLEM AREA, MIGHT NEED TO BE CLASSIFICATIONSELECT INSTEAD
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

invCont.updateInventory = async function (req, res) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body

  const updateResult = await inventory_model.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_year, 
    inv_miles, 
    inv_color, 
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash(
      "notice",
      `The ${itemName} was successfully updated!`
    )
    res.redirect("/inv/")
  } else {
    const nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    isLoggedIn,
    classificationList: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ****************************************
*  Deliver deleteInventory view
* *************************************** */
invCont.buildDeleteConfirmationInventory = async function (req, res, next) {
  const inventory_id = req.params.inventory_id
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  const itemData = await inventory_model.getInventoryByInvId(inventory_id)
  let classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = itemData.inv_make + " " + itemData.inv_model
  res.render("inventory/delete-inventory", {
    title: "delete " + itemName,
    nav,
    isLoggedIn,
    // POSSIBIBLE PROBLEM AREA, MIGHT NEED TO BE CLASSIFICATIONSELECT INSTEAD
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

invCont.deleteInventory = async function (req, res) {
  const { inv_id } = req.body

  const updateResult = await inventory_model.deleteInventory(inv_id)

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    // console.log("LOOK HERE")
    // console.log(updateResult)
    req.flash(
      "notice",
      `The ${itemName} was successfully deleted!`
    )
    res.redirect("/inv/")
  } else {
    let nav = await utilities.getNav()
    let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-inventory", {
    title: "Edit " + itemName,
    nav,
    isLoggedIn,
    classificationList: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    })
  }
}

invCont.createReview = async function (req, res) {
  const {review_text, inv_id, account_id} = req.body
  console.log("IS THIS EVEN RUNNING?")

  const result = await inventory_model.createReview(review_text, inv_id, account_id)

  if (result) {
    res.redirect(`detail/${inv_id}`)
  } else {
    res.redirect(`detail/${inv_id}`)
  }
}

invCont.buildEditReview = async function (req, res) {
  const review_id = req.params.review_id
  let reviewData = await inventory_model.getReviewDataByReviewId(review_id)
  const makeModel = reviewData.inv_make + ' ' + reviewData.inv_model
  console.log(reviewData)
  const review_text = reviewData.review_text
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  res.render("inventory/edit-review", {
    title: "Edit Review",
    nav,
    isLoggedIn,
    errors: null,
    makeModel,
    review_text,
    review_id,
  })
}

invCont.editReview = async function (req, res) {
  const {review_text, review_id} = req.body

  const updateResult = await inventory_model.editReview(review_text, review_id)

  if (updateResult) {
    req.flash("notice", "Your Review was successfully changed!")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, your review was unable to be changed.")
    const review_id = req.params.review_id
    let reviewData = await inventory_model.getReviewDataByReviewId(review_id)
    const makeModel = reviewData.inv_make + ' ' + reviewData.inv_model
    let nav = await utilities.getNav()
    let accountName
    if (req.cookies.jwt) {
      accountName = res.locals.accountData.account_firstname
    } else {
      accountName = ""
    }
    const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    res.render("inventory/edit_review", {
      title: "Edit Review",
      nav,
      isLoggedIn,
      errors: null,
      makeModel,
      review_text,
      review_id,
    })
  }
}

invCont.buildDeleteReview = async function (req, res) {
  const review_id = req.params.review_id
  let reviewData = await inventory_model.getReviewDataByReviewId(review_id)
  const makeModel = reviewData.inv_make + ' ' + reviewData.inv_model
  console.log(reviewData)
  const review_text = reviewData.review_text
  let nav = await utilities.getNav()
  let accountName
  if (req.cookies.jwt) {
    accountName = res.locals.accountData.account_firstname
  } else {
    accountName = ""
  }
  const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
  res.render("inventory/delete-review", {
    title: "Delete Review",
    nav,
    isLoggedIn,
    errors: null,
    makeModel,
    review_text,
    review_id,
  })
}

invCont.deleteReview = async function (req, res) {
  const {review_text, review_id} = req.body

  const updateResult = await inventory_model.deleteReview(review_id)

  if (updateResult) {
    req.flash("notice", "Your Review was successfully deleted!")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, your review was unable to be deleted.")
    const review_id = req.params.review_id
    let reviewData = await inventory_model.getReviewDataByReviewId(review_id)
    const makeModel = reviewData.inv_make + ' ' + reviewData.inv_model
    let nav = await utilities.getNav()
    let accountName
    if (req.cookies.jwt) {
      accountName = res.locals.accountData.account_firstname
    } else {
      accountName = ""
    }
    const isLoggedIn = await utilities.buildHeaderTools(req.cookies.jwt, accountName)
    res.render("inventory/delete_review", {
      title: "Edit Review",
      nav,
      isLoggedIn,
      errors: null,
      makeModel,
      review_text,
      review_id,
    })
  }
}

module.exports = invCont