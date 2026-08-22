import os


class Config:

    BASE_DIR = os.path.abspath(
        os.path.dirname(__file__)
    )

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///" + os.path.join(
            BASE_DIR,
            "dayflow.db"
        )
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "dayflow-development-secret-key"
    )

    JWT_ACCESS_TOKEN_EXPIRES = 3600



    JSON_SORT_KEYS = False
