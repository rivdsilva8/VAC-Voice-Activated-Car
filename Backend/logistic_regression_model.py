import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Prepare and train model only once
sentences = [
    "car turn left", "turn the car left", "please turn left",
    "turn right", "steer to the right", "move right", 
    "speed up", "accelerate forward", "go faster",
    "stop the car", "apply brake", "halt",
    "move in reverse", "go backwards", "reverse now"
]
commands = ["LEFT", "LEFT", "LEFT", "RIGHT", "RIGHT", "RIGHT", 
            "ACCELERATE", "ACCELERATE", "ACCELERATE", 
            "BRAKE", "BRAKE", "BRAKE", 
            "REVERSE", "REVERSE", "REVERSE"]

vectorizer = TfidfVectorizer()
X_train = vectorizer.fit_transform(sentences)
model = LogisticRegression()
model.fit(X_train, commands)

def preprocess_text(cmd, keyword="blackbird"):
    # Use regex to remove the keyword, case-insensitive
    return re.sub(rf'\b{keyword}\b', '', cmd, flags=re.IGNORECASE).strip()

def classify_command(cmd):
    preprocessed_cmd = preprocess_text(cmd)  # Remove keyword
    cmd_vec = vectorizer.transform([preprocessed_cmd])
    return model.predict(cmd_vec)[0]
