"""Add meetings table.

Revision ID: 20260606_0003
Revises: 20260605_0002
Create Date: 2026-06-06
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260606_0003"
down_revision: Union[str, None] = "20260605_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "meetings",
        sa.Column("student_id", sa.Uuid(), nullable=False),
        sa.Column("alumni_id", sa.Uuid(), nullable=False),
        sa.Column("mentorship_request_id", sa.Uuid(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("meeting_link", sa.String(length=500), nullable=True),
        sa.Column(
            "status",
            sa.Enum("PENDING", "SCHEDULED", "COMPLETED", "CANCELLED", name="meeting_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["alumni_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["mentorship_request_id"], ["mentorship_requests.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_meetings_id"), "meetings", ["id"], unique=False)
    op.create_index(op.f("ix_meetings_student_id"), "meetings", ["student_id"], unique=False)
    op.create_index(op.f("ix_meetings_alumni_id"), "meetings", ["alumni_id"], unique=False)
    op.create_index(op.f("ix_meetings_mentorship_request_id"), "meetings", ["mentorship_request_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_meetings_mentorship_request_id"), table_name="meetings")
    op.drop_index(op.f("ix_meetings_alumni_id"), table_name="meetings")
    op.drop_index(op.f("ix_meetings_student_id"), table_name="meetings")
    op.drop_index(op.f("ix_meetings_id"), table_name="meetings")
    op.drop_table("meetings")
