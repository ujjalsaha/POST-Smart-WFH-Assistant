import sqlite3

class PostDB:
    def __init__(self):
        """
        Constructor - Create connection and default tables. 
        Auto skips creation if already created
        """
        self.conn = None
        self.row_count = None
        self.error = None
        self.__connect()
        self.__create_tables() 

    def __del__(self):
        """
        Destructor - close the conn - safe exit
        """
        self.conn.commit()
        self.conn.close()

    def __connect(self):
        """
        Creates database if already not created else gets the db connection
        """

        databaseFile="./post.db"
        if self.conn is None:
            self.conn = sqlite3.connect(databaseFile)

        self.conn.row_factory = sqlite3.Row    

    def __create_tables(self):
        """
        Create necessary tables if already not created
        """

        try:
            c = self.conn.cursor()

            # VOICE DETECTION TRACKING TABLE
            c.execute("""CREATE TABLE IF NOT EXISTS voice (
                          v_id     INTEGER PRIMARY KEY,
                          v_date   DATE NOT NULL DEFAULT (date('now','localtime')),
                          v_time   TEXT NOT NULL DEFAULT (time('now','localtime')), 
                          v_speech TEXT NOT NULL
                          )""")

            # MOTION DETECTION TRACKING TABLE
            c.execute("""CREATE TABLE IF NOT EXISTS motion (
                          m_id   INTEGER PRIMARY KEY,
                          m_date   DATE NOT NULL DEFAULT (date('now','localtime')),
                          m_time   TEXT NOT NULL DEFAULT (time('now','localtime')), 
                          m_value TEXT NULL
                          )""")

            # FACE DETECTION TRACKING TABLE
            c.execute("""CREATE TABLE IF NOT EXISTS face (
                          f_id       INTEGER PRIMARY KEY,
                          f_date     DATE NOT NULL DEFAULT (date('now','localtime')),
                          f_time     TEXT NOT NULL DEFAULT (time('now','localtime')), 
                          f_name TEXT NOT NULL 
                          )""")

            self.conn.commit()
            c.close()
        except:
            pass

    def show_tables(self):
        cursor = self.conn.execute("SELECT name "
                                   "  FROM sqlite_master "
                                   " WHERE type='table';")
        tables = [v[0] for v in cursor.fetchall() if v[0] != "sqlite_sequence"]
        cursor.close()

        return tables

    def insert_voice(self, speech: str) -> bool:
        """
        Insert data to voice table

        :param str speech: speech text
        :return bool: 
        """
        ret = True
        try:
            c = self.conn.cursor()
            result = c.execute(f"INSERT INTO voice (v_speech) VALUES ('{speech}')")
            self.conn.commit()
            c.close()

        except Exception as e:
            self.error = f"Error while inserting data into voice : {str(e)}"
            ret = False 
            print(f"Error encountered: {str(e)}") 

        return ret

    def insert_face(self, name: str) -> bool:
        """
        Insert data to face table

        :param bool is_detected: is right face detected or wrong
        :return bool: 
        """
        ret = True
        try:
            c = self.conn.cursor()
            result = c.execute(f"INSERT INTO face (f_name) VALUES ('{name}')")
            self.conn.commit()
            c.close()

        except Exception as e:
            self.error = f"Error while inserting data into face table: {str(e)}"
            ret = False 
            print(f"Error encountered: {str(e)}") 

        return ret

    def insert_motion(self, value: str) -> bool:
        """
        Insert data to motion table

        :param str value: motion value text
        :return bool: 
        """
        ret = True
        try:
            c = self.conn.cursor()
            result = c.execute(f"INSERT INTO motion (m_value) VALUES ('{value}')")
            self.conn.commit()
            c.close()

        except Exception as e:
            self.error = f"Error while inserting data into motion table: {str(e)}"
            ret = False 
            print(f"Error encountered: {str(e)}") 

        return ret

    def execute(self, query: str) -> list:
        """
        Executes a query

        :param str query: 
        :return list: list of dict with each dict representing a row 
        """
        result = []
        try:
            c = self.conn.cursor()
            result = c.execute(query)
            self.conn.commit()
            rows = c.fetchall()
            result =  [dict(zip(row.keys(), row)) for row in rows]
            c.close()

        except Exception as e:
            self.error = f"Error encountered while executing query\n{query}\n{str(e)}"
            print(f"Error encountered: {str(e)}") 

        return result



