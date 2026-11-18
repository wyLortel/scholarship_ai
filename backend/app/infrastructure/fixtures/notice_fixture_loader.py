"""TEST_ONLY 가상 공고 fixture 로더 (#24).

책임은 하나: 파일을 읽고 형식·완결성을 검사한다. 자격 판정은 하지 않는다(Rule Engine, #27).
- 빈 규칙(BR-B09)·미검증 공고(BR-A05)도 그대로 돌려준다. 막는 것은 판정·목록 쪽 책임.
- 근거 anchor(원문 문장·위치·버전·확인 시각)가 빠진 조건은 거부한다(BR-B06).
- 실제 공고로 오해될 수 있는 데이터(isTestOnly 아님, 가상 도메인 밖 URL)는 거부한다.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

TEST_ONLY_URL_PREFIX = "https://example.org/test-only/"

NonEmpty = Field(min_length=1)


class FixtureError(ValueError):
    """fixture가 형식·완결성 검사를 통과하지 못함."""


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, str_strip_whitespace=True)


def _check_test_only_url(url: str | None) -> None:
    if url is not None and not url.startswith(TEST_ONLY_URL_PREFIX):
        raise ValueError(f"TEST_ONLY 가상 URL이 아님: {url}")


class FixtureEvidence(_Strict):
    evidenceId: str = NonEmpty
    noticeVersionId: str = NonEmpty
    fileId: str = NonEmpty
    location: str = NonEmpty
    quote: str = NonEmpty
    officialUrl: str | None
    checkedAt: datetime
    verifiedAt: datetime | None

    @model_validator(mode="after")
    def _url(self):
        _check_test_only_url(self.officialUrl)
        return self


class FixtureCondition(_Strict):
    conditionId: str = NonEmpty
    label: str = NonEmpty
    field: str = NonEmpty
    op: str = NonEmpty
    value: Any
    evidence: FixtureEvidence


class FixtureDocument(_Strict):
    itemId: str = NonEmpty
    documentName: str = NonEmpty
    reason: str = NonEmpty
    isConditional: bool
    appliesWhen: str | None
    # 없으면 null(=발급처 확인 필요). 빈 문자열로 채우거나 창작하지 않는다.
    issuer: str | None = Field(min_length=1)
    issuanceGuideUrl: str | None = Field(min_length=1)
    evidence: FixtureEvidence

    @model_validator(mode="after")
    def _conditional_has_when(self):
        if self.isConditional and not self.appliesWhen:
            raise ValueError(f"조건부 서류에 appliesWhen 없음: {self.itemId}")
        _check_test_only_url(self.issuanceGuideUrl)
        return self


class FixtureRuleSet(_Strict):
    expression: dict[str, Any]


class FixtureNotice(_Strict):
    noticeId: str = NonEmpty
    noticeVersionId: str = NonEmpty
    isTestOnly: Literal[True]
    title: str = Field(pattern=r"^\[TEST_ONLY\]")
    institution: str = Field(pattern=r"^\[TEST_ONLY\]")
    officialUrl: str | None
    officialSubmissionUrl: str | None
    sourceVerificationStatus: Literal[
        "CANDIDATE", "EXTRACTING", "REVIEW_PENDING", "VERIFIED", "REJECTED"
    ]
    freshnessStatus: Literal["UNCHECKED", "CHECKED_UNCHANGED", "CHECKED_CHANGED", "CHECK_FAILED"]
    lastCheckedAt: datetime | None
    recruitmentStartAt: datetime | None
    recruitmentEndAt: datetime | None
    ruleSet: FixtureRuleSet
    conditions: list[FixtureCondition]
    documents: list[FixtureDocument]

    @model_validator(mode="after")
    def _consistent(self):
        _check_test_only_url(self.officialUrl)
        _check_test_only_url(self.officialSubmissionUrl)

        evidences = [c.evidence for c in self.conditions] + [d.evidence for d in self.documents]
        for ev in evidences:
            if ev.noticeVersionId != self.noticeVersionId:
                raise ValueError(f"근거 버전 불일치: {ev.evidenceId}")

        condition_ids = [c.conditionId for c in self.conditions]
        if len(set(condition_ids)) != len(condition_ids):
            raise ValueError("조건 ID 중복")
        if sorted(_leaf_ids(self.ruleSet.expression)) != sorted(condition_ids):
            raise ValueError("규칙식의 조건 ID와 conditions가 일치하지 않음")
        return self


def _leaf_ids(node: Any) -> list[str]:
    """규칙식의 조건 ID 목록. 형식만 본다(and/or 목록 또는 id 잎) — 평가는 하지 않는다."""
    if not isinstance(node, dict):
        raise ValueError(f"규칙식 노드가 객체가 아님: {node!r}")
    for key in ("and", "or"):
        if key in node:
            if set(node) != {key} or not isinstance(node[key], list):
                raise ValueError(f"잘못된 {key} 노드")
            return [i for child in node[key] for i in _leaf_ids(child)]
    if "id" not in node:
        raise ValueError("규칙식 잎에 id 없음")
    return [node["id"]]


class _FixtureFile(_Strict):
    type: Literal["TEST_ONLY_FAKE_NOTICES_NOT_REAL_ELIGIBILITY"]
    description: str
    notices: list[FixtureNotice]

    @model_validator(mode="after")
    def _unique(self):
        ids = [n.noticeId for n in self.notices]
        if len(set(ids)) != len(ids):
            raise ValueError("공고 ID 중복")
        return self


def load_fixture_notices(path: Path) -> list[FixtureNotice]:
    try:
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
        return _FixtureFile.model_validate(raw).notices
    except (OSError, json.JSONDecodeError, ValidationError) as err:
        raise FixtureError(f"{path}: {err}") from err
