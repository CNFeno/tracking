classDiagram
    class Plateforme {
        +int id
        +String nom
        +String description
        +Date dateCreation
        +Boolean actif
        +ajouterPlateforme()
        +supprimerPlateforme()
        +modifierPlateforme()
    }

    class Acces {
        +int id
        +String login
        +String name
        +String mail
        +ActionEnum action
        +String NumTicket
        +Date dateEnregistremen
        +Date dateModifiction
        +Boolean actif
        +ajouterAcces()
        +modifierAcces()
        +exporterAcces()
        +importerAcces()
    }

    class Utilisateur {
        +int id
        +String nom
        +String email
        +RoleEnum role
        +Date dateCreation
        +Boolean actif
        +seConnecter()
        +modifierProfil()
    }

    class HistoriqueAction {
        +int id
        +String typeAction
        +Date dateAction
        +String description
        +enregistrerAction()
        +consulterHistorique()
    }

    class RoleEnum {
        <<enumeration>>
        ADMIN
        VIEWER
    }

    class ActionEnum {
        <<enumeration>>
        CREATION
        SUPRESSION
        SUSPENSSION
        MODIFICATION
    }

    
    Utilisateur "1" -- "n" HistoriqueAction : effectue
    Plateforme "1" -- "n" Acces : contient
    Acces "n" -- "1" Utilisateur : géré par