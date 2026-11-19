from fastapi import FastAPI

from app import health
from app.eligibility.api import router as eligibility
from app.notice.api import router as notice
from app.preparation.api import router as preparation

app = FastAPI(title="Scholarship AI API")
app.include_router(health.router, prefix="/api")
app.include_router(notice.router, prefix="/api")
app.include_router(eligibility.router, prefix="/api")
app.include_router(preparation.router, prefix="/api")
