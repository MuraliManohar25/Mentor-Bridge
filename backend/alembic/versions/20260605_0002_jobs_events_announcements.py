"""Add jobs, events, and announcements tables.

Revision ID: 20260605_0002
Revises: 20260604_0001
Create Date: 2026-06-05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260605_0002"
down_revision: Union[str, None] = "20260604_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column(
            "job_type",
            sa.Enum("FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", name="job_type", native_enum=False),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("requirements", sa.JSON(), nullable=True),
        sa.Column("apply_link", sa.String(length=500), nullable=False),
        sa.Column(
            "category",
            sa.Enum("INTERNAL", "EXTERNAL", "OVERSEAS", name="job_category", native_enum=False),
            nullable=False,
        ),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("salary_range", sa.String(length=100), nullable=True),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "CLOSED", name="job_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("posted_by_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["posted_by_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_jobs_id"), "jobs", ["id"], unique=False)
    op.create_index(op.f("ix_jobs_posted_by_id"), "jobs", ["posted_by_id"], unique=False)

    op.create_table(
        "events",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("event_date", sa.String(length=20), nullable=False),
        sa.Column("event_time", sa.String(length=20), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDING", "APPROVED", "REJECTED", name="event_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("organizer_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["organizer_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_events_id"), "events", ["id"], unique=False)
    op.create_index(op.f("ix_events_organizer_id"), "events", ["organizer_id"], unique=False)

    op.create_table(
        "event_rsvps",
        sa.Column("event_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("event_id", "user_id", name="uq_event_user_rsvp"),
    )
    op.create_index(op.f("ix_event_rsvps_event_id"), "event_rsvps", ["event_id"], unique=False)
    op.create_index(op.f("ix_event_rsvps_id"), "event_rsvps", ["id"], unique=False)
    op.create_index(op.f("ix_event_rsvps_user_id"), "event_rsvps", ["user_id"], unique=False)

    op.create_table(
        "announcements",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "priority",
            sa.Enum("HIGH", "MEDIUM", "LOW", name="announcement_priority", native_enum=False),
            nullable=False,
        ),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_announcements_created_by_id"), "announcements", ["created_by_id"], unique=False)
    op.create_index(op.f("ix_announcements_id"), "announcements", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_announcements_id"), table_name="announcements")
    op.drop_index(op.f("ix_announcements_created_by_id"), table_name="announcements")
    op.drop_table("announcements")
    op.drop_index(op.f("ix_event_rsvps_user_id"), table_name="event_rsvps")
    op.drop_index(op.f("ix_event_rsvps_id"), table_name="event_rsvps")
    op.drop_index(op.f("ix_event_rsvps_event_id"), table_name="event_rsvps")
    op.drop_table("event_rsvps")
    op.drop_index(op.f("ix_events_organizer_id"), table_name="events")
    op.drop_index(op.f("ix_events_id"), table_name="events")
    op.drop_table("events")
    op.drop_index(op.f("ix_jobs_posted_by_id"), table_name="jobs")
    op.drop_index(op.f("ix_jobs_id"), table_name="jobs")
    op.drop_table("jobs")
