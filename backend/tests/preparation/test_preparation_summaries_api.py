"""#33 POST /api/preparation-summaries — 서류 체크리스트와 발급 안내 (계약 PreparationSummary).

TEST_ONLY 공고 A: grade >= 2 AND income <= 5, 서류는 재학증명서(발급처 있음)와
조건부 가족관계증명서(발급처 없음). C는 미검증. 증빙 업로드는 없다 (BR-C08).
"""

import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from tests.contract import EXAMPLES_DIR, validate
from tests.eligibility.test_assessments_api import request_a


@pytest.fixture
def client():
    return TestClient(app)


def items(body):
    return {i["itemId"]: i for i in body["checklist"]}


def keys(node):
    if isinstance(node, dict):
        for k, v in node.items():
            yield k
            yield from keys(v)
    elif isinstance(node, list):
        for v in node:
            yield from keys(v)


def test_AC_C05_checklist_has_evidence_no_upload(client):
    response = client.post("/api/preparation-summaries", json=request_a(3, 4))

    assert response.status_code == 200
    body = response.json()
    validate(body, "PreparationSummary")
    enrollment = items(body)["doc-enrollment"]
    assert enrollment["documentName"] == "재학증명서"
    assert enrollment["evidence"]["quote"] == "재학증명서 1부"
    assert enrollment["evidence"]["noticeVersionId"] == "fixture-notice-a-v1"
    assert enrollment["issuer"] == "재학 중인 대학교"
    assert enrollment["issuanceGuideUrl"].startswith("https://example.org/test-only/")
    assert not any("upload" in k.lower() for k in keys(body))


def test_09_2_missing_issuer_is_null_without_fake_url(client):
    body = client.post("/api/preparation-summaries", json=request_a(3, 4)).json()

    family = items(body)["doc-family"]
    assert family["issuer"] is None
    assert family["issuanceGuideUrl"] is None
    assert family["isConditional"] is True
    assert family["appliesWhen"] == "소득구간 확인 서류를 요청받은 경우"


def test_prepared_summary_matches_contract_example(client):
    """#23 mock 예제와 실제 응답이 같아 mock 화면과 실제 화면이 같은 데이터를 본다."""
    body = client.post("/api/preparation-summaries", json=request_a(3, 4)).json()
    example = json.loads(
        (EXAMPLES_DIR / "preparation-summary.prepared.json").read_text(encoding="utf-8")
    )

    assert body == example


def test_BR_A05_unverified_notice_has_no_checklist(client):
    response = client.post(
        "/api/preparation-summaries", json=request_a(3, 4, "fixture-notice-c-v1")
    )

    assert response.status_code == 409
    validate(response.json(), "DomainError")
    assert response.json()["code"] == "NOTICE_NOT_VERIFIED"


def test_unknown_notice_version_is_404(client):
    response = client.post("/api/preparation-summaries", json=request_a(3, 4, "no-such-v1"))

    assert response.status_code == 404
    assert response.json()["code"] == "NOTICE_NOT_FOUND"
