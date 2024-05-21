import sqlite3 from 'sqlite3'
import type { Database } from 'sqlite';
import { open } from 'sqlite';

let currentHandler: DatabaseHandler;

async function createConnection() {
  return await open({
    filename: "database.db",
    driver: sqlite3.cached.Database,
  })
}

export async function getHandler(): Promise<DatabaseHandler> {
  if (!currentHandler) {
    const db = await createConnection()
    currentHandler = new DatabaseHandler(
      db
    );
  }
  return currentHandler;
}

class DatabaseHandler {
  table_created: boolean;
  db: Database<sqlite3.Database, sqlite3.Statement>;
  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db;
  }

  async createBase() {
    if (!this.table_created) {
      await this.db.exec(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);
      this.table_created = true;
    }
  }

  async create(name: string) {
    if (!this.table_created) await this.createBase();
    const result = await this.db.get(
      `INSERT INTO users (name) VALUES (?) returning id, name`,
      name
    );
    return result;
  }

  async read(id?: number) {
    if (!this.table_created) await this.createBase();
    if (id) {
      const result = await this.db.get(
        `SELECT * FROM users WHERE id = :id returning id, name`,
        { ':id': id }
      );
      return result;
    } else {
      const result = await this.db.all(
        `SELECT * FROM users`
      );
      return result;
    }
  }
  async update(id: number, new_name: string) {
    if (!this.table_created) await this.createBase();
    const result = await this.db.get(
      `UPDATE users SET name = :new_name WHERE id = :id returning id, name`,
      {
        ':new_name': new_name,
        ':id': id
      }
    );
    return result;
  }

  async delete(id: number) {
    if (!this.table_created) await this.createBase();
    const result = await this.db.get(
      `DELETE FROM users WHERE id = :id returning id, name`,
      {
        ':id': id
      }
    );
    return result;
  }
}

export type DBHandler = DatabaseHandler;
