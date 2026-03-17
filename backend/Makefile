.PHONY: install run test cov fmt lint type qa docker-up docker-down migrate migrate-cloudsql

install:
	pip install -U pip
	pip install -r requirements-dev.txt

run:
	uvicorn app.main:app --reload --host 127.0.0.1 --port $${PORT:-8000}

test:
	pytest

cov:
	coverage run -m pytest && coverage html && coverage report -m

fmt:
	black .
	ruff check --fix .

lint:
	ruff check .

type:
	mypy app

qa: fmt lint type
# qa: fmt lint type test

migrate:
	alembic upgrade head

migrate-cloudsql:
	@echo "Requires proxy: cloud-sql-proxy --port 5433 $(CLOUDSQL_CONNECTION_NAME)"
	DB_HOST=127.0.0.1 DB_PORT=5433 alembic upgrade head
