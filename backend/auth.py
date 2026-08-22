from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from models import db, User

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)

@auth_bp.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    employee_id = data.get("employee_id")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "employee").lower()

    if not employee_id or not email or not password:
        return jsonify({
            "success": False,
            "message": "Employee ID, email and password are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters"
        }), 400

    allowed_roles = ["employee", "hr", "admin"]
    if role not in allowed_roles:
        return jsonify({
            "success": False,
            "message": "Invalid role"
        }), 400

    existing_employee = User.query.filter_by(
        employee_id=employee_id
    ).first()
    if existing_employee:
        return jsonify({
            "success": False,
            "message": "Employee ID already exists"
        }), 409

    existing_email = User.query.filter_by(
        email=email
    ).first()

    if existing_email:
        return jsonify({
            "success": False,
            "message": "Email already exists"
        }), 409

    user = User(
        employee_id=employee_id,
        email=email,
        role=role
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Account created successfully",
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    if not user or not user.check_password(password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "employee_id": user.employee_id
        }
    )

    return jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/role", methods=["GET"])
@jwt_required()
def get_current_role():

    claims = get_jwt()

    return jsonify({
        "success": True,
        "role": claims.get("role"),
        "employee_id": claims.get("employee_id")
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():

    return jsonify({
        "success": True,
        "message": "Logout successful"
    }), 200
