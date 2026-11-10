
import json

from database import Base, engine, SessionLocal, Case, Review

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Avoid inserting duplicate demo records.
    if db.query(Case).count() > 0:
        print("Cases already exist. No sample data was added.")
    else:
        case1 = Case(
            title="Demo - Identity Verification",
            status="in_review",
            document_text="Identity document with a name mismatch and incomplete date of birth.",
            summary="Identity details need additional verification.",
            risk_score=85,
            risk_level="high",
            ai_recommendation="Send to human review.",
            analysis_json=json.dumps({
                "reasons": ["Name mismatch detected.", "Date of birth needs verification."]
            })
        )

        case2 = Case(
            title="Demo - Employment Verification",
            status="in_review",
            document_text="Employment record has missing joining date and employer details.",
            summary="Employment information is incomplete.",
            risk_score=72,
            risk_level="high",
            ai_recommendation="Request additional employment evidence.",
            analysis_json=json.dumps({
                "reasons": ["Joining date is missing.", "Employer details need confirmation."]
            })
        )

        case3 = Case(
            title="Demo - Education Verification",
            status="closed",
            document_text="Education certificate details match the submitted application.",
            summary="Education details appear consistent.",
            risk_score=18,
            risk_level="low",
            ai_recommendation="Approve after human review.",
            analysis_json=json.dumps({
                "reasons": ["Required education details were found."]
            })
        )

        case4 = Case(
            title="Demo - Address Verification",
            status="closed",
            document_text="Address document contains conflicting address information.",
            summary="Address information requires correction.",
            risk_score=74,
            risk_level="high",
            ai_recommendation="Request corrected address proof.",
            analysis_json=json.dumps({
                "reasons": ["Conflicting address information was detected."]
            })
        )

        case5 = Case(
            title="Demo - Document Completeness",
            status="open",
            document_text="New document submitted for initial review.",
            summary="Document is waiting for analysis.",
            risk_score=None,
            risk_level=None
        )

        db.add_all([case1, case2, case3, case4, case5])
        db.flush()

        db.add_all([
            Review(
                case_id=case3.id,
                decision="approved",
                comment="Demo review: details matched."
            ),
            Review(
                case_id=case4.id,
                decision="rejected",
                comment="Demo review: address details require correction."
            )
        ])

        db.commit()

        print("Successfully added 5 demo cases and 2 demo reviews.")

finally:
    db.close()
