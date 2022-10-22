FROM python:3.8 as builder
WORKDIR /app
COPY ./requirements.txt .
RUN pip install -r requirements.txt --target=/app/pip-packages

FROM python:3.8
WORKDIR /app
COPY --from=builder /app/pip-packages /app/pip-packages
COPY . .

ENV PYTHONPATH "${PYTHONPATH}:/app/pip-packages"
ENV PATH "${PATH}:/app/pip-packages/bin"

COPY ./dependencies/app/docker-entrypoint.sh /app/docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
