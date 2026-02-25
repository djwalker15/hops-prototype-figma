from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, seed, items, users, waste_entries, waste_reasons


def create_app() -> FastAPI:
    app = FastAPI(title="H.O.P.S. API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(seed.router)
    app.include_router(items.router, prefix="/items")
    app.include_router(users.router, prefix="/users")
    app.include_router(waste_entries.router, prefix="/waste-entries")
    app.include_router(waste_reasons.router, prefix="/waste-reasons")

    return app


app = create_app()
