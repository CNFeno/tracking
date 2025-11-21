from datetime import timedelta
from urllib.parse import quote_plus
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # Ajout de CORS

db = SQLAlchemy()
jwt = JWTManager()  # Ajout de JWTManager

def create_app():
    app = Flask(__name__)
    password = quote_plus("AdmR@10ced39")
    #app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Base SQLite pour les tests
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://cedrix:{password}@localhost:3306/access_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # 🔹 Clé secrète pour JWT

    app.config['LDAP_SERVER'] = 'ldap://tdcp02wp:389'
    app.config['LDAP_BASE_DN'] = 'DC=corp,DC=telma,DC=mg'
    app.config['LDAP_DOMAIN'] = 'TELMA'

    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)



    db.init_app(app)
    jwt.init_app(app)  # 🔹 Initialisation du JWTManager
    api = Api(app, prefix='/accesstrack/api')
    #api = Api(app)
    CORS(app, origins="http://localhost:3000")  # Autoriser React
    #CORS(app, supports_credentials=True)

    return app, api
