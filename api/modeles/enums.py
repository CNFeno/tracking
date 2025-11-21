import enum

class RoleEnum(enum.Enum):
    ADMIN = "ADMIN"
    VIEWER = "VIEWER"

class ActionEnum(enum.Enum):
    creation = "creation"
    deletion = "deletion"
    suspension = "suspension"
    update = "update"

class AuthTypeEnum(enum.Enum):
    LOCAL = "LOCAL"
    LDAP = "LDAP"

