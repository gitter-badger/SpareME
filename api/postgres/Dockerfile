from postgres:10.3

RUN apt-get update && \
    apt-get install -y netcat

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \
 CMD nc -z localhost 5432
