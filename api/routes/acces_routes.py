#acces_routes.py
from controleurs.acces_controleur import AccesControleur, AccesImportControleur

def init_acces_routes(api):
    api.add_resource(AccesImportControleur, '/acces/import')
    api.add_resource(AccesControleur, '/acces', '/acces/<int:acces_id>')
