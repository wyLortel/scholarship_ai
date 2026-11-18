from fastapi import FastAPI

from app.api import health

app = FastAPI(title="Scholarship AI API")
app.include_router(health.router, prefix="/api")
