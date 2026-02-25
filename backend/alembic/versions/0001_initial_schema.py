"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-02-24

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("pin", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_scheduled_today", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "items",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("current_inventory", sa.Float(), nullable=True),
        sa.Column("inventory_unit", sa.String(), nullable=True),
        sa.Column("typical_serving_size", sa.Integer(), nullable=True),
        sa.Column("has_recipe", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("recipe_yield", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "recipe_ingredients",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("recipe_id", sa.String(), sa.ForeignKey("items.id"), nullable=False),
        sa.Column("item_id", sa.String(), sa.ForeignKey("items.id"), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "waste_reasons",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "waste_entries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("item_id", sa.String(), nullable=False),
        sa.Column("item_name", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(), nullable=False),
        sa.Column("reason_id", sa.String(), nullable=True),
        sa.Column("reason_name", sa.String(), nullable=True),
        sa.Column("logged_by_user_id", sa.String(), nullable=False),
        sa.Column("logged_by_name", sa.String(), nullable=False),
        sa.Column("attributed_to_user_id", sa.String(), nullable=True),
        sa.Column("attributed_to_name", sa.String(), nullable=True),
        sa.Column("timestamp", sa.String(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("waste_entries")
    op.drop_table("recipe_ingredients")
    op.drop_table("waste_reasons")
    op.drop_table("items")
    op.drop_table("users")
