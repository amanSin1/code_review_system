def serialize_annotations(annotations):
    return [
        {
            "id" : a.id,
            "line_number" : a.line_number,
            "comment_text" : a.comment_text,

        }
        for a in annotations
    ]

def serialize_reviews(reviews):
    return [
        {
            "id" : review.id,
            "reviewer":{
                "id" : review.reviewer.id,
                "name" : review.reviewer.name
            },
            "overall_comments" : review.overall_comment,
            "rating": review.rating,
            "created_at" : review.createrd_at,
            "annotations" : serialize_annotations(review.annotations)
        }
        for review in reviews
    ]

def serialize_submission(submission):
    return {
        "id": submission.id,
        "user": {
            "id": submission.user.id,
            "name": submission.user.name,
            "email": submission.user.email
        },
        "title": submission.title,
        "description": submission.description,
        "code_content": submission.code_content,
        "language": submission.language,
        "status": submission.status,
        "tags": [tag.name for tag in submission.tags],
        "created_at": submission.created_at,
        "updated_at": submission.updated_at,
        "reviews": serialize_reviews(submission.reviews)
    }
