FROM debian:8

ADD . /code
WORKDIR /code

ENV PATH="/opt/conda/bin:${PATH}"
ENV FLASK_APP="app.py"
ENV LC_ALL="C.UTF-8"
ENV LANG="C.UTF-8"

RUN apt-get update --fix-missing && apt-get install -y wget bzip2
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda3-5.1.0-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh
RUN pip install -r requirements.txt

CMD ["flask", "run", "--host=0.0.0.0"]
