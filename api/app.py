#from routes.auth_routes import init_auth_routes
from routes.dash_routes import init_dash_routes
from routes.historique_action_routes import init_historique_action_routes
from routes.acces_routes import init_acces_routes
from routes.plateforme_routes import init_plateforme_routes
from config import create_app, db
from routes.utilisateur_routes import init_routes

app, api = create_app()
init_dash_routes(api)
init_routes(api)
init_plateforme_routes(api)
init_acces_routes(api)
init_historique_action_routes(api)

with app.app_context():
    db.create_all()  # Crée les tables en fonction des modèles

if __name__ == '__main__':
    app.run(debug=True)
