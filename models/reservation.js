/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** setter/getter for numGuests */

  /**
   * @param {number} guests
   */
  set numGuests(guests) {
    if (guests < 1) throw new Error("Number of guests must be at least 1");
    this._numGuests = guests;
  }

  get numGuests() {
    return this._numGuests;
  }

  /** setter/getter for startAt */

  /**
   * @param {Date} date
   */
  set startAt(date) {
    if (date instanceof Date) this._startAt = date;
    else throw new Error("A valid date must be provided");
  }

  get startAt() {
    return this._startAt;
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

  /** formatter for startAt */ getformattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, start_at=$2, num_guests=$3, notes=$4
             WHERE id=$5`,
        [this.customerId, this.startAt, this.numGuests, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;
