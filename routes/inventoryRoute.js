// Needed Resources 
const express = require("express")
const app = express()
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const inventoryValidate = require("../utilities/inventoryValidate")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build inventory by detiled item view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
router.get("/", utilities.handleErrors(invController.buildInvManagement))
router.get("/newClassification", utilities.handleErrors(invController.buildNewClassification));
router.get("/newInventory", utilities.handleErrors(invController.buildNewInventory));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory))
router.get("/delete/:inventory_id", utilities.handleErrors(invController.buildDeleteConfirmationInventory))

// Process the classification data
router.post(
    "/newClassification",
    inventoryValidate.classificationRules(),
    inventoryValidate.checkClassificationData,
    utilities.handleErrors(invController.createClassification)
  )

  // Process the inventory data
router.post(
    "/newInventory",
    inventoryValidate.inventoryRules(),
    inventoryValidate.checkInventoryData,
    utilities.handleErrors(invController.createInventory)
  )

router.post(
  "/update",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;