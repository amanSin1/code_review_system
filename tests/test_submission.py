import pytest

def register_and_login(client, role="student"):
    # Register
    client.post(
        "/api/auth/register",
        json={
            "name": f"{role} user",
            "email": f"{role}@example.com",
            "password": "password123",
            "role": role
        }
    )

    # Login
    res = client.post(
        "/api/auth/login",
        json={
            "email": f"{role}@example.com",
            "password": "password123"
        }
    )

    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_student_create_submission(client):
    headers = register_and_login(client, role="student")

    response = client.post(
        "/api/submissions",
        headers=headers,
        json={
            "title": "Test Submission",
            "description": "Test description",
            "code_content": "print('hello')",
            "language": "python",
            "tags": ["python"]
        }
    )

    assert response.status_code == 201
    data = response.json()

    assert data["title"] == "Test Submission"
    assert data["status"] == "pending"

def test_student_get_own_submissions(client):
    headers = register_and_login(client, role="student")

    response = client.get(
        "/api/submissions",
        headers=headers
    )

    assert response.status_code == 200
    assert "submissions" in response.json()


def test_mentor_can_view_all_submissions(client):
    mentor_headers = register_and_login(client, role="mentor")

    response = client.get(
        "/api/submissions",
        headers=mentor_headers
    )

    assert response.status_code == 200
    assert "submissions" in response.json()

def test_submission_requires_auth(client):
    response = client.get("/api/submissions")
    assert response.status_code == 401
