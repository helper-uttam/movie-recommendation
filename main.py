from flask import Flask, render_template, request
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

def get_movies():
    orig_data = pd.read_csv('./datasets/processedData_2017.csv')
    return list(orig_data['movie_title'].str.capitalize())


def create_similarity():
    orig_data = pd.read_csv('./datasets/processedData_2017.csv')
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(orig_data['processedCol'])
    similarity = cosine_similarity(count_matrix)
    return orig_data,similarity


def getRecommendedMoviesTitles(mov):
    mov = mov.lower()  #because all the data present in our dataset is in lower case
    try:
        data.head()
        similarity.shape
    except:
        data, similarity = create_similarity()
    # if the movie title that we are quering in createsimilarity didn't matched with any movie in our dataset
    if mov not in data['movie_title'].unique():
        return('Sorry! Your request can not be completed at the movement. Please check if you spelt everything correctly or try with some other movies')
    else:
        i = data.loc[data['movie_title']==mov].index[0]
        lst = list(enumerate(similarity[i])) #indexing each similarity 
        lst = sorted(lst, key = lambda x:x[1] ,reverse=True)
        lst = lst[1:11] # excluding the first item because it is the requested movie itself
        finalList = []
        for i in range(len(lst)):
            item = finalList[i][0]
            finalList.append(data['movie_title'][item])
        return finalList
    

@app.route("/createsimilarity",methods=["POST"])
def get_similarity():
    movie = request.form['title']
    recommended_movie_titles = getRecommendedMoviesTitles(movie)
    print(recommended_movie_titles)
    if type(recommended_movie_titles)==type('string'):
        return recommended_movie_titles
    else:
        m_str=" || ".join(recommended_movie_titles)
        return m_str


@app.route("/")
@app.route("/home")
def home():
    movies = get_movies()
    return render_template('home.html',movies=movies)


@app.route("/recommend",methods=["POST"])
def recommend():
    return render_template('recommendMovie.html')

if __name__ == '__main__':
    app.run(debug=True)
