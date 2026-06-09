"""Point d'entrée FastAPI : CORS, montage des routers, endpoint santé."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, intake, notify, program, progress

app = FastAPI(
    title="Plan Trail API",
    description="API du plan d'entraînement Trail 20 km / 740 m D+ (13 semaines).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(program.router)
app.include_router(progress.router)
app.include_router(intake.router)
app.include_router(admin.router)
app.include_router(notify.router)


@app.get("/health", tags=["meta"], summary="Sonde de santé")
def health() -> dict[str, str]:
    return {"status": "ok"}
