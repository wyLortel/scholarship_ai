from fastapi import FastAPI

from app.api import assessments, health
from app.notice import router as notice

app = FastAPI(title="Scholarship AI API")
app.include_router(health.router, prefix="/api")
app.include_router(notice.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
