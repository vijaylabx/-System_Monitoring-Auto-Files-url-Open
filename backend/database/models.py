from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from datetime import datetime
from .database import Base

class ProcessLog(Base):
    __tablename__ = "process_logs"

    id = Column(Integer, primary_key=True, index=True)
    pid = Column(Integer, index=True)
    name = Column(String, index=True)
    exe = Column(String, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    cpu_percent = Column(Float, nullable=True)
    memory_mb = Column(Float, nullable=True)

class FileLog(Base):
    __tablename__ = "file_logs"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, index=True)
    event_type = Column(String, index=True) # created, modified, deleted, renamed
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_directory = Column(Boolean, default=False)

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    config_json = Column(Text) # Stores URLs, apps, folders
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductivityStat(Base):
    __tablename__ = "productivity_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    app_name = Column(String, index=True)
    active_seconds = Column(Float, default=0.0)
