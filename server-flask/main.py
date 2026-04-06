from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():  
    return 'Hello'

@app.route('/api/users')
def get_users():
    return{
        'users':[   
            {
                'id':1,
                'name':'alice'
                
                },
             {
                'id':2,
                'name':'josue'
                
                },
            ]
    }
    

if __name__ == '__main__':
    app.run(debug=True)