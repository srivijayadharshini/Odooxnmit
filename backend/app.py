from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow requests from React frontend
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Dayflow HRMS Backend is running"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "message": "Dayflow API is healthy"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)