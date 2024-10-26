import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegressionCV
from sklearn.pipeline import Pipeline

# Extended training data with more unique phrases per command type
sentences = [
    # RTL variations
    "return to land", "return to base", "come home", "go home", "rtn to land", "rtn to base", 
    "rtn home", "come back to base", "rtn to location", "return to starting point", 
    "rto", "head back home", "rt", "rtn to base", "rtl",
    *["return to land immediately"] * 89,  # Total 100 samples for RTL

    # ELZ variations with distinct phrases
    "emergency landing", "emergency landing zone", "elz emergency", "emergency lz", 
    "land immediately in safe zone", "urgent emergency landing required", "elz at location", 
    "initiate emergency landing", "find emergency landing area", "perform emergency landing",
    *["emergency landing required"] * 90,  # Total 100 samples for ELZ

    # FLY TO variations
    "fly to waypoint 1", "go to waypoint 1", "fly to address", "proceed to waypoint 2", 
    "navigate to location", "fly to specified address", "travel to marked waypoint", 
    *["proceed to destination"] * 89,  # Total 100 samples for FLY TO

    # Other command types...
    *["hover drone in current position"] * 100,
    *["orbit drone in current position"] * 100,
    *["heading 90 degrees"] * 100,
    *["tilt to 45 degrees"] * 100,
]

# Corresponding labels for each command type
commands = (
    ["RTL"] * 100 + ["ELZ"] * 100 + ["FLY TO"] * 100 + 
    ["HOVER"] * 100 + ["ORBIT"] * 100 + ["HEADING"] * 100 + ["TILT"] * 100
)

# Preprocessing function to standardize commands
def preprocess_text(cmd, keyword="blackbird"):
    cmd = re.sub(rf'\b{keyword}\b', '', cmd, flags=re.IGNORECASE).strip()
    cmd = re.sub(r'\b(fly to|flight to|flight)\b', 'fly to', cmd, flags=re.IGNORECASE)
    return cmd

# Direction mapping for headings
direction_to_heading = {
    "north": 0,
    "northeast": 45,
    "east": 90,
    "southeast": 135,
    "south": 180,
    "southwest": 225,
    "west": 270,
    "northwest": 315,
}

# Pipeline with logistic regression cross-validation
pipeline = Pipeline([
    ('vectorizer', TfidfVectorizer(ngram_range=(1, 1))),  # Unigrams only
    ('classifier', LogisticRegressionCV(cv=5, max_iter=1000, Cs=[0.01, 0.1, 1, 10], random_state=0))
])

# Train the model
pipeline.fit(sentences, commands)

# Command classification function with handling for "FLY TO" variations
def classify_command(cmd):
    preprocessed_cmd = preprocess_text(cmd)
    classification = pipeline.predict([preprocessed_cmd])[0]
    
    # Check if the command is a "FLY TO" and append everything that follows
    if classification == "FLY TO":
        # Find the position of "fly to" in the preprocessed command
        fly_to_index = preprocessed_cmd.lower().find("fly to")
        if fly_to_index != -1:
            return f"FLY TO - {preprocessed_cmd[fly_to_index + len('fly to'):].strip()}"

    if classification == "TILT":
        # Find the position of "tilt" in the preprocessed command
        tilt_index = preprocessed_cmd.lower().find("tilt")
        if tilt_index != -1:
            return f"TILT - {preprocessed_cmd[tilt_index + len('tilt'):].strip()} Degrees"   
         
     # Check for HEADING command
    if classification == "HEADING":
        heading_index = preprocessed_cmd.lower().find("heading")
        if heading_index != -1:
            heading_value = preprocessed_cmd[heading_index + len('heading'):].strip()
            # Check if it's a valid direction or a number
            if heading_value in direction_to_heading:
                return f"HEADING - {direction_to_heading[heading_value]}"
            # Check if it's a number
            elif heading_value.isdigit():
                return f"HEADING - {heading_value}"
            else:
                return "HEADING - Invalid input"

    
    return classification


