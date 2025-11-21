""" from modeles.utilisateur import Utilisateur
from flask_jwt_extended import create_access_token
from datetime import timedelta """
from ldap3 import Server, Connection, ALL
from flask import current_app

""" class AuthService:
    @staticmethod
    def authenticate(email, password):
        user = Utilisateur.query.filter_by(email=email).first()
        if user and user.check_password(password):
            token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
            return {"access_token": token, "user": user.to_dict()}
        return None
    @staticmethod """
def ldap_authenticate(userId, password):
       try:
           ldap_server = current_app.config['LDAP_SERVER']
           ldap_domain = current_app.config['LDAP_DOMAIN']
           login = f"{ldap_domain}\\{userId}"  # e.g. MONDOMAINE\\jdoe
           server = Server(ldap_server, get_info=ALL)
           conn = Connection(server, user=login, password=password, auto_bind=True)

           return conn.bind()
       except Exception as e:
           print("Erreur LDAP :", e)
           return False