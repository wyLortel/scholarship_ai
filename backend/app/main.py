from fastapi import FastAPI

from app.api import assessments, health, notices

app = FastAPI(title="Scholarship AI API")
app.include_router(health.router, prefix="/api")
app.include_router(notices.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
