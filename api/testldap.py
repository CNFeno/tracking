from ldap3 import Server, Connection, ALL, ALL_ATTRIBUTES

server = Server('ldap://tdcp02wp:389', get_info=ALL)
conn = Connection(server, user='TELMA\\cedrix', password='Kay24Warda!&7ced', auto_bind=True)

if conn.bind():
    print("[✔] Connexion à Active Directory réussie.")

    conn.search(
        search_base='DC=corp,DC=telma,DC=mg',
        search_filter='(sAMAccountName=cedrix)',
        #attributes=['sAMAccountName', 'givenName', 'sn', 'displayName', 'mail']
        attributes=ALL_ATTRIBUTES
    )

    print(f"[*] Utilisateurs trouvés : {len(conn.entries)}\n")

    #for entry in conn.entries:
    #    login = entry.sAMAccountName.value
    #    nom = entry.displayName.value or f"{entry.givenName.value or ''} {entry.sn.value or ''}".strip()
    #    email = entry.mail.value

    #    print(f"Login       : {login}")
    #    print(f"Nom complet : {nom}")
    #    print(f"Email       : {email}")
    #    print("-" * 40)
# Affichage de tous les attributs
    for entry in conn.entries:
        print("=== Détails du compte Active Directory ===")
        for attr in entry.entry_attributes:
            print(f"{attr} : {entry[attr].value}")
        print("=" * 50)
else:
    print("[✖] Échec de connexion :", conn.result)

""" for entry in conn.entries:
    print(entry) """
