import pymongo
from pymongo import MongoClient

# MongoDB configuration
mongo_client = MongoClient("mongodb+srv://linga2522004:bMAgre9xvbppIapO@clustergen.xewkcgr.mongodb.net/?retryWrites=true&w=majority")
db = mongo_client["GenE"]
tutor_collection = db["tutors"]

# Sample tutor data
tutor_data = [
    {"id": 1, "name": "Tutor1", "subject": "Mathematics"},
    {"id": 2, "name": "Tutor2", "subject": "Science"},
    {"id": 3, "name": "Tutor3", "subject": "English Literature"},
]

# Insert tutor data into MongoDB
tutor_collection.insert_many(tutor_data)

