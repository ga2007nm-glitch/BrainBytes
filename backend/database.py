import os
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


Base = declarative_base()
database_url = os.getenv("DATABASE_URL")
if database_url:
    engine_options = {"pool_pre_ping": True}
    if database_url.startswith("sqlite"):
        engine_options["connect_args"] = {"check_same_thread": False}
    engine = create_engine(database_url, **engine_options)
else:
    database_path = (Path(__file__).resolve().parent / "brainbytes.db").as_posix()
    engine = create_engine(
        f"sqlite:///{database_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True)
    room_id = Column(String(8), nullable=False, unique=True, index=True)
    winner = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


def create_database():
    Base.metadata.create_all(bind=engine)


def save_match(room_id, winner):
    if not room_id or not winner:
        raise ValueError("A room ID and winner are required to save a match.")

    with SessionLocal() as session:
        match = Match(room_id=room_id, winner=winner)
        session.add(match)
        session.commit()
        return match.id