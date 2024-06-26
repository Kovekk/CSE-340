const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getinventorybyid error " + error)
  }
}

async function registerClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

async function registerInventory(inv_make, invModel, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_discount) {
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_discount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *"
    return await pool.query(sql, [inv_make, invModel, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_discount])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_discount) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10, inv_discount WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_discount, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1 RETURNING *'
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("Delete inventory error")
  }
}

async function getReviewDataByInvId(inv_id) {
  try {
    const sql = 'SELECT * FROM review AS r JOIN account AS a ON r.account_id = a.account_id WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("get review by inv id error: " + error)
  }
}

async function getReviewDataByAccountId(account_id) {
  try {
    const sql = 'SELECT * FROM review AS r JOIN inventory AS i ON r.inv_id = i.inv_id WHERE account_id = $1'
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("get review by account id error: " + error)
  }
}

async function getReviewDataByReviewId(review_id) {
  try {
    const sql = 'SELECT * FROM review AS r JOIN inventory AS i ON r.inv_id = i.inv_id WHERE review_id = $1'
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("get review by review id error: " + error)
  }
}

async function createReview(review_text, inv_id, account_id) {
  try {
    const sql = 'INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *'
    return await pool.query(sql, [review_text, inv_id, account_id])
  } catch (error) {
    console.error("create review error: " + error)
  }
}

async function editReview(review_text, review_id) {
  try {
    const sql = 'UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *'
    const data = await pool.query(sql, [review_text, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("create review error: " + error)
  }
}

async function deleteReview(review_id) {
  try {
    const sql = 'DELETE FROM review WHERE review_id = $1 RETURNING *'  // CREATE A DELETE QUERY ON THE REVIEW TABLE
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("create review error: " + error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, registerClassification, registerInventory, updateInventory, deleteInventory, getReviewDataByInvId, getReviewDataByAccountId, createReview, getReviewDataByReviewId, editReview, deleteReview}