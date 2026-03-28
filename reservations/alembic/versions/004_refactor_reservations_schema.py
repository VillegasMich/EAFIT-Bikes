"""Refactor schema: separate bikes table and reservations table

This migration:
1. Creates a 'bikes' table to track registered bikes
2. Migrates existing draft reservations to the bikes table
3. Removes draft reservations from the reservations table
4. Modifies 'reservations' table to only store actual reservations with date ranges
5. Removes status column (no longer needed - availability is determined by date conflicts)

Revision ID: 004_refactor_reservations_schema
Revises: 003_add_timezone_to_datetime
Create Date: 2026-03-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_refactor_reservations_schema'
down_revision = '003_add_timezone_to_datetime'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create bikes table to track registered bikes
    op.create_table(
        'bikes',
        sa.Column('bike_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('bike_id')
    )
    op.create_index('idx_bikes_created_at', 'bikes', ['created_at'], unique=False)
    
    # Get connection for raw SQL
    connection = op.get_bind()
    
    # Step 1: Extract distinct bike_ids from draft reservations and insert into bikes table
    # Draft reservations are those with status='available' and NULL user_id
    try:
        connection.execute(sa.text("""
            INSERT INTO bikes (bike_id, created_at, updated_at)
            SELECT DISTINCT bike_id, COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
            FROM reservations
            WHERE status = 'available' AND user_id IS NULL
            ON CONFLICT (bike_id) DO NOTHING
        """))
    except Exception:
        pass  # If no draft reservations exist, that's fine
    
    # Step 2: Delete ALL draft reservations (those with status='available' and NULL user_id)
    connection.execute(sa.text("""
        DELETE FROM reservations
        WHERE status = 'available' AND user_id IS NULL
    """))
    
    # Step 3: Drop existing indexes before modifying schema
    op.drop_index('idx_reservations_user_id', table_name='reservations')
    op.drop_index('idx_reservations_bike_id', table_name='reservations')
    
    # Step 4: Drop status column first (before altering user_id)
    op.drop_column('reservations', 'status')
    
    # Step 5: Modify remaining columns to NOT NULL
    # At this point, only actual reservations remain (with user_id, start_date, end_date populated)
    op.alter_column('reservations', 'user_id', existing_type=sa.String(), nullable=False)
    op.alter_column('reservations', 'start_date', existing_type=sa.DateTime(timezone=True), nullable=False)
    op.alter_column('reservations', 'end_date', existing_type=sa.DateTime(timezone=True), nullable=False)
    
    # Step 6: Recreate indexes with better coverage for query performance
    op.create_index('idx_reservations_bike_id', 'reservations', ['bike_id'], unique=False)
    op.create_index('idx_reservations_user_id', 'reservations', ['user_id'], unique=False)
    op.create_index('idx_reservations_bike_date_range', 'reservations', ['bike_id', 'start_date', 'end_date'], unique=False)


def downgrade() -> None:
    # Drop new indexes
    op.drop_index('idx_reservations_bike_date_range', table_name='reservations')
    op.drop_index('idx_reservations_user_id', table_name='reservations')
    op.drop_index('idx_reservations_bike_id', table_name='reservations')
    
    # Restore reservations table structure
    op.add_column('reservations', sa.Column('status', sa.String(), server_default='available', nullable=False))
    op.alter_column('reservations', 'user_id', existing_type=sa.String(), nullable=True)
    op.alter_column('reservations', 'start_date', existing_type=sa.DateTime(timezone=True), nullable=True)
    op.alter_column('reservations', 'end_date', existing_type=sa.DateTime(timezone=True), nullable=True)
    
    # Recreate old indexes
    op.create_index('idx_reservations_user_id', 'reservations', ['user_id'], unique=False)
    op.create_index('idx_reservations_bike_id', 'reservations', ['bike_id'], unique=False)
    
    # Drop bikes table
    op.drop_index('idx_bikes_created_at', table_name='bikes')
    op.drop_table('bikes')
