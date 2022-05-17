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
            item = lst[i][0]
            finalList.append(data['movie_title'][item])
        return finalList

# converting list of string to list (eg. "["abc","def"]" to ["abc","def"])
def stringToList(my_list):
    my_list = my_list.split('","')
    my_list[0] = my_list[0].replace('["','')
    my_list[-1] = my_list[-1].replace('"]','')
    return my_list    

@app.route("/createsimilarity",methods=["POST"])
def get_similarity():
    title = request.form['title']
    recommended_movie_titles = getRecommendedMoviesTitles(title)
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


@app.route("/recommendmovies",methods=["POST"])
def recommend():
    # getting data from AJAX request
    title = request.form['title']
    cast_ids = request.form['cast_ids']
    cast_names = request.form['cast_names']
    cast_characters = request.form['cast_characters']
    cast_bdays = request.form['cast_bdays']
    cast_bios = request.form['cast_bios']
    cast_places = request.form['cast_places']
    cast_profiles = request.form['cast_profiles']
    poster = request.form['poster']
    genres = request.form['genres']
    overview = request.form['overview']
    vote_average = request.form['rating']
    vote_count = request.form['vote_count']
    release_date = request.form['release_date']
    runtime = request.form['runtime']
    status = request.form['status']
    rec_movies = request.form['rec_movies']
    rec_posters = request.form['rec_posters']


    # call the stringToList function for every string that needs to be converted to list
    rec_movies = stringToList(rec_movies)
    rec_posters = stringToList(rec_posters)
    cast_names = stringToList(cast_names)
    cast_characters = stringToList(cast_characters)
    cast_profiles = stringToList(cast_profiles)
    cast_bdays = stringToList(cast_bdays)
    cast_bios = stringToList(cast_bios)
    cast_places = stringToList(cast_places)
    
    # converting string to list (eg. "[a,b,c]" to [a,b,c])
    cast_ids = cast_ids.split(',')
    cast_ids[0] = cast_ids[0].replace("[","")
    cast_ids[-1] = cast_ids[-1].replace("]","")
    
    # rendering the string to python string
    for i in range(len(cast_bios)):
        cast_bios[i] = cast_bios[i].replace(r'\n', '\n').replace(r'\"','\"')
    
    # to preserve the order of information and make it easier to process inside html file, combining all the list as dict
    movie_cards = {rec_posters[i]: rec_movies[i] for i in range(len(rec_posters))}
    
    casts = {cast_names[i]:[cast_ids[i], cast_characters[i], cast_profiles[i]] for i in range(len(cast_profiles))}
    
    cast_details = {cast_names[i]:[cast_ids[i], cast_profiles[i], cast_bdays[i], cast_places[i], cast_bios[i]] for i in range(len(cast_places))}
 
    return render_template('recommendMovie.html',title=title, casts=casts, overview=overview, poster=poster,
        vote_count=vote_count,release_date=release_date,runtime=runtime,status=status, vote_average=vote_average, genres=genres,
        movie_cards=movie_cards,cast_details=cast_details)

if __name__ == '__main__':
    app.run(debug=True)
