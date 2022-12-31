/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  
  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }
  /** search customers by last name. */

static async search(q) {
  const results = await db.query(
    `SELECT id, 
       first_name AS "firstName",  
       last_name AS "lastName", 
       phone, 
       notes
     FROM customers
     WHERE last_name ILIKE $1
     ORDER BY last_name, first_name`,
     [`%${q}%`]
  );
  return results.rows.map(c => new Customer(c));
}
  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

static async topCustomers(){
  const results = await db.query(
    `SELECT c.id, first_name as "firstName", last_name AS "lastName", phone, c.notes, COUNT(customer_id) 
    from customers c JOIN reservations r on c.id = r.customer_id
    GROUP BY c.id ORDER BY count DESC LIMIT 10`
  );
  return results.rows.map(c => new Customer(c));
}

  /**
   * setter/getter for phone number.
   * @param {string} val
   */
  set phone(val) {
    this._phone = val || "";
  }

  get notes() {
    return this._notes;
  }

   /** setter/getter for notes. 
   * @param {string} val
   */
   set notes(val) {
    this._notes = val || "";
  }

  get notes() {
    return this._notes;
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
