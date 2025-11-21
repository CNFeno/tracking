from controleurs.historique_action_controleur import (
    HistoriqueActionControleur,
    HistoriqueByUtilisateurControleur,
    HistoriqueByAccesControleur
)

def init_historique_action_routes(api):
    api.add_resource(HistoriqueActionControleur, '/historique_actions', '/historique_actions/<int:historique_id>')
    api.add_resource(HistoriqueByUtilisateurControleur, '/historique_actions/utilisateur/<int:utilisateur_id>')
    api.add_resource(HistoriqueByAccesControleur, '/historique_actions/acces/<int:acces_id>')
