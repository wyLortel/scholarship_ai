from fastapi import FastAPI

from app import health
from app.eligibility import router as eligibility
from app.notice import router as notice

app = FastAPI(title="Scholarship AI API")
app.include_router(health.router, prefix="/api")
app.include_router(notice.router, prefix="/api")
app.include_router(eligibility.router, prefix="/api")
