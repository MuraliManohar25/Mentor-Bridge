from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


class UUIDMixin:
    """Mixin to add UUID primary key to models."""
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
