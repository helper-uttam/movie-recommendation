from crypt import methods
from flask import Flask
from main import app
from user.models import User

@app.route('/user/signup', methods=['GET'])
def signup():
    return User().signup()