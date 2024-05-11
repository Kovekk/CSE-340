const inv_model = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await inv_model.getInventoryByClassificationId(classification_id)
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
  const data = await inv_model.getInventoryByInvId(inv_id)
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

module.exports = invCont