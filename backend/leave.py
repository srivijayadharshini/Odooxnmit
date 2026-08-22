from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import db, User
leave_bp = Blueprint(
    "leave",
    __name__,
    url_prefix="/api/leave"
)
class LeaveRequest(db.Model):
    __tablename__ = "leave_requests"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    employee_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    leave_type = db.Column(
        db.String(30),
        nullable=False
    )

    start_date = db.Column(
        db.Date,
        nullable=False
    )

    end_date = db.Column(
        db.Date,
        nullable=False
    )

    remarks = db.Column(
        db.Text,
        nullable=True
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )

    admin_comment = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    employee = db.relationship(
        "User",
        backref=db.backref("leave_requests", lazy=True)
    )

    def to_dict(self):

        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "leave_type": self.leave_type,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "remarks": self.remarks,
            "status": self.status,
            "admin_comment": self.admin_comment,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }

@leave_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply_leave():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    leave_type = data.get("leave_type")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    remarks = data.get("remarks", "")

    # Validate fields
    if not leave_type or not start_date or not end_date:
        return jsonify({
            "success": False,
            "message": "Leave type, start date and end date are required"
        }), 400

    # Validate leave type
    allowed_types = [
        "Paid",
        "Sick",
        "Unpaid"
    ]

    if leave_type not in allowed_types:
        return jsonify({
            "success": False,
            "message": "Invalid leave type"
        }), 400

    try:
        start = datetime.strptime(
            start_date,
            "%Y-%m-%d"
        ).date()

        end = datetime.strptime(
            end_date,
            "%Y-%m-%d"
        ).date()

    except ValueError:

        return jsonify({
            "success": False,
            "message": "Date must be in YYYY-MM-DD format"
        }), 400

    if end < start:

        return jsonify({
            "success": False,
            "message": "End date cannot be before start date"
        }), 400

    leave_request = LeaveRequest(
        employee_id=user_id,
        leave_type=leave_type,
        start_date=start,
        end_date=end,
        remarks=remarks,
        status="Pending"
    )

    db.session.add(leave_request)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Leave request submitted successfully",
        "leave_request": leave_request.to_dict()
    }), 201


@leave_bp.route("/my", methods=["GET"])
@jwt_required()
def my_leave_requests():

    user_id = int(get_jwt_identity())

    requests = LeaveRequest.query.filter_by(
        employee_id=user_id
    ).order_by(
        LeaveRequest.created_at.desc()
    ).all()

    return jsonify({
        "success": True,
        "leave_requests": [
            leave.to_dict()
            for leave in requests
        ]
    }), 200


@leave_bp.route("/all", methods=["GET"])
@jwt_required()
def all_leave_requests():

    claims = get_jwt()

    role = claims.get("role")

    if role not in ["admin", "hr"]:

        return jsonify({
            "success": False,
            "message": "Access denied"
        }), 403

    requests = LeaveRequest.query.order_by(
        LeaveRequest.created_at.desc()
    ).all()

    result = []

    for leave in requests:

        data = leave.to_dict()

        employee = User.query.get(
            leave.employee_id
        )

        if employee:
            data["employee"] = {
                "id": employee.id,
                "employee_id": employee.employee_id,
                "email": employee.email
            }

        result.append(data)

    return jsonify({
        "success": True,
        "leave_requests": result
    }), 200


@leave_bp.route("/<int:leave_id>/approve", methods=["PUT"])
@jwt_required()
def approve_leave(leave_id):

    claims = get_jwt()

    role = claims.get("role")

    if role not in ["admin", "hr"]:

        return jsonify({
            "success": False,
            "message": "Access denied"
        }), 403

    leave_request = LeaveRequest.query.get(
        leave_id
    )

    if not leave_request:

        return jsonify({
            "success": False,
            "message": "Leave request not found"
        }), 404

    if leave_request.status != "Pending":

        return jsonify({
            "success": False,
            "message": "Leave request has already been processed"
        }), 400

    data = request.get_json() or {}

    leave_request.status = "Approved"

    leave_request.admin_comment = data.get(
        "comment",
        ""
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Leave approved successfully",
        "leave_request": leave_request.to_dict()
    }), 200


@leave_bp.route("/<int:leave_id>/reject", methods=["PUT"])
@jwt_required()
def reject_leave(leave_id):

    claims = get_jwt()

    role = claims.get("role")

    if role not in ["admin", "hr"]:

        return jsonify({
            "success": False,
            "message": "Access denied"
        }), 403

    leave_request = LeaveRequest.query.get(
        leave_id
    )

    if not leave_request:

        return jsonify({
            "success": False,
            "message": "Leave request not found"
        }), 404

    if leave_request.status != "Pending":

        return jsonify({
            "success": False,
            "message": "Leave request has already been processed"
        }), 400

    data = request.get_json() or {}

    leave_request.status = "Rejected"

    leave_request.admin_comment = data.get(
        "comment",
        ""
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Leave rejected successfully",
        "leave_request": leave_request.to_dict()
    }), 200
