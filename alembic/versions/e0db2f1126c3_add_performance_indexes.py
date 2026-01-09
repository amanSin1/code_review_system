"""add performance indexes

Revision ID: e0db2f1126c3
Revises: d0b3444b2978
Create Date: 2026-01-09 12:06:38.327658

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0db2f1126c3'
down_revision: Union[str, Sequence[str], None] = 'd0b3444b2978'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Add indexes for frequently queried fields
    op.create_index('ix_submissions_user_id', 'submissions', ['user_id'])
    op.create_index('ix_submissions_status', 'submissions', ['status'])
    op.create_index('ix_submissions_language', 'submissions', ['language'])
    op.create_index('ix_reviews_submission_id', 'reviews', ['submission_id'])
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])

def downgrade():
    op.drop_index('ix_submissions_user_id')
    op.drop_index('ix_submissions_status')
    op.drop_index('ix_submissions_language')
    op.drop_index('ix_reviews_submission_id')
    op.drop_index('ix_notifications_user_id')
    op.drop_index('ix_notifications_is_read')