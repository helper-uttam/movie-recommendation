from flask import Flask, render_template, request
import numpy as np
import pandas as pd
import bs4 as bs

app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home():
    return render_template('home.html')


@app.route("/recommend",methods=["POST"])
def recommend():
    return render_template('recommendMovie.html')

if __name__ == '__main__':
    app.run(debug=True)
