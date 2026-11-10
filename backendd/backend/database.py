# Database setup. We use SQLite now because it needs no installation.
# To move to MySQL later: pip install pymysql, then change DATABASE_URL to
# "mysql+pymysql://user:password@localhost/caseiq" and remove connect_args.

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./caseiq.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    status = Column(String(50), default="open")  # open, in_review, closed
    document_text = Column(Text)
    summary = Column(Text)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    ai_recommendation = Column(Text, nullable=True)
    analysis_json = Column(Text, nullable=True)  # full analysis saved as text
    created_at = Column(DateTime, default=datetime.utcnow)


class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer)
    decision = Column(String(20))  # approved or rejected
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
