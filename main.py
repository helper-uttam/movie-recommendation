from flask import Flask, request, session, render_template 
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pymongo
import json
from bson.objectid import ObjectId
import numpy as np

# for NLP
import pickle
# for Web Scrapping 
import urllib.request
import bs4 as bs




app = Flask(__name__)


####### Connecting Database (MongoDB) #####
##############################################
try:
    mongo = pymongo.MongoClient('_____MONGO_URL______')
    db = mongo.user
    mongo.server_info()
except Exception as e:
    print(e)
    print("Can not connect to database")

#######################################
#######################################


classifier = pickle.load(open('./datasets/sentimentAnalysis.pkl', 'rb'))
vectorizer = pickle.load(open('./datasets/tranform.pkl','rb'))


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
    except Exception as ex:
        data, similarity = create_similarity()
    # if the movie title that we are quering in createsimilarity didn't matched with any movie in our dataset
    if mov not in data['movie_title'].unique():
        return("Not present in CSV file")
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


@app.route("/home", methods=["GET"])
# @app.route('/', methods=["GET"])
def home():
    movies = get_movies()
    return render_template('home.html',movies=movies) # passing all the name of movies from our dataset to feed jQuery autocomplete feature


@app.route("/recommendmovies",methods=["POST"])
def recommend():
    ids = request.form['ids']
    names = request.form['names']
    characters = request.form['characters']
    bdays = request.form['bdays']
    bios = request.form['bios']
    places = request.form['places']
    images = request.form['profiles']
    poster = request.form['poster']
    overview = request.form['overview']
    release_date = request.form['release_date']
    runtime = request.form['runtime']
    vote_average = request.form['rating']
    total_votes = request.form['vote_count']
    status = request.form['status']
    movie_title = ''
    movies = []
    movie_posters = []
    movie_cards = []
    genres = request.form['genres']
    imdb_id = request.form['imdb_id']
    try:
        movie_title = request.form['title']
        movies = request.form['movies']
        movie_posters = request.form['posters']
        movies = stringToList(movies)
        movie_posters = stringToList(movie_posters)
        movie_cards = {movie_posters[index]: movies[index] for index in range(len(movie_posters))}
    except Exception as e:
        print(e)
        print("Can't fetch similar movies for this movie")

    # call the stringToList function for every string that needs to be converted to list
    names = stringToList(names)
    characters = stringToList(characters)
    images = stringToList(images)
    bdays = stringToList(bdays)
    bios = stringToList(bios)
    places = stringToList(places)
    
    ids = ids.split(',')
    ids[0] = ids[0].replace("[","")
    ids[-1] = ids[-1].replace("]","")
    
    # rendering the string to python string
    for index in range(len(bios)):
        bios[index] = bios[index].replace(r'\n', '\n').replace(r'\"','\"')
    
    # to preserve the order of information and make it easier to process inside html file, combining all the list as dict
    casts = {names[index]:[ids[index], characters[index], images[index], bdays[index]] for index in range(len(images))}
    details = {names[index]:[ids[index], images[index], bdays[index], places[index], bios[index]] for index in range(len(places))}
    
    # web scraping to get user reviews from IMDB site
    movie_reviews = {}
    if len(imdb_id) > 0:
        sauce = urllib.request.urlopen('https://www.imdb.com/title/{}/reviews?ref_=tt_ov_rt'.format(imdb_id)).read()
        soup = bs.BeautifulSoup(sauce,'lxml')
        soup_result = soup.find_all("div",{"class":"text show-more__control"})

        reviews_list = [] # list of reviews
        processed_reviews = [] # list of comments (good or bad)
        i = 1
        for reviews in soup_result:
            # Taking only first five reviews
            # .string menthod is decoding the html encoding
            if reviews.string and i<=5:
                reviews_list.append(reviews.string)
                # passing the review to our model after converting into vectors
                movie_review_list = np.array([reviews.string])
                review_vector = vectorizer.transform(movie_review_list)
                prediction = classifier.predict(review_vector)
                processed_reviews.append('Liked' if prediction else 'Disliked')
                i = i+1

        reviews_dict = {reviews_list[i]: processed_reviews[i] for i in range(len(reviews_list))}     


    return render_template('recommendMovie.html',title=movie_title, casts=casts, overview=overview, poster=poster,
        total_votes=total_votes,release_date=release_date,runtime=runtime,status=status, vote_average=vote_average, genres=genres,
        movie_cards=movie_cards,details=details, reviews=reviews_dict)
    

@app.route('/', methods=["GET"])
def authenticate():
    if 'username' in session:
        session.pop('username', None)
        movies = get_movies()
        return render_template('home.html',movies=movies)
    else:
        return render_template('auth.html')



###########################################
            # MongoDB routes
###############################################

# for session
app.secret_key = b'_5#hh"F4Q8z\n\xec]/'

@app.route("/signup", methods=["GET", "POST"])
def create_user():
    try:
        if request.method == 'POST':
            existing_user = db.user.find_one({'username': request.form["username"]})
            if existing_user is None:
                user = {
                    "username":request.form["username"],
                    "LikedMovie": request.form["LikedMovie"],
                    }
                print(user)
                dbResponse = db.user.insert_one(user)
                session["username"] = request.form["username"]
                return json.dumps({
                    "message":"Data Inserted",
                    "MessageID":f"{dbResponse.inserted_id}",
                    "username":request.form["username"], 
                })
            else:
                return json.dumps({
                    "message":"User already exsist"
                })
        else:
            return render_template('auth.html')
    except Exception as e:
        print(e)
        return json.dumps({
            "message":"Can not add records!"
        })




@app.route("/users", methods=["GET"])
def findUser():
    try:
        data = list(db.user.find())

        # converting dtype (ObjectID -> String)
        for user in data:
            user["_id"] = str(user["_id"])

        return json.dumps({
            "data " : data
        })
    except Exception as e:
        return json.dumps({
            "message":"Can not find records!"
        })


@app.route("/user/<username>", methods=["GET"])
def findOneUser(username):
    try:
        data = db.user.find_one({"username": username})
        return json.dumps({
            "data":data["LikedMovie"]
        })
    except Exception as e:
        print(e)
        return json.dumps({
            "message":"Can not find records!"
        })


@app.route("/user/<id>", methods=["PATCH"])
def update_user(id):
    try:
        dbResponse = db.user.update_one(
            {"_id":ObjectId(id)}, #previous  
            {"$set":{"username":request.form["username"]}} #after updating
        )
        if dbResponse.modified_count == 1:
            return json.dumps({
                "message":"Successfuly updated"
            })
        else:
            return json.dumps({
                "message":"Nothing to update"
            })
    except:
        return json.dumps({
            "message":"Can not update records!"
        })




@app.route("/user", methods=["DELETE"])
def delete_user():
    try:
        session.pop('username', None)
        dbResponse = db.user.delete_many({})
        if dbResponse.deleted_count >= 1:
            return json.dumps({
                "message":"Successfuly Deleted"
            })
        else:
            return json.dumps({
                "message":"Nothing to Delete"
            })
    except Exception as e:
        print(e)
        return json.dumps({
            "message":"Can not delete records!"
        })

if __name__ == '__main__':
    app.run(debug=True)
