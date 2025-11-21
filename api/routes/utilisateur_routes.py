#from utilisateur_controller import UtilisateurControleur

from controleurs.utilisateur_controller import UtilisateurControleur
from controleurs.auth_controleur import AuthControleur


def init_routes(api):
    api.add_resource(AuthControleur, '/login')
    api.add_resource(UtilisateurControleur, '/utilisateurs', '/utilisateurs/<int:user_id>')
