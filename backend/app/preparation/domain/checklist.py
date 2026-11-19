"""서류 체크리스트 규칙 (09 §2, BR-C05, BR-C08). FastAPI·저장소를 모른다.

- 검증된 공고 버전의 서류 요구만 항목으로 만든다. 다른 버전 근거의 서류는 넣지 않는다.
- 발급처·안내 URL을 만들어 내지 않는다. 없으면 None(화면: "발급처 확인 필요").
- 공식 안내 URL은 근거가 검증된 경우에만 보여 준다.
- 학생 증빙 파일을 받지 않는다. 항목은 "무엇을 어디서 발급받는지" 안내뿐이다.
"""

from dataclasses import replace

from app.notice.domain.model import NoticeDocument


def build_checklist(
    notice_version_id: str, documents: tuple[NoticeDocument, ...]
) -> tuple[NoticeDocument, ...]:
    return tuple(_item(d) for d in documents if d.evidence.noticeVersionId == notice_version_id)


def _item(document: NoticeDocument) -> NoticeDocument:
    if document.evidence.verifiedAt is None:
        return replace(document, issuanceGuideUrl=None)
    return document
