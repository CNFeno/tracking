""" from modeles.utilisateur import Utilisateur
from flask_jwt_extended import create_access_token
from datetime import timedelta """
import base64
from ldap3 import Server, Connection, ALL
from ldap3.utils.conv import escape_filter_chars
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
           ldap_base_dn = current_app.config['LDAP_BASE_DN']
           login = f"{ldap_domain}\\{userId}"  # e.g. MONDOMAINE\\jdoe
           server = Server(ldap_server, get_info=ALL)
           conn = Connection(server, user=login, password=password, auto_bind=True)

           if not conn.bound:
               return {"authenticated": False}

           escaped_user_id = escape_filter_chars(userId)
           conn.search(
               search_base=ldap_base_dn,
               search_filter=f"(sAMAccountName={escaped_user_id})",
               attributes=["thumbnailPhoto", "jpegPhoto"]
           )

           profile_photo = None
           if conn.entries:
               raw_attributes = conn.entries[0].entry_raw_attributes
               photo_values = raw_attributes.get("thumbnailPhoto") or raw_attributes.get("jpegPhoto") or []
               if photo_values:
                   profile_photo = f"data:image/jpeg;base64,{base64.b64encode(photo_values[0]).decode('utf-8')}"

           return {
               "authenticated": True,
               "profile_photo": profile_photo
           }
       except Exception as e:
           print("Erreur LDAP :", e)
           return {"authenticated": False}
