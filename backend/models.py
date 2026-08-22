from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash



db = SQLAlchemy()

class User(db.Model):

    __tablename__ = "users"


    id = db.Column(
        db.Integer,
        primary_key=True
    )

   
    employee_id = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

 
    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    
    role = db.Column(
        db.String(20),
        nullable=False,
        default="employee"
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )

    def set_password(self, password):

        self.password_hash = generate_password_hash(
            password
        )

    def check_password(self, password):

        return check_password_hash(
            self.password_hash,
            password
        )


    def to_dict(self):

        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active
        }


    def __repr__(self):

        return (
            f"<User "
            f"{self.employee_id} "
            f"{self.email} "
            f"{self.role}>"
        )
