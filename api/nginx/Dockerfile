FROM nginx:1.13.10

RUN apt-get update && \
    apt-get install -y netcat

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \
 CMD nc -z localhost 80

COPY nginx.conf /etc/nginx/nginx.conf
