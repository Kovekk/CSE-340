const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
    return [
        // classification is required to have no spaces or special characters
        body("classification_name")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isAlphanumeric()
        .withMessage("Please provide a valid classification.")
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
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
        res.render("inv/newClassification", {
            errors,
            title: "New Classification",
            nav,
            isLoggedIn,
            classification_name,
        })
        return
    }
    next()
}

/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
    return [
        // Make is required to be made of letters
        body("inv_make")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isAlphanumeric()
        .withMessage("Please provide a valid make."),
        
        // Model is required to be made of letters
        body("inv_model")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isAlphanumeric()
        .withMessage("Please provide a valid model."),
        
        // Year is required to be made of 4 numbers that are a year
        body("inv_year")
        .trim()
        .notEmpty()
        .isLength({ min: 4, max: 4 })
        .isNumeric({ no_symbols: true })
        .withMessage("Please provide a valid year."),
        
        // Make is required to be made of letters
        body("inv_description")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid description."),
        
        // Model is required to be made of letters
        body("inv_image")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid image file location."),
        
        // Model is required to be made of letters
        body("inv_thumbnail")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid thumbnail file location."),
        
        // Model is required to be made of letters
        body("inv_price")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isCurrency({ allow_negatives: false })
        .withMessage("Please provide a valid price."),
        
        // Model is required to be made of letters
        body("inv_miles")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isNumeric({ no_symbols: true })
        .withMessage("Please provide a valid mile count."),
        
        // Model is required to be made of letters
        body("inv_color")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isAlpha()
        .withMessage("Please provide a valid color."),
        
        // Model is required to be made of letters
        body("classification_id")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .isNumeric({ no_symbols: true })
        .withMessage("Please select a valid classification.")
    ]
}

validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
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
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "New Inventory",
            nav,
            isLoggedIn,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classificationList,
        })
        return
    }
    next()
}

validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
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
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit " + inv_make + " " + inv_model,
            nav,
            isLoggedIn,
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
            classificationList,
        })
        return
    }
    next()
}

module.exports = validate