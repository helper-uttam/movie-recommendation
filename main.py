from flask import Flask, render_template, request
import numpy as np
import pandas as pd

app = Flask(__name__)

def get_movies():
    orig_data = pd.read_csv('./datasets/processedData_2017.csv')
    return list(orig_data['movie_title'].str.capitalize())


@app.route("/")
@app.route("/home")
def home():
    movies = get_movies()
    print(movies[:10])
    return render_template('home.html',movies=movies)


@app.route("/recommend",methods=["POST"])
def recommend():
    return render_template('recommendMovie.html')

if __name__ == '__main__':
    app.run(debug=True)
