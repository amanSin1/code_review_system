from tests.test_submission import register_and_login


def create_submission(client):
    headers = register_and_login(client, role="student")

    res = client.post(
        "/api/submissions",
        headers=headers,
        json={
            "title": "Review Test",
            "description": "Needs review",
            "code_content": "print('hi')",
            "language": "python"
        }
    )

    return res.json()["id"]

def test_mentor_can_create_review(client):
    submission_id = create_submission(client)
    mentor_headers = register_and_login(client, role="mentor")

    response = client.post(
        "/api/reviews",
        headers=mentor_headers,
        json={
            "submission_id": submission_id,
            "overall_comment": "Good work",
            "rating": 7,
            "annotations": [
                {
                    "line_number": 1,
                    "comment_text": "Nice start"
                }
            ]
        }
    )

    assert response.status_code == 201
    data = response.json()

    assert data["rating"] == 7
    assert len(data["annotations"]) == 1


def test_student_cannot_create_review(client):
    submission_id = create_submission(client)
    student_headers = register_and_login(client, role="student")

    response = client.post(
        "/api/reviews",
        headers=student_headers,
        json={
            "submission_id": submission_id,
            "overall_comment": "Hack attempt",
            "rating": 1
        }
    )

    assert response.status_code == 403


def test_student_can_view_reviews(client):
    submission_id = create_submission(client)
    mentor_headers = register_and_login(client, role="mentor")

    client.post(
        "/api/reviews",
        headers=mentor_headers,
        json={
            "submission_id": submission_id,
            "overall_comment": "Solid",
            "rating": 8
        }
    )

    student_headers = register_and_login(client, role="student")

    response = client.get(
        f"/api/reviews/submission/{submission_id}",
        headers=student_headers
    )

    assert response.status_code == 200
    assert "reviews" in response.json()
