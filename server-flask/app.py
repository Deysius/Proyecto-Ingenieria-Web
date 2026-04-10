from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import uuid

app = Flask(__name__)
CORS(app)

server = 'localhost'
database = 'LoginDB'
driver = 'ODBC Driver 17 for SQL Server'

app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc://@{server}/{database}?driver={driver.replace(' ', '+')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

tokens = {}

class AuthUser(db.Model):
    __tablename__ = 'AuthUsers'

    Id = db.Column(db.Integer, primary_key=True)
    Username = db.Column(db.String(50), unique=True, nullable=False)
    Password = db.Column(db.String(255), nullable=False)


class Ruta(db.Model):
    __tablename__ = 'Rutas'

    Id = db.Column(db.Integer, primary_key=True)
    Nombre = db.Column(db.String(100))
    Origen = db.Column(db.String(100))
    Destino = db.Column(db.String(100))
    HoraSalida = db.Column(db.String(10))
    HoraLlegada = db.Column(db.String(10))

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token or token not in tokens:
            return jsonify({"message": "No autorizado"}), 401

        return f(*args, **kwargs)

    return decorated
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if AuthUser.query.filter_by(Username=username).first():
        return jsonify({"message": "Usuario ya existe"}), 400

    hashed = generate_password_hash(password)

    new_user = AuthUser(Username=username, Password=hashed)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario creado"})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = AuthUser.query.filter_by(Username=username).first()

    if user and check_password_hash(user.Password, password):
        token = str(uuid.uuid4())
        tokens[token] = username
        return jsonify({"message": "Login correcto", "token": token}), 200
    else:
        return jsonify({"message": "Credenciales incorrectas"}), 401
    
@app.route('/api/rutas', methods=['GET'])
@token_required
def get_rutas():
    rutas = Ruta.query.all()
    return jsonify({
        "rutas": [
            {
                "id": r.Id,
                "nombre": r.Nombre,
                "origen": r.Origen,
                "destino": r.Destino,
                "hora_salida": r.HoraSalida,
                "hora_llegada": r.HoraLlegada
            }
            for r in rutas
        ]
    })

@app.route('/api/rutas', methods=['POST'])
@token_required
def add_ruta():
    data = request.json

    nueva = Ruta(
        Nombre=data.get('nombre'),
        Origen=data.get('origen'),
        Destino=data.get('destino'),
        HoraSalida=data.get('hora_salida'),
        HoraLlegada=data.get('hora_llegada')
    )

    db.session.add(nueva)
    db.session.commit()

    return jsonify({"message": "Ruta creada"})

@app.route('/api/rutas/<int:id>', methods=['PUT'])
@token_required
def update_ruta(id):
    ruta = Ruta.query.get(id)

    if not ruta:
        return jsonify({"message": "Ruta no encontrada"}), 404

    data = request.json

    ruta.Nombre = data.get('nombre')
    ruta.Origen = data.get('origen')
    ruta.Destino = data.get('destino')
    ruta.HoraSalida = data.get('hora_salida')
    ruta.HoraLlegada = data.get('hora_llegada')

    db.session.commit()

    return jsonify({"message": "Ruta actualizada"})

@app.route('/api/rutas/<int:id>', methods=['DELETE'])
@token_required
def delete_ruta(id):
    ruta = Ruta.query.get(id)

    if not ruta:
        return jsonify({"message": "No encontrada"}), 404

    db.session.delete(ruta)
    db.session.commit()

    return jsonify({"message": "Eliminada"})


if __name__ == '__main__':
    app.run(debug=True)