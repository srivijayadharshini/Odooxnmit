from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from auth import auth_bp
from attendance import attendance_bp
from leave import leave_bp


app = Flask(__name__)

app.config.from_object(Config)

CORS(app)

db.init_app(app)

jwt = JWTManager(app)


app.register_blueprint(auth_bp)

app.register_blueprint(attendance_bp)

app.register_blueprint(leave_bp)



@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "Welcome to Dayflow HRMS API"
    })



@app.route("/api/health")
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "message": "Dayflow API is running"
    })


@app.route("/api")
def api_info():
    return jsonify({
        "application": "Dayflow HRMS",
        "version": "1.0.0",
        "modules": [
            "Authentication",
            "Attendance",
            "Leave Management"
        ],
        "status": "running"
    })



@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
