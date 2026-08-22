from datetime import datetime, date

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import db, User


attendance_bp = Blueprint(
    "attendance",
    __name__,
    url_prefix="/api/attendance"
)

class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)

    employee_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    attendance_date = db.Column(
        db.Date,
        nullable=False,
        default=date.today
    )

    check_in = db.Column(
        db.DateTime,
        nullable=True
    )

    check_out = db.Column(
        db.DateTime,
        nullable=True
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Present"
    )

    employee = db.relationship(
        "User",
        backref=db.backref("attendance_records", lazy=True)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "date": self.attendance_date.isoformat(),
            "check_in": (
                self.check_in.isoformat()
                if self.check_in else None
            ),
            "check_out": (
                self.check_out.isoformat()
                if self.check_out else None
            ),
            "status": self.status
        }

@attendance_bp.route("/check-in", methods=["POST"])
@jwt_required()
def check_in():

    user_id = int(get_jwt_identity())

    today = date.today()

    existing = Attendance.query.filter_by(
        employee_id=user_id,
        attendance_date=today
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "message": "Attendance already marked for today"
        }), 400

    attendance = Attendance(
        employee_id=user_id,
        attendance_date=today,
        check_in=datetime.now(),
        status="Present"
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Check-in successful",
        "attendance": attendance.to_dict()
    }), 201

@attendance_bp.route("/check-out", methods=["POST"])
@jwt_required()
def check_out():

    user_id = int(get_jwt_identity())

    today = date.today()

    attendance = Attendance.query.filter_by(
        employee_id=user_id,
        attendance_date=today
    ).first()

    if not attendance:
        return jsonify({
            "success": False,
            "message": "Please check-in first"
        }), 400

    if attendance.check_out:
        return jsonify({
            "success": False,
            "message": "Already checked out"
        }), 400

    attendance.check_out = datetime.now()

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Check-out successful",
        "attendance": attendance.to_dict()
    }), 200

@attendance_bp.route("/my", methods=["GET"])
@jwt_required()
def my_attendance():

    user_id = int(get_jwt_identity())

    records = Attendance.query.filter_by(
        employee_id=user_id
    ).order_by(
        Attendance.attendance_date.desc()
    ).all()

    return jsonify({
        "success": True,
        "attendance": [
            record.to_dict()
            for record in records
        ]
    }), 200

@attendance_bp.route("/all", methods=["GET"])
@jwt_required()
def all_attendance():

    claims = get_jwt()

    role = claims.get("role")

    if role not in ["admin", "hr"]:
        return jsonify({
            "success": False,
            "message": "Access denied"
        }), 403

    records = Attendance.query.order_by(
        Attendance.attendance_date.desc()
    ).all()

    result = []

    for record in records:

        employee = User.query.get(record.employee_id)

        data = record.to_dict()

        if employee:
            data["employee"] = {
                "id": employee.id,
                "employee_id": employee.employee_id,
                "email": employee.email
            }

        result.append(data)

    return jsonify({
        "success": True,
        "attendance": result
    }), 200
