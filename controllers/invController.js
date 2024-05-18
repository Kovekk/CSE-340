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
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
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
  const invMake = data.inv_make
  const invModel = data.inv_model
  const invYear = data.inv_year
  res.render("./inventory/details", {
    title: invYear + " " + invMake + " " + invModel,
    nav,
    grid, // is the comma necessary?
  })
}
}

/* ****************************************
*  Deliver InvManagement view
* *************************************** */
invCont.buildInvManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
  })
}

/* ****************************************
*  Deliver newClassification view
* *************************************** */
invCont.buildNewClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "New Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver newInventory view
* *************************************** */
invCont.buildNewInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "New Inventory",
    nav,
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
    res.status(201).render("inventory/add-classification", {
      title: "New Classification",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, creation of new classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "New Classification",
      nav,
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
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.status(201).render("inventory/add-inventory", {
      title: "New Inventory",
      nav,
      classificationList,
      errors: null,
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image_tn.png"
    })
  }
}

module.exports = invCont