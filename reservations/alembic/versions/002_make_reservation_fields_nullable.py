"""Make reservation fields nullable

Revision ID: 002_make_fields_nullable
Revises: 001_initial_schema
Create Date: 2026-03-27 19:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_make_fields_nullable'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make user_id nullable
    op.alter_column(
        'reservations', 
        'user_id',
        existing_type=sa.String(),
        nullable=True
    )
    
    # Make start_date nullable
    op.alter_column(
        'reservations',
        'start_date',
        existing_type=sa.DateTime(),
        nullable=True
    )
    
    # Make end_date nullable
    op.alter_column(
        'reservations',
        'end_date',
        existing_type=sa.DateTime(),
        nullable=True
    )
    
    # Update default status from 'active' to 'available'
    op.alter_column(
        'reservations',
        'status',
        existing_type=sa.String(),
        server_default='available'
    )


def downgrade() -> None:
    # Revert status default to 'active'
    op.alter_column(
        'reservations',
        'status',
        existing_type=sa.String(),
        server_default='active'
    )
    
    # Revert user_id to NOT NULL
    op.alter_column(
        'reservations',
        'user_id',
        existing_type=sa.String(),
        nullable=False
    )
    
    # Revert start_date to NOT NULL
    op.alter_column(
        'reservations',
        'start_date',
        existing_type=sa.DateTime(),
        nullable=False
    )
    
    # Revert end_date to NOT NULL
    op.alter_column(
        'reservations',
        'end_date',
        existing_type=sa.DateTime(),
        nullable=False
    )
