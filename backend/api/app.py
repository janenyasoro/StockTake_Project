from django.apps import AppConfig
from flask_cors import CORS

CORS(app,origins=["http://localhost:80", "http://192.168.0.101:80"])


class ApiConfig(AppConfig):
    name = 'api'
