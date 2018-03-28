FROM continuumio/miniconda3:4.4.10

RUN conda update -n base conda && \
    conda config --add channels conda-forge && \
    conda create -y -n flask \
        python=3 \
        scikit-learn \
        flask=0.12 \
        flask-restful

# alternative to `source activate flask`
ENV PATH /opt/conda/envs/flask/bin:$PATH

# can't figure out how to install this into the conda environment
RUN pip install firebase-admin

# Create a flask user to avoid running flask as root
RUN useradd -r flask
COPY . /app
WORKDIR /app
RUN chown -R flask /app
USER flask

ENV FLASK_APP="app.py"

CMD ["flask", "run", "--host=0.0.0.0"]
