# Movie Recommendation System
This application is based on **content based filtering** and uses **cosine similarity** to differentiate between multiple movies in multi-dimension space of vectors on the basis of all the different name of the casts , and the genres (eg: action, horror).  


# Requriements

**Highly Recommended**:

According to my personal PC specification (windowsOS x64) all the requirements are listed in [requirements.txt](https://github.com/helper-uttam/movie-recommendation/blob/master/requirements.txt) file. 
```
- Python >= 3.8 
- Flask == 1.1.1
- Jinja2 == 2.11.3
- MarkupSafe == 1.1.1
- Werkzeug == 0.15.5
- numpy >= 1.9.2
- scipy >= 0.15.1
- nltk == 3.5
- scikit-learn >= 0.18
- pandas>=0.19
- jsonschema==3.2.0
- tmdbv3api==1.6.1
- lxml==4.6.3
- urllib3==1.26.5
- requests==2.23.0
- pickleshare==0.7.5
- bs4
- tmdbv3api==1.6.1
- beautifulsoup4==4.9.1
- pickleshare==0.7.5
- pymongo==4.1.1
```

## Required Credentials
> MONGO_URL - Replace `__MONGO_URL__` with your Database collection url in *main.py* 

> API_KEY  - Replace `__API_KEY__` with your own API KEY 4times in *recommend.js* file

**Suggestion (optional)** - Install [virtual environment](https://www.pythoncentral.io/how-to-install-virtualenv-python/) before installing the requirements.

# Running into local machine:
Install all the requirements mentioned above or the requirements mentioned in the [requirements.txt](https://github.com/helper-uttam/movie-recommendation/blob/master/requirements.txt) file (recommended),
by running 
```
pip install -r .\requirements.txt
```
command in the same directory where requirements.txt resides.

Now after installing all the requirements, run
```
python main.py
```

Please ensure to have all the nessasary credentials, **MongoDB Collection URL** and the **API KEY**.
