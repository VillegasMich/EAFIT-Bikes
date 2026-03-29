"""Update DateTime columns to be timezone-aware

Revision ID: 003_add_timezone_to_datetime
Revises: 002_make_fields_nullable
Create Date: 2026-03-27 15:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_timezone_to_datetime'
down_revision = '002_make_fields_nullable'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Alter start_date to include timezone
    op.alter_column('reservations', 'start_date',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True)
    
    # Alter end_date to include timezone
    op.alter_column('reservations', 'end_date',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True)
    
    # Alter created_at to include timezone
    op.alter_column('reservations', 'created_at',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=False)
    
    # Alter updated_at to include timezone
    op.alter_column('reservations', 'updated_at',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=False)


def downgrade() -> None:
    # Revert start_date to not include timezone
    op.alter_column('reservations', 'start_date',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True)
    
    # Revert end_date to not include timezone
    op.alter_column('reservations', 'end_date',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True)
    
    # Revert created_at to not include timezone
    op.alter_column('reservations', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=False)
    
    # Revert updated_at to not include timezone
    op.alter_column('reservations', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=False)
