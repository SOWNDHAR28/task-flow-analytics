from django.db import migrations


class Migration(migrations.Migration):
    """
    common app has no concrete models (BaseModel is abstract),
    so this migration is intentionally empty.
    """

    initial = True
    dependencies = []
    operations = []
