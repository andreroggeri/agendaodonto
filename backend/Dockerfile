FROM python:3.10 as builder
WORKDIR /app
COPY ./requirements.txt .
RUN pip install -r requirements.txt --target=/app/pip-packages

FROM python:3.10
WORKDIR /app
COPY --from=builder /app/pip-packages /app/pip-packages
COPY . .

ENV PYTHONPATH "${PYTHONPATH}:/app/pip-packages"
ENV PATH "${PATH}:/app/pip-packages/bin"
ENV PORT 8000

COPY ./docker-entrypoint.sh /app/docker-entrypoint.sh
RUN ["chmod", "+x", "/app/docker-entrypoint.sh"]

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
