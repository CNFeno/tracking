from controleurs.auth_controleur import AuthControleur

def init_auth_routes(api):
    api.add_resource(AuthControleur, '/login')
