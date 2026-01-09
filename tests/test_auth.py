
import uuid


def test_register_user(client):
    unique_email = f"test_{uuid.uuid4()}@example.com"
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": unique_email,
            "password": "testpassword",
            "role": "student"
        }
    )

    assert response.status_code == 200