from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DB_DIR = os.path.dirname(os.path.abspath(__file__))
# Put the DB in the root of the backend folder or project root
DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, '../../system_monitor.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
