from controleurs.plateforme_controleur import PlateformeControleur

def init_plateforme_routes(api):
    api.add_resource(PlateformeControleur, '/plateformes', '/plateformes/<int:plateforme_id>')
