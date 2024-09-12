'use strict';

const { json } = require('express');
/* Data Access Object (DAO) module for accessing pages data */

const db = require('./db');
const dayjs = require('dayjs');

/** WARNING: 
 * When you are retrieving films, you should not consider the value of the “user” column. When you are creating new films, you should assign all of them to the same user (e.g., user with id=1).
 */

/** NOTE:
 * return error messages as json object { error: <string> }
 */

// This function retrieves the whole list of pages from the database.
exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages ORDER BY publicationDate';
    db.all(sql, (err, rows) => {
      if (err) { reject(err); }
      const pages = rows.map((e) => {
        if (e.publicationDate == null)  // casting NULL value to 0
          e.publicationDate = "";
        else {
          dayjs(e.publicationDate).format("yyyy-MM-dd");
        }
        const page = Object.assign({}, e);  // adding camelcase "creationDate"
        return page;
      });
      resolve(pages);
    });
  });
};

exports.listBlocks = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content_blocks WHERE page_fk =? ORDER BY position';
    db.all(sql, [id], (err, rows) => {
      if (err) { reject(err); }
      const blocks = rows.map((e) => {
        const block = Object.assign({}, e);
        return block;
      });
      resolve(blocks);
    });
  });
};

// This function retrieves a page given its id and the associated user id.
exports.getPage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM pages WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Page not found.' });
      } else {
        const page = Object.assign({}, row);
        resolve(page);
      }
    });
  });
}


exports.getName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT name FROM website_name';
    db.get(sql, (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Name not found.' });
      } else {
        resolve(row.name);
      }
    });
  });
}

exports.setName = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE website_name SET name=? WHERE ID=1';
    db.run(sql, [name], function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve(name);
      }
    });
  });
}

// This function retrieves a page given its id and the associated user id.
exports.getBlock = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content_blocks WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Block not found.' });
      } else {
        // WARN: database is case insensitive. Converting "watchDate" to camel case format
        const block = Object.assign({}, row);  // adding camelcase "watchDate"
        resolve(block);
      }
    });
  });
}

/**
 * This function adds a new page in the database.
 * The page id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.createPage = (page) => {
  // our database is configured to have a NULL value for pages without publicationDate
  if (page.publicationDate == "")
    page.publicationDate = null;

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO pages (title, author, creationdate, publicationdate) VALUES(?, ?, ?, ?)';
    db.run(sql, [page.title, page.author, page.creationDate, page.publicationDate], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties to the client.
      resolve(exports.getPage(this.lastID));
    });
  });
};

exports.createBlocks = (block) => {

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO content_blocks (type, content, position, page_fk) VALUES(?, ?, ?, ?)';
    db.run(sql, [block.type, block.content, block.position, block.page_fk], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties to the client.
      resolve(exports.getBlock(this.lastID));
    });
  });
};

exports.deleteBlocks = (id) => {

  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM content_blocks WHERE page_fk = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties to the client.
      resolve(exports.getBlock(this.lastID));
    });
  });
};

// This function updates an existing page given its id and the new properties.
exports.updatePage = (id, page) => {
  console.log("updatePage dao " + id + " " + JSON.stringify(page));
  // our database is configured to have a NULL value for pages without publicationDate
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE pages SET title = ?, author = ?, creationDate = ?, publicationDate = ? WHERE id = ?';
    db.run(sql, [page.title, page.author, page.creationDate, page.publicationDate, id], function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve(exports.getPage(id));
      }
    });
  });
};

exports.updateBlock = (id, block) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE content_blocks SET type = ?, content = ?, WHERE id = ?';
    db.run(sql, [block.type, block.content, id], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'Block not found.' });
      } else {
        resolve(exports.getPage(id));
      }
    });
  });
};

// This function deletes an existing page given its id.
exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM pages WHERE id = ?';
    db.run(sql, [id], (err) => {
      if (err) {
        reject(err);
      } else
        resolve(null);
    });
  });
}
